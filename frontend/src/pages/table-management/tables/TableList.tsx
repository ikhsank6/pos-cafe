import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tableService, type Table, type TableStatus } from '@/services/table.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { 
  TableViewDrawer, 
  TableFormDrawer, 
  tableFormSchema, 
  type TableFormData 
} from '@/components/table-management/tables';

const statusOptions: { value: TableStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Tersedia', color: 'bg-green-500' },
  { value: 'occupied', label: 'Terisi', color: 'bg-red-500' },
  { value: 'reserved', label: 'Reserved', color: 'bg-yellow-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-500' },
];

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function TableList() {
  const {
    data: tables,
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
    refresh: fetchTables,
  } = useTable<Table>('tables', useCallback((p, l, f) => tableService.getAll({ page: p, limit: l, search: f.search }), []));

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableFormSchema) as any,
    defaultValues: {
      number: '',
      capacity: 4,
      status: 'available',
      location: '',
      isActive: true,
    },
  });

  const handleSearch = (val: string) => {
    setFilters({ search: val || undefined });
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: status as TableStatus });
    }
  };

  const openCreateDrawer = () => {
    form.reset({
      number: '',
      capacity: 4,
      status: 'available',
      location: '',
      isActive: true,
    });
    setSelectedTable(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (table: Table) => {
    setSelectedTable(table);
    form.reset({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      location: table.location || '',
      isActive: table.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (table: Table) => {
    setSelectedTable(table);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedTable(null);
  };

  const handleSubmit = async (data: TableFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await tableService.create(data);
        showSuccess('Meja berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedTable) {
        await tableService.update(selectedTable.uuid, data);
        showSuccess('Meja berhasil diupdate');
      }
      closeDrawer();
      fetchTables();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tableToDelete) return;
    try {
      await tableService.delete(tableToDelete.uuid);
      showSuccess('Meja berhasil dihapus');
      fetchTables();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  const confirmDelete = (table: Table) => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: TableStatus) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`h-2 w-2 rounded-full ${option?.color || 'bg-gray-500'}`} />
        {option?.label || status}
      </Badge>
    );
  };

  const columns: Column<Table>[] = [
    {
      key: 'number',
      header: 'Meja',
      cell: (table) => (
        <div className="flex flex-col">
          <span className="font-medium">Meja {table.number}</span>
          {table.location && <span className="text-xs text-muted-foreground">{table.location}</span>}
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Kapasitas',
      cell: (table) => (
        <span>{table.capacity} orang</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (table) => getStatusBadge(table.status),
    },
    {
      key: 'isActive',
      header: 'Aktif',
      cell: (table) => (
        <Badge variant={table.isActive ? 'default' : 'secondary'}>
          {table.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const tableActions: TableActions<Table> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Meja"
        description="Kelola meja cafe."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Meja
          </Button>
        }
        data={tables}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchTables}
        searchPlaceholder="Cari meja..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        statusFilter={{
          value: filters.status || 'all',
          onChange: handleStatusFilter,
          options: [
            { value: 'all', label: 'Semua Status' },
            ...statusOptions.map(o => ({ value: o.value, label: o.label })),
          ],
        }}
        emptyMessage="Belum ada meja."
        keyExtractor={(table) => table.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <TableViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        table={selectedTable}
        onEdit={(table) => { closeDrawer(); setTimeout(() => openEditDrawer(table), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <TableFormDrawer
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
        title="Hapus Meja"
        itemName={`Meja ${tableToDelete?.number}`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
