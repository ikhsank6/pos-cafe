import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, type Order, type OrderStatus } from '@/services/order.service';
import { transactionService, type PaymentMethod } from '@/services/transaction.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, CreditCard, Loader2 } from 'lucide-react';
import { showSuccess, showError, formatDateTime, formatCurrency } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { useAuthStore } from '@/stores/auth.store';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { MoneyInput } from '@/components/ui/money-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'PREPARING', label: 'Preparing', color: 'bg-orange-500' },
  { value: 'READY', label: 'Ready', color: 'bg-green-500' },
  { value: 'SERVED', label: 'Served', color: 'bg-teal-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
];

const typeLabels: Record<string, string> = {
  dine_in: 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'E_WALLET', label: 'E-Wallet' },
  { value: 'DEBIT_CARD', label: 'Kartu Debit' },
  { value: 'CREDIT_CARD', label: 'Kartu Kredit' },
  { value: 'BANK_TRANSFER', label: 'Transfer Bank' },
];

export default function OrderList() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isOwnerOrAdmin = user?.activeRole?.code === 'ADMIN' || user?.activeRole?.code === 'OWNER';
  const {
    data: orders,
    loading,
    error,
    filters,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    setFilters,
    refresh: fetchOrders,
  } = useTable<Order>('orders', useCallback((p, l, f) => orderService.getAll({ page: p, limit: l, status: f.status, type: f.type }), []));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: status as OrderStatus });
    }
  };

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderUuid: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      await orderService.updateStatus(orderUuid, newStatus);
      showSuccess('Status order berhasil diupdate');
      fetchOrders();
      if (selectedOrder?.uuid === orderUuid) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      showError(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    setDeleting(true);
    try {
      await orderService.delete(orderToDelete.uuid);
      showSuccess('Order berhasil dihapus');
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (error) {
      showError(error);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  // Payment handlers
  const openPaymentDialog = (order: Order) => {
    setOrderToPay(order);
    setPaidAmount(order.total.toString());
    setPaymentMethod('CASH');
    setPaymentNotes('');
    setPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setOrderToPay(null);
    setPaidAmount('');
    setPaymentNotes('');
  };

  const handlePayment = async () => {
    if (!orderToPay) return;
    
    const paid = parseFloat(paidAmount);
    if (isNaN(paid) || paid < orderToPay.total) {
      showError('Jumlah bayar harus >= total tagihan');
      return;
    }

    setProcessingPayment(true);
    try {
      await transactionService.create({
        orderUuid: orderToPay.uuid,
        paymentMethod,
        amountPaid: paid,
        notes: paymentNotes || undefined,
      });
      showSuccess('Pembayaran berhasil diproses!');
      closePaymentDialog();
      fetchOrders();
    } catch (error) {
      showError(error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const changeAmount = orderToPay ? Math.max(0, parseFloat(paidAmount || '0') - orderToPay.total) : 0;

  const getStatusBadge = (status: OrderStatus) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`h-2 w-2 rounded-full ${option?.color || 'bg-gray-500'}`} />
        {option?.label || status}
      </Badge>
    );
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'No. Order',
      cell: (order) => (
        <div className="flex flex-col">
          <span className="font-medium font-mono">{order.orderNumber}</span>
          <span className="text-xs text-muted-foreground">{typeLabels[order.type] || order.type}</span>
        </div>
      ),
    },
    {
      key: 'table',
      header: 'Meja',
      cell: (order) => (
        <span>{order.table ? `Meja ${order.table.number}` : '-'}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Pelanggan',
      cell: (order) => (
        <span className="text-sm">{order.customer?.name || '-'}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      cell: (order) => (
        <span className="text-sm">{order.items?.length || 0} item</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      cell: (order) => (
        <span className="font-medium">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (order) => getStatusBadge(order.status),
    },
    {
      key: 'createdAt',
      header: 'Waktu',
      cell: (order) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
      ),
    },
  ];

  const tableActions: TableActions<Order> = {
    onView: openViewDialog,
    onDelete: isOwnerOrAdmin ? confirmDelete : undefined,
    customActions: [
      {
        label: 'Bayar',
        onClick: openPaymentDialog,
        icon: <CreditCard className="h-4 w-4" />,
        variant: 'default',
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        showCondition: (order: Order) => !['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(order.status),
      },
    ],
  };

  return (
    <div className="w-full">
      <DataTable
        title="Orders"
        description="Kelola pesanan pelanggan."
        headerAction={
          <Button onClick={() => navigate('/admin/order-management/orders/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Order Baru
          </Button>
        }
        data={orders}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchOrders}
        searchPlaceholder="Cari order..."
        statusFilter={{
          value: filters.status || 'all',
          onChange: handleStatusFilter,
          options: [
            { value: 'all', label: 'Semua Status' },
            ...statusOptions.map(o => ({ value: o.value, label: o.label })),
          ],
        }}
        emptyMessage="Belum ada order."
        keyExtractor={(order) => order.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" preventInteractOutside>
          <DialogHeader>
            <DialogTitle>Detail Order</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipe</p>
                  <p className="font-medium">{typeLabels[selectedOrder.type] || selectedOrder.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meja</p>
                  <p className="font-medium">{selectedOrder.table ? `Meja ${selectedOrder.table.number}` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">{selectedOrder.customer?.name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-medium text-sm">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <p className="font-medium">Status Order</p>
                <p className="text-[11px] text-muted-foreground mb-3 italic">
                  Gunakan pilihan di bawah ini untuk memperbarui tahapan pesanan saat ini.
                </p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(val) => handleStatusUpdate(selectedOrder.uuid, val as OrderStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-3">
                <p className="font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.uuid} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{item.product?.name}</span>
                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                        {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                      </div>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Pajak</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-1">Catatan</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Order"
        description={`Apakah Anda yakin ingin menghapus order #${orderToDelete?.orderNumber}? Tindakan ini akan mengosongkan meja jika order ini adalah Dine In.`}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={closePaymentDialog}>
        <DialogContent className="max-w-md" preventInteractOutside>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Proses Pembayaran
            </DialogTitle>
            <DialogDescription>Order #{orderToPay?.orderNumber}</DialogDescription>
          </DialogHeader>
          
          {orderToPay && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipe</span>
                  <span className="font-medium">{typeLabels[orderToPay.type]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meja</span>
                  <span className="font-medium">{orderToPay.table ? `Meja ${orderToPay.table.number}` : '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{orderToPay.items?.length || 0} item</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-600">{formatCurrency(orderToPay.total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Metode Pembayaran <span className="text-red-500">*</span></Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map(pm => (
                      <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Paid Amount */}
              <div className="space-y-2">
                <Label>Jumlah Bayar <span className="text-red-500">*</span></Label>
                <MoneyInput
                  placeholder="Masukkan jumlah bayar"
                  value={paidAmount}
                  onValueChange={(values) => setPaidAmount(values.value)}
                />
                {(parseFloat(paidAmount) < orderToPay.total && paidAmount !== '') && (
                  <p className="text-xs text-red-500">Jumlah bayar kurang dari total tagihan</p>
                )}
              </div>

              {/* Change Amount */}
              {changeAmount > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Kembalian</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(changeAmount)}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Catatan (opsional)</Label>
                <Input
                  placeholder="Catatan transaksi..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closePaymentDialog} disabled={processingPayment}>
              Batal
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processingPayment || !paidAmount || parseFloat(paidAmount) < (orderToPay?.total || 0)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {processingPayment ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                <><CreditCard className="mr-2 h-4 w-4" /> Proses Pembayaran</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
