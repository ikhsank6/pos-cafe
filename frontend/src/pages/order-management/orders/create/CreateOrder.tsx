import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ArrowLeft, 
  Loader2,
} from 'lucide-react';
import { orderService, type CreateOrderData } from '@/services/order.service';
import { productService, type Product } from '@/services/product.service';
import { tableService, type Table } from '@/services/table.service';
import { customerService, type Customer } from '@/services/customer.service';
import { categoryService, type Category } from '@/services/category.service';
import { discountService, type Discount } from '@/services/discount.service';
import { formatCurrency, showSuccess, showError } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { env } from '@/config/env';

// New global components
import { SearchInput } from '@/components/ui/search-input';
import { CategoryTabs } from '@/components/ui/category-tabs';
import { QuantityControl } from '@/components/ui/quantity-control';
import { EmptyState } from '@/components/ui/empty-state';
import { PromoCodeInput } from '@/components/ui/promo-code-input';
import { OrderSummary } from '@/components/ui/order-summary';
import { InfoCard, InfoCardGrid } from '@/components/ui/info-card';

// Utils
import { PAYMENT_METHODS, calculateDiscountAmount, getPaymentMethodLabel, getOrderTypeLabel } from '@/lib/order.utils';

const orderFormSchema = z.object({
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
  tableUuid: z.string().optional().or(z.literal('none')),
  customerUuid: z.string().optional().or(z.literal('none')),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z.array(z.object({
    productUuid: z.string().min(1, 'Pilih produk'),
    quantity: z.number().min(1, 'Min 1'),
    notes: z.string().optional(),
    price: z.number().optional(), 
    name: z.string().optional(),  
  })).min(1, 'Minimal 1 item harus ditambahkan'),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function CreateOrder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      type: 'DINE_IN',
      items: [],
      tableUuid: 'none',
      customerUuid: 'none',
      notes: '',
      paymentMethod: 'CASH',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories, resTables, resCustomers] = await Promise.all([
        productService.getAll({ limit: 200 }),
        categoryService.getAll({ limit: 100 }),
        tableService.getAll({ limit: 100 }),
        customerService.getAll({ limit: 100 }),
      ]);
      setProducts(resProducts?.data || []);
      setCategories(resCategories?.data || []);
      setTables(resTables?.data || []);
      setCustomers(resCustomers?.data || []);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Failed to load data', error);
        showError('Gagal memuat data POS');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const subtotal = (form.watch('items') || []).reduce((acc, item) => 
    acc + (item.price || 0) * (item.quantity || 0), 0
  );

  useEffect(() => {
    if (appliedDiscount && appliedDiscount.minPurchase && subtotal < appliedDiscount.minPurchase) {
      setAppliedDiscount(null);
      setDiscountError(`Min. belanja ${formatCurrency(appliedDiscount.minPurchase)}`);
    }
  }, [subtotal, appliedDiscount]);

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const response = await discountService.validateCode(discountCode, subtotal);
      if (response && (response as any).data) {
        setAppliedDiscount((response as any).data.discount);
        showSuccess('Diskon diterapkan');
      } else {
        setDiscountError('Kode tidak valid');
      }
    } catch (error: any) {
      setDiscountError(error?.response?.data?.meta?.message || 'Gagal');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };



  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = selectedCategory ? p.category?.uuid === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const onFormSubmit = async (data: OrderFormData) => {
    setSubmitting(true);
    try {
      const payload: CreateOrderData = {
        type: data.type,
        tableUuid: data.tableUuid === 'none' ? undefined : data.tableUuid,
        customerUuid: data.customerUuid === 'none' ? undefined : data.customerUuid,
        discountCode: appliedDiscount?.code,
        notes: data.notes,
        items: data.items.map(item => ({
          productUuid: item.productUuid,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };
      await orderService.create(payload);
      showSuccess('Order berhasil');
      setIsConfirmOpen(false);
      navigate('/admin/order-management/orders');
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryCount = (categoryId: string | null) => {
    if (!categoryId) return products.length;
    return products.filter(p => p.category?.uuid === categoryId).length;
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">Memuat Menu...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950 overflow-hidden font-sans">
      {/* CATALOG AREA */}
      <main className="flex-1 flex flex-col min-w-0 border-r dark:border-zinc-800">
        {/* SIMPLE HEADER */}
        <header className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/order-management/orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Terima Pesanan</h1>
          </div>
          
          <div className="flex-1 max-w-lg mx-8">
            <SearchInput
              placeholder="Cari menu..." 
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />
          </div>

          <div className="text-xs font-medium text-zinc-400">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="px-6 border-b shrink-0">
          <CategoryTabs
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
            categories={[
              { id: null, label: 'Semua', count: getCategoryCount(null) },
              ...categories.map(cat => ({
                id: cat.uuid,
                label: cat.name,
                count: getCategoryCount(cat.uuid)
              }))
            ]}
          />
        </div>

        {/* PRODUCT GRID */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredProducts.map(product => {
                  const addedQty = fields.find(f => f.productUuid === product.uuid) ? form.watch(`items.${fields.findIndex(f => f.productUuid === product.uuid)}.quantity`) : 0;
                  return (
                    <div 
                      key={product.uuid} 
                      onClick={() => handleAddProduct(product)}
                      className={`group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border transition-all cursor-pointer ${
                        addedQty > 0 ? 'border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <div className="aspect-4/3 bg-zinc-50 dark:bg-zinc-800/50 rounded-t-xl overflow-hidden relative">
                        {product.media?.path ? (
                          <img 
                            src={`${env.API_URL}${product.media.path}`} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-200 dark:text-zinc-800">
                            {product.name.charAt(0)}
                          </div>
                        )}
                        {addedQty > 0 && (
                          <div className="absolute top-2 right-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center shadow-lg">
                            {addedQty}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 flex flex-col flex-1 gap-2">
                        <div className="min-h-10">
                          <h3 className="font-bold text-sm leading-tight text-zinc-800 dark:text-zinc-200 line-clamp-2">{product.name}</h3>
                          <p className="text-[10px] text-zinc-400 font-medium uppercase mt-0.5">{product.category?.name || 'Umum'}</p>
                        </div>

                        <div className="mt-auto pt-2">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3">{formatCurrency(Number(product.price))}</p>
                          
                          {addedQty > 0 ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <QuantityControl
                                value={addedQty}
                                onChange={(val) => {
                                  const idx = fields.findIndex(f => f.productUuid === product.uuid);
                                  form.setValue(`items.${idx}.quantity`, val);
                                }}
                                onRemove={() => {
                                  const idx = fields.findIndex(f => f.productUuid === product.uuid);
                                  remove(idx);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-9 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900 transition-colors">
                              <Plus size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* SUMMARY SIDEBAR */}
      <aside className="w-[360px] flex flex-col bg-white dark:bg-zinc-900">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex flex-col h-full bg-white dark:bg-zinc-900">
            {/* 1. TOP: KERANJANG (Scrollable Area) */}
            <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b bg-white dark:bg-zinc-900">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Keranjang ({fields.length})</span>
               {fields.length > 0 && (
                 <button type="button" onClick={() => remove()} className="text-[10px] font-bold text-rose-500 hover:underline uppercase">Hapus Semua</button>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <EmptyState 
                    title="Keranjang Kosong" 
                    size="md"
                  />
                ) : fields.map((field, index) => {
                  const currentQty = form.watch(`items.${index}.quantity`);
                  return (
                    <div key={field.id} className="pb-3 border-b border-zinc-100 dark:border-zinc-800 space-y-2 last:border-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 line-clamp-1">{field.name}</h4>
                          <p className="text-[10px] text-zinc-400 font-medium">{formatCurrency(field.price || 0)} x {currentQty}</p>
                        </div>
                        <p className="font-bold text-xs whitespace-nowrap text-zinc-900 dark:text-zinc-50">{formatCurrency((field.price || 0) * currentQty)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <QuantityControl
                          size="sm"
                          value={currentQty}
                          onChange={(val) => form.setValue(`items.${index}.quantity`, val)}
                          onRemove={() => remove(index)}
                        />
                        <input 
                          placeholder="Catatan item..." 
                          className="flex-1 h-7 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-[10px] px-2 outline-none focus:ring-1 focus:ring-zinc-300 placeholder:text-zinc-400"
                          {...form.register(`items.${index}.notes`)} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Separator */}
            <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800" />

            {/* 2. MIDDLE: ORDER DETAILS (Compact) */}
            <div className="px-6 py-4 bg-zinc-50/30 dark:bg-zinc-900 border-b shrink-0">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Tipe Pesanan</label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-semibold text-[11px] h-8 rounded-lg bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                          <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DINE_IN">Dine In</SelectItem>
                        <SelectItem value="TAKEAWAY">Take Away</SelectItem>
                        <SelectItem value="DELIVERY">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="tableUuid" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Meja</label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-semibold text-[11px] h-8 rounded-lg bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                          <SelectValue placeholder="Pilih Meja" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        <SelectItem value="none">Tanpa Meja</SelectItem>
                        {tables.map(table => (
                          <SelectItem key={table.uuid} value={table.uuid}>Meja {table.number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="customerUuid" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Pelanggan</label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-semibold text-[11px] h-8 rounded-lg bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        <SelectItem value="none">Walk-in Guest</SelectItem>
                        {customers.map(customer => (
                          <SelectItem key={customer.uuid} value={customer.uuid}>{customer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Metode Bayar</label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-semibold text-[11px] h-8 rounded-lg bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map(pm => (
                          <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="mt-3">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Catatan</label>
                  <FormControl>
                    <input 
                      placeholder="Catatan pesanan (opsional)..." 
                      className="w-full h-8 text-[11px] px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-zinc-300 placeholder:text-zinc-400 mt-1"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            {/* 3. BOTTOM: SUMMARY & CHECKOUT */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
              <PromoCodeInput
                value={discountCode}
                onChange={setDiscountCode}
                onApply={handleApplyDiscount}
                onRemove={handleRemoveDiscount}
                appliedCode={appliedDiscount?.code}
                error={discountError}
                loading={discountLoading}
                disabled={submitting}
              />

              <OrderSummary
                subtotal={subtotal}
                discount={calculateDiscountAmount(subtotal, appliedDiscount)}
                discountLabel={appliedDiscount ? `Diskon (${appliedDiscount.code})` : 'Diskon'}
              />

              <Button 
                type="button" 
                className="w-full h-12 text-sm font-black rounded-2xl shadow-lg shadow-zinc-900/10 dark:shadow-none" 
                disabled={submitting || fields.length === 0} 
                onClick={() => setIsConfirmOpen(true)}
              >
                PROSES PESANAN
              </Button>
            </div>
          </form>
        </Form>
      </aside>

      {/* SIMPLE DIALOG */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden outline-none">
          <AlertDialogHeader className="p-6 bg-white dark:bg-zinc-900 border-b">
            <AlertDialogTitle className="text-xl font-bold">Review Pesanan</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium">Tinjau item sebelum diproses.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-6 space-y-4">
            <InfoCardGrid columns={2}>
              <InfoCard
                label="Tipe"
                value={getOrderTypeLabel(form.getValues('type'))}
              />
              <InfoCard
                label="Meja"
                value={form.getValues('tableUuid') !== 'none' ? tables.find(t => t.uuid === form.getValues('tableUuid'))?.number : '-'}
              />
              <InfoCard
                className="col-span-2"
                label="Metode Bayar"
                value={getPaymentMethodLabel(form.getValues('paymentMethod') || '')}
              />
            </InfoCardGrid>

            {form.getValues('notes') && (
              <InfoCard
                variant="warning"
                label="Catatan"
                value={form.getValues('notes')}
              />
            )}

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar border-b pb-4">
              {fields.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-500">{form.watch(`items.${index}.quantity`)}x {item.name}</span>
                  <span className="font-bold">{formatCurrency((item.price || 0) * form.watch(`items.${index}.quantity`))}</span>
                </div>
              ))}
            </div>

            <OrderSummary
              showTotal
              subtotal={subtotal}
              discount={calculateDiscountAmount(subtotal, appliedDiscount)}
              discountLabel={`Diskon (${appliedDiscount?.code || ''})`}
            />
          </div>

          <AlertDialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t flex gap-3">
            <AlertDialogCancel className="h-11 border-none bg-white dark:bg-zinc-800 font-bold flex-1 rounded-xl text-xs" onClick={() => setIsConfirmOpen(false)}>Kembali</AlertDialogCancel>
            <AlertDialogAction className="h-11 font-bold flex-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs" onClick={form.handleSubmit(onFormSubmit)} disabled={submitting}>Selesaikan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
