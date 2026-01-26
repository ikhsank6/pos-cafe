import type { UseFormReturn } from 'react-hook-form';
import { FormDialog } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoneyInput } from '@/components/ui/money-input';
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, format } from 'date-fns';
import { z } from 'zod';

// Schema exported for use in parent component
export const discountFormSchema = z.object({
  code: z.string().min(1, 'Kode diskon wajib diisi').toUpperCase(),
  name: z.string().min(1, 'Nama diskon wajib diisi'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.coerce.number().min(0, 'Nilai tidak boleh negatif'),
  minPurchase: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type DiscountFormData = z.infer<typeof discountFormSchema>;

interface DiscountFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<DiscountFormData>;
  onSubmit: (data: DiscountFormData) => void;
  loading: boolean;
}

// Required field label component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span>
    {children} <span className="text-red-500">*</span>
  </span>
);

export function DiscountFormDrawer({ 
  open, 
  onOpenChange, 
  mode, 
  form, 
  onSubmit, 
  loading 
}: DiscountFormDrawerProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah Diskon Baru' : 'Edit Diskon'}
      description={mode === 'create' ? 'Isi form di bawah untuk membuat kode diskon baru.' : 'Ubah data diskon sesuai kebutuhan.'}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === 'create' ? 'Simpan' : 'Update'}
      loading={loading}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><RequiredLabel>Kode Diskon</RequiredLabel></FormLabel>
                  <FormControl>
                    <Input placeholder="PROMO2024" {...field} className="uppercase" disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><RequiredLabel>Nama Diskon</RequiredLabel></FormLabel>
                  <FormControl>
                    <Input placeholder="Diskon Tahun Baru" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><RequiredLabel>Tipe</RequiredLabel></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><RequiredLabel>Nilai</RequiredLabel></FormLabel>
                  <FormControl>
                    {form.watch('type') === 'FIXED_AMOUNT' ? (
                      <MoneyInput 
                        placeholder="Rp 0" 
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.floatValue || 0)}
                        disabled={loading}
                      />
                    ) : (
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading} 
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minPurchase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min. Order (Opsional)</FormLabel>
                  <FormControl>
                    <MoneyInput 
                      placeholder="Rp 0" 
                      value={field.value}
                      onValueChange={(values) => field.onChange(values.floatValue || 0)}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max. Diskon (Opsional)</FormLabel>
                  <FormControl>
                    <MoneyInput 
                      placeholder="Rp 0" 
                      value={field.value}
                      onValueChange={(values) => field.onChange(values.floatValue || 0)}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batas Penggunaan (Opsional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Kosongkan untuk unlimited" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai (Opsional)</FormLabel>
                  <FormControl>
                    <DatePicker 
                      date={field.value ? parseISO(field.value) : undefined} 
                      setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} 
                      disabled={loading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Berakhir (Opsional)</FormLabel>
                  <FormControl>
                    <DatePicker 
                      date={field.value ? parseISO(field.value) : undefined} 
                      setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} 
                      disabled={loading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Syarat dan ketentuan diskon" {...field} disabled={loading} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Status Aktif</FormLabel>
                  <FormDescription>
                    Diskon aktif dapat digunakan pelanggan
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormDialog>
  );
}
