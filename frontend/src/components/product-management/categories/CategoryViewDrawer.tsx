import { ViewDialog, FieldDisplay } from '@/components/ui/form-dialog';
import { type Category } from '@/services/category.service';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CategoryViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onEdit: (category: Category) => void;
}

export function CategoryViewDrawer({ open, onOpenChange, category, onEdit }: CategoryViewDrawerProps) {
  if (!category) return null;

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Kategori"
      description="Informasi lengkap kategori."
      onEdit={() => onEdit(category)}
    >
      <FieldDisplay label="Nama" value={category.name} />
      <FieldDisplay 
        label="Status" 
        value={
          <Badge variant={category.isActive ? 'default' : 'secondary'}>
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>
        } 
      />
      <FieldDisplay label="Deskripsi" value={category.description || '-'} />
      <FieldDisplay label="Dibuat Pada" value={formatDateTime(category.createdAt)} />
      <FieldDisplay label="Dibuat Oleh" value={category.createdBy || '-'} />
      <FieldDisplay label="Terakhir Update" value={formatDateTime(category.updatedAt)} />
      <FieldDisplay label="Update Oleh" value={category.updatedBy || '-'} />
    </ViewDialog>
  );
}
