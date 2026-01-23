import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productService, type Product } from '@/services/product.service';
import { categoryService, type Category } from '@/services/category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError, formatCurrency } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { 
  ProductViewDrawer, 
  ProductFormDrawer, 
  productFormSchema, 
  type ProductFormData 
} from '@/components/product-management/products';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function ProductList() {
  const {
    data: products,
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
    refresh: fetchProducts,
  } = useTable<Product>('products', useCallback((p, l, f) => productService.getAll({ page: p, limit: l, search: f.search }), []));

  const [categories, setCategories] = useState<Category[]>([]);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryUuid: '',
      isActive: true,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll({ limit: 100 });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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
      price: 0,
      stock: 0,
      categoryUuid: '',
      isActive: true,
    });
    setSelectedProduct(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setSelectedProduct(product);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryUuid: product.category?.uuid || '',
      isActive: product.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (product: Product) => {
    setSelectedProduct(product);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedProduct(null);
  };

  const handleSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await productService.create(data);
        showSuccess('Produk berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedProduct) {
        await productService.update(selectedProduct.uuid, data);
        showSuccess('Produk berhasil diupdate');
      }
      closeDrawer();
      fetchProducts();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await productService.delete(productToDelete.uuid);
      showSuccess('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Produk',
      cell: (product) => (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          {product.sku && <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (product) => (
        <Badge variant="outline">{product.category?.name || '-'}</Badge>
      ),
    },
    {
      key: 'price',
      header: 'Harga',
      cell: (product) => (
        <span className="font-medium">{formatCurrency(product.price)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stok',
      cell: (product) => (
        <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}>
          {product.stock}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (product) => (
        <Badge variant={product.isActive ? 'default' : 'secondary'}>
          {product.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const tableActions: TableActions<Product> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Produk"
        description="Kelola produk dan menu cafe."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        }
        data={products}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchProducts}
        searchPlaceholder="Cari produk..."
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
        emptyMessage="Belum ada produk."
        keyExtractor={(product) => product.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <ProductViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        product={selectedProduct}
        onEdit={(product) => { closeDrawer(); setTimeout(() => openEditDrawer(product), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <ProductFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Produk"
        itemName={productToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
