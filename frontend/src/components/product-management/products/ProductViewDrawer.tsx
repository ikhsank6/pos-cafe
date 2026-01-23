import { ViewDialog, FieldDisplay } from '@/components/ui/form-dialog';
import { type Product } from '@/services/product.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (product: Product) => void;
}

export function ProductViewDrawer({ open, onOpenChange, product, onEdit }: ProductViewDrawerProps) {
  if (!product) return null;

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Produk"
      description="Informasi lengkap produk."
      onEdit={() => onEdit(product)}
    >
      <FieldDisplay label="Nama" value={product.name} />
      <FieldDisplay label="SKU" value={product.sku || '-'} />
      <FieldDisplay label="Kategori" value={product.category?.name || '-'} />
      <FieldDisplay label="Harga" value={formatCurrency(product.price)} />
      <FieldDisplay 
        label="Stok" 
        value={
          <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}>
            {product.stock}
          </Badge>
        } 
      />
      <FieldDisplay 
        label="Status" 
        value={
          <Badge variant={product.isActive ? 'default' : 'secondary'}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
        } 
      />
      <FieldDisplay label="Deskripsi" value={product.description || '-'} />
    </ViewDialog>
  );
}
