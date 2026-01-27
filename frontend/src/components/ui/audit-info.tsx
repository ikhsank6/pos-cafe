import { Calendar, RefreshCcw } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface AuditInfoProps {
  createdAt: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
  showOnlyCreated?: boolean;
}

export function AuditInfo({ createdAt, createdBy, updatedAt, updatedBy, showOnlyCreated = false }: AuditInfoProps) {
  return (
    <div className="flex flex-col gap-1.5 text-[10px] leading-tight text-muted-foreground min-w-[120px]">
      {/* Created Info */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 font-medium text-foreground/70">
          <Calendar className="h-2.5 w-2.5" />
          <span>Dibuat</span>
        </div>
        <div className="pl-3.5 flex flex-col">
          <span>{formatDateTime(createdAt)}</span>
          {createdBy && <span className="truncate max-w-[140px]" title={createdBy}>{createdBy}</span>}
        </div>
      </div>

      {/* Updated Info */}
      {!showOnlyCreated && updatedAt && (
        <div className="flex flex-col gap-0.5 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 font-medium text-foreground/70">
            <RefreshCcw className="h-2.5 w-2.5" />
            <span>Diupdate</span>
          </div>
          <div className="pl-3.5 flex flex-col">
            <span>{formatDateTime(updatedAt)}</span>
            {updatedBy && <span className="truncate max-w-[140px]" title={updatedBy}>{updatedBy}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
