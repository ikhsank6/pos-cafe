import { type UseFormReturn } from 'react-hook-form';
import { FormDialog } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { type UserFormData } from '@/lib/validations';
import { type Role } from '@/services/role.service';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  loading: boolean;
  roles: Role[];
}

// Required field label component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span>
    {children} <span className="text-red-500">*</span>
  </span>
);

export function UserFormDrawer({ 
  open, 
  onOpenChange, 
  mode, 
  form, 
  onSubmit, 
  loading,
  roles 
}: UserFormDrawerProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
      description={mode === 'create' ? 'Isi form di bawah untuk membuat user baru.' : 'Ubah data user sesuai kebutuhan.'}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === 'create' ? 'Simpan' : 'Update'}
      loading={loading}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel><RequiredLabel>Nama</RequiredLabel></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel><RequiredLabel>Email</RequiredLabel></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Masukkan email" {...field} disabled={loading} />
                </FormControl>
                {mode === 'create' && (
                  <FormDescription>
                    Password sementara akan digenerate otomatis dan dikirim melalui email.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleUuids"
            render={() => (
              <FormItem>
                <FormLabel><RequiredLabel>Role</RequiredLabel></FormLabel>
                <FormDescription className="text-xs">
                  User dapat memiliki lebih dari satu role. Role pertama akan menjadi role aktif default.
                </FormDescription>
                <ScrollArea className="h-[140px] rounded-md border p-3 mt-2">
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <FormField
                        key={role.uuid}
                        control={form.control}
                        name="roleUuids"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={role.uuid}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.uuid)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, role.uuid])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) => value !== role.uuid
                                          )
                                        )
                                  }}
                                  disabled={loading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  {role.name}
                                </FormLabel>
                                {role.description && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
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
                    User aktif dapat login ke sistem
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
