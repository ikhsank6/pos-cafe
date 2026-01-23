import { ViewDialog, FieldDisplay } from '@/components/ui/form-dialog';
import { type Table, type TableStatus, TABLE_STATUS_OPTIONS } from '@/services/table.service';
import { Badge } from '@/components/ui/badge';



interface TableViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onEdit: (table: Table) => void;
}

export function TableViewDrawer({ open, onOpenChange, table, onEdit }: TableViewDrawerProps) {
  if (!table) return null;

  const getStatusBadge = (status: TableStatus) => {
    const option = TABLE_STATUS_OPTIONS.find(o => o.value === status);
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`h-2 w-2 rounded-full ${option?.color || 'bg-gray-500'}`} />
        {option?.label || status}
      </Badge>
    );
  };

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Meja"
      description="Informasi lengkap meja."
      onEdit={() => onEdit(table)}
    >
      <FieldDisplay label="Nomor Meja" value={`Meja ${table.number}`} />
      <FieldDisplay label="Kapasitas" value={`${table.capacity} orang`} />
      <FieldDisplay label="Status" value={getStatusBadge(table.status)} />
      <FieldDisplay label="Lokasi" value={table.location || '-'} />
      <FieldDisplay 
        label="Aktif" 
        value={
          <Badge variant={table.isActive ? 'default' : 'secondary'}>
            {table.isActive ? 'Active' : 'Inactive'}
          </Badge>
        } 
      />
    </ViewDialog>
  );
}
