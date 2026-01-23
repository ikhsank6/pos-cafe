import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  showFooter?: boolean
  footerContent?: React.ReactNode
  className?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  loading = false,
  showFooter = true,
  footerContent,
  className,
}: FormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn("sm:max-w-md max-h-[90vh] overflow-y-auto", className)}
        preventInteractOutside
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {onSubmit ? (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-4">
              {children}
            </div>
            
            {showFooter && (
              <DialogFooter className="mt-4">
                {footerContent || (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)} 
                      disabled={loading}
                    >
                      {cancelLabel}
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {submitLabel}
                    </Button>
                  </>
                )}
              </DialogFooter>
            )}
          </form>
        ) : (
          <>
            <div className="space-y-4">
              {children}
            </div>
            
            {showFooter && (
              <DialogFooter>
                {footerContent || (
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    {cancelLabel}
                  </Button>
                )}
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// View mode dialog - for displaying data only
interface ViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onEdit?: () => void
  editLabel?: string
  closeLabel?: string
  className?: string
}

export function ViewDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onEdit,
  editLabel = "Edit",
  closeLabel = "Tutup",
  className,
}: ViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn("sm:max-w-md max-h-[90vh] overflow-y-auto", className)}
        preventInteractOutside
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {children}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {closeLabel}
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              {editLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Field display component for view mode
interface FieldDisplayProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function FieldDisplay({ label, value, className }: FieldDisplayProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </p>
      <div className="text-sm font-medium">{value || "-"}</div>
    </div>
  )
}
