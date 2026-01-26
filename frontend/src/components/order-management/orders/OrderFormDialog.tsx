import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormDialog } from '@/components/ui/form-dialog';
import {
  Form,
  FormControl,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search } from 'lucide-react';
import { type CreateOrderData } from '@/services/order.service';
import { productService, type Product } from '@/services/product.service';
import { tableService, type Table } from '@/services/table.service';
import { customerService, type Customer } from '@/services/customer.service';
import { formatCurrency, showSuccess, showErrorMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const orderFormSchema = z.object({
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
  tableUuid: z.string().optional().or(z.literal('none')),
  customerUuid: z.string().optional().or(z.literal('none')),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
  items: z.array(z.object({
    productUuid: z.string().min(1, 'Pilih produk'),
    quantity: z.number().min(1, 'Min 1'),
    notes: z.string().optional(),
    price: z.number().optional(), // Temporary for UI subtotal calculation
    name: z.string().optional(),  // Temporary for UI display
  })).min(1, 'Minimal 1 item harus ditambahkan'),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateOrderData) => void;
  loading: boolean;
}

import { discountService, type Discount } from '@/services/discount.service';

export function OrderFormDialog({ open, onOpenChange, onSubmit, loading }: OrderFormDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      type: 'DINE_IN',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      form.reset();
      setAppliedDiscount(null);
    }
  }, [open]);

  const loadData = async () => {
    try {
      console.log('[OrderFormDialog] Loading data...');
      const [resProducts, resTables, resCustomers] = await Promise.all([
        productService.getAll({ limit: 100 }),
        tableService.getAll({ limit: 100 }),
        customerService.getAll({ limit: 100 }),
      ]);
      
      console.log('[OrderFormDialog] Data loaded:', {
        products: resProducts?.data?.length,
        tables: resTables?.data?.length,
        customers: resCustomers?.data?.length
      });

      setProducts(resProducts?.data || []);
      setTables(resTables?.data || []);
      setCustomers(resCustomers?.data || []);
    } catch (error) {
      console.error('[OrderFormDialog] Failed to load data', error);
    }
  };

  const handleAddProduct = (product: Product) => {
    const existingIndex = fields.findIndex(f => f.productUuid === product.uuid);
    if (existingIndex > -1) {
      const currentQty = form.getValues(`items.${existingIndex}.quantity`);
      form.setValue(`items.${existingIndex}.quantity`, currentQty + 1);
    } else {
      append({
        productUuid: product.uuid,
        quantity: 1,
        price: Number(product.price),
        name: product.name,
      });
    }
  };

  const handleApplyDiscount = async () => {
    const code = form.getValues('discountCode');
    if (!code) return;

    setValidatingDiscount(true);
    try {
      const subtotal = calculateSubtotal();
      const result = await discountService.validateCode(code, subtotal);
      
      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount);
        showSuccess(`Voucher ${result.discount.name} berhasil digunakan`);
      } else {
        setAppliedDiscount(null);
        showErrorMessage(result.message || 'Voucher tidak valid');
      }
    } catch (error) {
      showErrorMessage('Gagal memvalidasi voucher');
      setAppliedDiscount(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const calculateSubtotal = () => {
    const items = form.watch('items') || [];
    return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  };

  const calculateDiscountAmount = (subtotal: number) => {
    if (!appliedDiscount) return 0;
    
    let amount = 0;
    if (appliedDiscount.type === 'PERCENTAGE') {
      amount = (subtotal * appliedDiscount.value) / 100;
      if (appliedDiscount.maxDiscount && amount > appliedDiscount.maxDiscount) {
        amount = appliedDiscount.maxDiscount;
      }
    } else {
      amount = appliedDiscount.value;
    }
    
    return amount;
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
  ) : [];

  const onFormSubmit = (data: OrderFormData) => {
    const payload: CreateOrderData = {
      type: data.type,
      tableUuid: data.tableUuid === 'none' ? undefined : (data.tableUuid || undefined),
      customerUuid: data.customerUuid === 'none' ? undefined : (data.customerUuid || undefined),
      notes: data.notes,
      discountCode: data.discountCode,
      items: data.items.map(item => ({
        productUuid: item.productUuid,
        quantity: item.quantity,
        notes: item.notes,
      })),
    };
    onSubmit(payload);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Order Baru"
      description="Tambah pesanan baru untuk pelanggan."
      onSubmit={form.handleSubmit(onFormSubmit)}
      loading={loading}
      submitLabel="Buat Order"
      className="max-w-4xl"
    >
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Order</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DINE_IN">Dine In</SelectItem>
                        <SelectItem value="TAKEAWAY">Take Away</SelectItem>
                        <SelectItem value="DELIVERY">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tableUuid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meja (Opsional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih meja" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Meja</SelectItem>
                        {Array.isArray(tables) && tables.map(table => (
                          <SelectItem key={table.uuid} value={table.uuid}>
                            Meja {table.number} ({table.capacity} orang)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerUuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pelanggan (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pelanggan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Walk-in Customer</SelectItem>
                      {Array.isArray(customers) && customers.map(customer => (
                        <SelectItem key={customer.uuid} value={customer.uuid}>
                          {customer.name} ({customer.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border rounded-lg p-3 bg-primary/5 border-primary/20">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-primary">Voucher Diskon</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="discountCode"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input 
                          placeholder="Masukkan kode promo" 
                          {...field} 
                          className="h-9 text-sm uppercase"
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                            if (appliedDiscount) setAppliedDiscount(null);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-9 px-3 text-xs font-medium border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={handleApplyDiscount}
                  disabled={validatingDiscount || !form.watch('discountCode')}
                >
                  {validatingDiscount ? '...' : (appliedDiscount ? 'Cek Lagi' : 'Gunakan')}
                </Button>
              </div>
              {appliedDiscount && (
                <p className="text-[10px] text-green-600 font-medium">
                  Voucher <strong>{appliedDiscount.code}</strong> berhasil dipasang!
                </p>
              )}
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari produk..." 
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                {filteredProducts.map(product => (
                  <Button
                    key={product.uuid}
                    type="button"
                    variant="outline"
                    className="group h-auto py-3 px-4 flex flex-col items-start text-left gap-1 hover:border-primary hover:shadow-md transition-all duration-200 active:scale-95"
                    onClick={() => handleAddProduct(product)}
                  >
                    <span className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded group-hover:bg-primary/10 group-hover:text-primary transition-colors">{formatCurrency(Number(product.price))}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-muted/30">
            <div className="p-3 bg-muted font-medium border-b flex justify-between items-center">
              <span>Items</span>
              <Badge variant="secondary">{fields.length} Items</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
              {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-2 opacity-50">
                  <Plus className="w-8 h-8" />
                  <p>Belum ada item dipilih</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="bg-background p-3 rounded-lg border shadow-sm space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{field.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(field.price || 0)}</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:bg-destructive/10" 
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none border-r"
                          onClick={() => {
                            const val = form.getValues(`items.${index}.quantity`);
                            if (val > 1) form.setValue(`items.${index}.quantity`, val - 1);
                          }}
                        >
                          -
                        </Button>
                        <div className="w-10 text-center text-sm font-medium">
                          {form.watch(`items.${index}.quantity`)}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none border-l"
                          onClick={() => {
                            const val = form.getValues(`items.${index}.quantity`);
                            form.setValue(`items.${index}.quantity`, val + 1);
                          }}
                        >
                          +
                        </Button>
                      </div>
                      <div className="flex-1 text-right font-medium text-sm">
                        {formatCurrency((field.price || 0) * form.watch(`items.${index}.quantity`))}
                      </div>
                    </div>
                    
                    <Input 
                      placeholder="Catatan (opsional)" 
                      className="h-8 text-xs bg-muted/30"
                      {...form.register(`items.${index}.notes`)}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-background border-t space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="flex items-center gap-1">Diskon ({appliedDiscount.name})</span>
                    <span>-{formatCurrency(calculateDiscountAmount(calculateSubtotal()))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Pajak (10%)</span>
                  <span>{formatCurrency((calculateSubtotal() - calculateDiscountAmount(calculateSubtotal())) * 0.1)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-primary">{formatCurrency((calculateSubtotal() - calculateDiscountAmount(calculateSubtotal())) * 1.1)}</span>
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Catatan order keseluruhan..." {...field} className="h-9 text-sm" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </Form>
    </FormDialog>
  );
}
