import { ViewDialog, FieldDisplay } from '@/components/ui/form-dialog';
import { type Product } from '@/services/product.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { env } from '@/config/env';
import { ImageIcon } from 'lucide-react';

interface ProductViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (product: Product) => void;
}

export function ProductViewDrawer({ open, onOpenChange, product, onEdit }: ProductViewDrawerProps) {
  if (!product) return null;

  const imageUrl = product.media?.path 
    ? `${env.API_URL}${product.media.path}`
    : null;

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Produk"
      description="Informasi lengkap produk."
      onEdit={() => onEdit(product)}
    >
      {/* Product Image */}
      <div className="mb-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover rounded-lg ring-1 ring-border"
          />
        ) : (
          <div className="w-full h-48 rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
            <span className="text-sm">Tidak ada gambar</span>
          </div>
        )}
        {product.media?.originalName && (
          <p className="text-xs text-muted-foreground mt-2 text-center">{product.media.originalName}</p>
        )}
      </div>

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
