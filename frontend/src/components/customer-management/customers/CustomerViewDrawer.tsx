import { ViewDialog, FieldDisplay } from '@/components/ui/form-dialog';
import { type Customer } from '@/services/customer.service';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface CustomerViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEdit: (customer: Customer) => void;
}

export function CustomerViewDrawer({ open, onOpenChange, customer, onEdit }: CustomerViewDrawerProps) {
  if (!customer) return null;

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Pelanggan"
      description="Informasi lengkap pelanggan."
      onEdit={() => onEdit(customer)}
    >
      <FieldDisplay label="Nama" value={customer.name} />
      <FieldDisplay label="Telepon" value={customer.phone} />
      <FieldDisplay label="Email" value={customer.email || '-'} />
      <FieldDisplay 
        label="Poin Loyalti" 
        value={
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            {customer.loyaltyPoints}
          </Badge>
        } 
      />
      <FieldDisplay label="Alamat" value={customer.address || '-'} />
      <FieldDisplay 
        label="Status" 
        value={
          <Badge variant={customer.isActive ? 'default' : 'secondary'}>
            {customer.isActive ? 'Active' : 'Inactive'}
          </Badge>
        } 
      />
      <FieldDisplay label="Terdaftar Pada" value={formatDateTime(customer.createdAt)} />
    </ViewDialog>
  );
}
