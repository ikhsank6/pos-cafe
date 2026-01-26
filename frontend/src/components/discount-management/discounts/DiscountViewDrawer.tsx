import { ViewDialog, FieldDisplay } from '@/components/ui/form-dialog';
import { type Discount, type DiscountType } from '@/services/discount.service';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Percent, DollarSign } from 'lucide-react';

interface DiscountViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: Discount | null;
  onEdit: (discount: Discount) => void;
}

const formatDiscountValue = (type: DiscountType, value: number) => {
  return type === 'PERCENTAGE' ? `${value}%` : formatCurrency(value);
};

export function DiscountViewDrawer({ open, onOpenChange, discount, onEdit }: DiscountViewDrawerProps) {
  if (!discount) return null;

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Diskon"
      description="Informasi lengkap diskon."
      onEdit={() => onEdit(discount)}
      className="max-w-lg"
    >
      <FieldDisplay label="Nama" value={discount.name} />
      <FieldDisplay label="Kode" value={<span className="font-mono">{discount.code}</span>} />
      <FieldDisplay label="Tipe" value={discount.type === 'PERCENTAGE' ? 'Persentase' : 'Nominal'} />
      <FieldDisplay 
        label="Nilai" 
        value={
          <Badge variant="outline" className="gap-1">
            {discount.type === 'PERCENTAGE' ? (
              <Percent className="h-3 w-3" />
            ) : (
              <DollarSign className="h-3 w-3" />
            )}
            {formatDiscountValue(discount.type, discount.value)}
          </Badge>
        } 
      />
      <FieldDisplay label="Min. Order" value={discount.minPurchase ? formatCurrency(discount.minPurchase) : '-'} />
      <FieldDisplay label="Max. Diskon" value={discount.maxDiscount ? formatCurrency(discount.maxDiscount) : '-'} />
      <FieldDisplay label="Penggunaan" value={`${discount.usedCount}${discount.usageLimit ? `/${discount.usageLimit}` : ''}`} />
      <FieldDisplay label="Tanggal Mulai" value={discount.startDate ? formatDateTime(discount.startDate) : '-'} />
      <FieldDisplay label="Tanggal Berakhir" value={discount.endDate ? formatDateTime(discount.endDate) : '-'} />
      <FieldDisplay label="Deskripsi" value={discount.description || '-'} />
      <FieldDisplay 
        label="Status" 
        value={
          <Badge variant={discount.isActive ? 'default' : 'secondary'}>
            {discount.isActive ? 'Active' : 'Inactive'}
          </Badge>
        } 
      />
    </ViewDialog>
  );
}
