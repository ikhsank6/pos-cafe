import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerService, type Customer } from '@/services/customer.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { 
  CustomerViewDrawer, 
  CustomerFormDrawer, 
  customerFormSchema, 
  type CustomerFormData 
} from '@/components/customer-management/customers';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function CustomerList() {
  const {
    data: customers,
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
    refresh: fetchCustomers,
  } = useTable<Customer>('customers', useCallback((p, l, f) => customerService.getAll({ page: p, limit: l, search: f.search }), []));

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
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
      name: '',
      phone: '',
      email: '',
      address: '',
      isActive: true,
    });
    setSelectedCustomer(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      isActive: customer.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedCustomer(null);
  };

  const handleSubmit = async (data: CustomerFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await customerService.create(data);
        showSuccess('Pelanggan berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedCustomer) {
        await customerService.update(selectedCustomer.uuid, data);
        showSuccess('Pelanggan berhasil diupdate');
      }
      closeDrawer();
      fetchCustomers();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await customerService.delete(customerToDelete.uuid);
      showSuccess('Pelanggan berhasil dihapus');
      fetchCustomers();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Pelanggan',
      cell: (customer) => (
        <div className="flex flex-col">
          <span className="font-medium">{customer.name}</span>
          <span className="text-xs text-muted-foreground">{customer.phone}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (customer) => (
        <span className="text-sm">{customer.email || '-'}</span>
      ),
    },
    {
      key: 'loyaltyPoints',
      header: 'Poin Loyalti',
      cell: (customer) => (
        <Badge variant="outline" className="gap-1">
          <Star className="h-3 w-3 text-yellow-500" />
          {customer.loyaltyPoints}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (customer) => (
        <Badge variant={customer.isActive ? 'default' : 'secondary'}>
          {customer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const tableActions: TableActions<Customer> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Pelanggan"
        description="Kelola data pelanggan cafe."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pelanggan
          </Button>
        }
        data={customers}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchCustomers}
        searchPlaceholder="Cari pelanggan..."
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
        emptyMessage="Belum ada pelanggan."
        keyExtractor={(customer) => customer.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <CustomerViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        customer={selectedCustomer}
        onEdit={(customer) => { closeDrawer(); setTimeout(() => openEditDrawer(customer), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <CustomerFormDrawer
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
        title="Hapus Pelanggan"
        itemName={customerToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
