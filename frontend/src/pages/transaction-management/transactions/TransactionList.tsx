import { useState, useCallback } from 'react';
import { transactionService, type Transaction, type TransactionStatus, type PaymentMethod } from '@/services/transaction.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { showSuccess, showError, formatDateTime, formatCurrency } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusOptions: { value: TransactionStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-red-500' },
  { value: 'FAILED', label: 'Failed', color: 'bg-gray-500' },
];

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Tunai',
  DEBIT_CARD: 'Kartu Debit',
  CREDIT_CARD: 'Kartu Kredit',
  E_WALLET: 'E-Wallet',
  QRIS: 'QRIS',
  BANK_TRANSFER: 'Transfer Bank',
};

export default function TransactionList() {
  const {
    data: transactions,
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
    refresh: fetchTransactions,
  } = useTable<Transaction>('transactions', useCallback((p, l, f) => transactionService.getAll({ page: p, limit: l, status: f.status }), []));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState<Transaction | null>(null);

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: status as TransactionStatus });
    }
  };

  const openViewDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
  };

  const confirmRefund = (transaction: Transaction) => {
    setTransactionToRefund(transaction);
    setRefundDialogOpen(true);
  };

  const handleRefund = async () => {
    if (!transactionToRefund) return;
    try {
      await transactionService.refund(transactionToRefund.uuid, 'Refund by admin');
      showSuccess('Transaksi berhasil di-refund');
      fetchTransactions();
    } catch (error) {
      showError(error);
    } finally {
      setRefundDialogOpen(false);
      setTransactionToRefund(null);
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`h-2 w-2 rounded-full ${option?.color || 'bg-gray-500'}`} />
        {option?.label || status}
      </Badge>
    );
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'transactionNumber',
      header: 'No. Transaksi',
      cell: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium font-mono">{transaction.transactionNumber}</span>
          <span className="text-xs text-muted-foreground">Order: {transaction.order?.orderNumber}</span>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Pembayaran',
      cell: (transaction) => (
        <Badge variant="outline">{paymentMethodLabels[transaction.paymentMethod] || transaction.paymentMethod}</Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Total',
      cell: (transaction) => (
        <span className="font-medium">{formatCurrency(transaction.totalAmount)}</span>
      ),
    },
    {
      key: 'paid',
      header: 'Dibayar',
      cell: (transaction) => (
        <div className="flex flex-col">
          <span>{formatCurrency(transaction.paidAmount)}</span>
          {transaction.changeAmount > 0 && (
            <span className="text-xs text-muted-foreground">Kembalian: {formatCurrency(transaction.changeAmount)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (transaction) => getStatusBadge(transaction.status),
    },
    {
      key: 'createdAt',
      header: 'Waktu',
      cell: (transaction) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(transaction.createdAt)}</span>
      ),
    },
  ];

  const tableActions: TableActions<Transaction> = {
    onView: openViewDialog,
    customActions: [
      {
        label: 'Refund',
        onClick: confirmRefund,
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'ghost',
        className: 'hover:text-red-500',
        showCondition: (transaction: Transaction) => transaction.status === 'COMPLETED',
      },
    ],
  };

  return (
    <div className="w-full">
      <DataTable
        title="Transaksi"
        description="Riwayat transaksi pembayaran."
        data={transactions}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchTransactions}
        searchPlaceholder="Cari transaksi..."
        statusFilter={{
          value: filters.status || 'all',
          onChange: handleStatusFilter,
          options: [
            { value: 'all', label: 'Semua Status' },
            ...statusOptions.map(o => ({ value: o.value, label: o.label })),
          ],
        }}
        emptyMessage="Belum ada transaksi."
        keyExtractor={(transaction) => transaction.uuid}
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
        <DialogContent className="max-w-lg" preventInteractOutside>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>Transaksi #{selectedTransaction?.transactionNumber}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">No. Transaksi</p>
                  <p className="font-mono font-medium">{selectedTransaction.transactionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No. Order</p>
                  <p className="font-mono font-medium">{selectedTransaction.order?.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Metode Bayar</p>
                  <p className="font-medium">{paymentMethodLabels[selectedTransaction.paymentMethod]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-medium text-sm">{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                {selectedTransaction.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatCurrency(selectedTransaction.discountAmount)}</span>
                  </div>
                )}
                {selectedTransaction.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>{formatCurrency(selectedTransaction.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedTransaction.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dibayar</span>
                  <span>{formatCurrency(selectedTransaction.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian</span>
                  <span>{formatCurrency(selectedTransaction.changeAmount)}</span>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-1">Catatan</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Tutup</Button>
            {selectedTransaction?.status === 'COMPLETED' && (
              <Button variant="destructive" onClick={() => { closeDialog(); confirmRefund(selectedTransaction); }}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Refund
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        title="Refund Transaksi"
        itemName={transactionToRefund?.transactionNumber}
        onConfirm={handleRefund}
        description="Apakah Anda yakin ingin melakukan refund untuk transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Refund"
      />
    </div>
  );
}
