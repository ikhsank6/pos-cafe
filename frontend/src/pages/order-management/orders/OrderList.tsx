import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, type Order, type OrderStatus } from '@/services/order.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError, formatDateTime, formatCurrency } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
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
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparing', color: 'bg-orange-500' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500' },
  { value: 'served', label: 'Served', color: 'bg-teal-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const typeLabels: Record<string, string> = {
  dine_in: 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

export default function OrderList() {
  const navigate = useNavigate();
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
                <p className="font-medium mb-2">Status Order</p>
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
    </div>
  );
}
