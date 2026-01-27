import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryService, type Category } from '@/services/category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { AuditInfo } from '@/components/ui/audit-info';
import { 
  CategoryViewDrawer, 
  CategoryFormDrawer, 
  categoryFormSchema, 
  type CategoryFormData 
} from '@/components/product-management/categories';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function CategoryList() {
  const {
    data: categories,
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
    refresh: fetchCategories,
  } = useTable<Category>('categories', useCallback((p, l, f) => categoryService.getAll({ page: p, limit: l, search: f.search }), []));

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: '',
      description: '',
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
      description: '',
      isActive: true,
    });
    setSelectedCategory(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (category: Category) => {
    setSelectedCategory(category);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedCategory(null);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await categoryService.create(data);
        showSuccess('Kategori berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedCategory) {
        await categoryService.update(selectedCategory.uuid, data);
        showSuccess('Kategori berhasil diupdate');
      }
      closeDrawer();
      fetchCategories();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoryService.delete(categoryToDelete.uuid);
      showSuccess('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Nama Kategori',
      cell: (category) => (
        <div className="flex flex-col">
          <span className="font-medium">{category.name}</span>
          {category.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">{category.description}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (category) => (
        <Badge variant={category.isActive ? 'default' : 'secondary'}>
          {category.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'audit',
      header: 'Audit',
      cell: (category) => (
        <AuditInfo 
          createdAt={category.createdAt}
          createdBy={category.createdBy}
          updatedAt={category.updatedAt}
          updatedBy={category.updatedBy}
        />
      ),
    },
  ];

  const tableActions: TableActions<Category> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Kategori Produk"
        description="Kelola kategori untuk produk cafe."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        }
        data={categories}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchCategories}
        searchPlaceholder="Cari kategori..."
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
        emptyMessage="Belum ada kategori."
        keyExtractor={(category) => category.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <CategoryViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        category={selectedCategory}
        onEdit={(category) => { closeDrawer(); setTimeout(() => openEditDrawer(category), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <CategoryFormDrawer
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
        title="Hapus Kategori"
        itemName={categoryToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
