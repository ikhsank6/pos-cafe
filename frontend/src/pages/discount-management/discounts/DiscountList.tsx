import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { discountService, type Discount, type DiscountType } from '@/services/discount.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Percent, DollarSign } from 'lucide-react';
import { showSuccess, showError, formatCurrency } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { AuditInfo } from '@/components/ui/audit-info';
import { 
  DiscountViewDrawer, 
  DiscountFormDrawer, 
  discountFormSchema, 
  type DiscountFormData 
} from '@/components/discount-management/discounts';

type DrawerMode = 'create' | 'edit' | 'view' | null;

const formatDiscountValue = (type: DiscountType, value: number) => {
  return type === 'PERCENTAGE' ? `${value}%` : formatCurrency(value);
};

export default function DiscountList() {
  const {
    data: discounts,
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
    refresh: fetchDiscounts,
  } = useTable<Discount>('discounts', useCallback((p, l, f) => discountService.getAll({ page: p, limit: l, search: f.search }), []));

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountFormSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minPurchase: undefined,
      maxDiscount: undefined,
      usageLimit: undefined,
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  const handleSearch = (val: string) => {
    setFilters({ search: val || undefined });
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ isActive: undefined });
    } else {
      setFilters({ isActive: status === 'active' });
    }
  };

  const openCreateDrawer = () => {
    form.reset({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minPurchase: undefined,
      maxDiscount: undefined,
      usageLimit: undefined,
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setSelectedDiscount(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (discount: Discount) => {
    setSelectedDiscount(discount);
    form.reset({
      code: discount.code,
      name: discount.name,
      description: discount.description || '',
      type: discount.type,
      value: discount.value,
      minPurchase: discount.minPurchase || undefined,
      maxDiscount: discount.maxDiscount || undefined,
      usageLimit: discount.usageLimit || undefined,
      startDate: discount.startDate ? discount.startDate.split('T')[0] : '',
      endDate: discount.endDate ? discount.endDate.split('T')[0] : '',
      isActive: discount.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (discount: Discount) => {
    setSelectedDiscount(discount);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedDiscount(null);
  };

  const handleSubmit = async (data: DiscountFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await discountService.create(data);
        showSuccess('Diskon berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedDiscount) {
        await discountService.update(selectedDiscount.uuid, data);
        showSuccess('Diskon berhasil diupdate');
      }
      closeDrawer();
      fetchDiscounts();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      await discountService.delete(discountToDelete.uuid);
      showSuccess('Diskon berhasil dihapus');
      fetchDiscounts();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setDiscountToDelete(null);
    }
  };

  const confirmDelete = (discount: Discount) => {
    setDiscountToDelete(discount);
    setDeleteDialogOpen(true);
  };

  const columns: Column<Discount>[] = [
    {
      key: 'discount',
      header: 'Diskon',
      cell: (discount) => (
        <div className="flex flex-col">
          <span className="font-medium">{discount.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{discount.code}</span>
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Nilai',
      cell: (discount) => (
        <Badge variant="outline" className="gap-1 font-semibold text-primary border-primary/20 bg-primary/5">
          {discount.type === 'PERCENTAGE' ? (
            <Percent className="h-3 w-3" />
          ) : (
            <DollarSign className="h-3 w-3" />
          )}
          {formatDiscountValue(discount.type, discount.value)}
        </Badge>
      ),
    },
    {
      key: 'requirements',
      header: 'Syarat & Batas',
      cell: (discount) => (
        <div className="flex flex-col gap-1">
          {discount.minPurchase ? (
            <span className="text-xs">Min: {formatCurrency(discount.minPurchase)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
          {discount.type === 'PERCENTAGE' && discount.maxDiscount && (
            <span className="text-xs text-green-600 font-medium">Max: {formatCurrency(discount.maxDiscount)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Penggunaan',
      cell: (discount) => (
        <span className="text-sm">
          {discount.usageCount}{discount.usageLimit ? `/${discount.usageLimit}` : ''}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Berlaku',
      cell: (discount) => {
        const now = new Date();
        const start = discount.startDate ? new Date(discount.startDate) : null;
        const end = discount.endDate ? new Date(discount.endDate) : null;
        const isExpired = end && end < now;
        const isNotStarted = start && start > now;
        
        return (
          <div className="flex flex-col">
            {isExpired ? (
              <Badge variant="destructive">Expired</Badge>
            ) : isNotStarted ? (
              <Badge variant="secondary">Belum Aktif</Badge>
            ) : (
              <Badge variant="default">Berlaku</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (discount) => (
        <Badge variant={discount.isActive ? 'default' : 'secondary'}>
          {discount.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'audit',
      header: 'Audit',
      cell: (discount) => (
        <AuditInfo 
          createdAt={discount.createdAt}
          createdBy={discount.createdBy}
          updatedAt={discount.updatedAt}
          updatedBy={discount.updatedBy}
        />
      ),
    },
  ];

  const tableActions: TableActions<Discount> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Diskon & Promo"
        description="Kelola kode diskon dan promosi."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Diskon
          </Button>
        }
        data={discounts}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchDiscounts}
        searchPlaceholder="Cari diskon..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        statusFilter={{
          value: filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive',
          onChange: handleStatusFilter,
          options: [
            { value: 'all', label: 'Semua Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        }}
        emptyMessage="Belum ada diskon."
        keyExtractor={(discount) => discount.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <DiscountViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        discount={selectedDiscount}
        onEdit={(discount) => { closeDrawer(); setTimeout(() => openEditDrawer(discount), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <DiscountFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Diskon"
        itemName={discountToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
