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
import { Combobox } from '@/components/ui/combobox';
import { z } from 'zod';
import { type Category } from '@/services/category.service';

// Schema exported for use in parent component
export const productFormSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce.number().min(0, 'Stok tidak boleh negatif').optional(),
  categoryUuid: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  loading: boolean;
  categories: Category[];
}

// Required field label component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span>
    {children} <span className="text-red-500">*</span>
  </span>
);

export function ProductFormDrawer({ 
  open, 
  onOpenChange, 
  mode, 
  form, 
  onSubmit, 
  loading,
  categories 
}: ProductFormDrawerProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk'}
      description={mode === 'create' ? 'Isi form di bawah untuk membuat produk baru.' : 'Ubah data produk sesuai kebutuhan.'}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === 'create' ? 'Simpan' : 'Update'}
      loading={loading}
      className="max-w-lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel><RequiredLabel>Nama Produk</RequiredLabel></FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Kopi Susu" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><RequiredLabel>Harga</RequiredLabel></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">Rp</span>
                      <Input 
                        placeholder="0" 
                        className="pl-9"
                        disabled={loading}
                        value={field.value ? new Intl.NumberFormat('id-ID').format(field.value) : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          field.onChange(val ? parseInt(val, 10) : 0);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok (Opsional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1">
            <FormField
              control={form.control}
              name="categoryUuid"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Kategori (Opsional)</FormLabel>
                  <Combobox
                    options={categories.map((cat) => ({
                      value: cat.uuid,
                      label: cat.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih kategori"
                    searchPlaceholder="Cari kategori..."
                    disabled={loading}
                  />
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
                  <Textarea placeholder="Deskripsi produk" {...field} disabled={loading} value={field.value || ''} />
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
                    Produk aktif akan ditampilkan di POS
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
