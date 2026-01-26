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
  Trash2, 
  Search, 
  ArrowLeft, 
  ShoppingCart, 
  Tag,
  X,
  Loader2,
  ReceiptText
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { env } from '@/config/env';

const orderFormSchema = z.object({
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
  tableUuid: z.string().optional().or(z.literal('none')),
  customerUuid: z.string().optional().or(z.literal('none')),
  notes: z.string().optional(),
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

  const calculateDiscountAmount = (val: number) => {
    if (!appliedDiscount) return 0;
    let amount = appliedDiscount.type === 'PERCENTAGE' 
      ? (val * appliedDiscount.value) / 100 
      : appliedDiscount.value;
    if (appliedDiscount.maxDiscount && amount > appliedDiscount.maxDiscount) {
      amount = appliedDiscount.maxDiscount;
    }
    return amount;
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

  if (loading) return <div className="flex h-screen items-center justify-center">Loading POS...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Simplified Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            onClick={() => navigate('/admin/order-management/orders')}
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Order Baru</h1>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Terminal 01</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input 
              placeholder="Cari menu..." 
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-xl pl-10 pr-4 h-10 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/order-management/orders')} disabled={submitting}>
            Batal
          </Button>
          <Button size="sm" className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-5 font-bold rounded-lg" onClick={() => setIsConfirmOpen(true)} disabled={submitting || fields.length === 0}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Proses Pesanan'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-white/50 dark:bg-zinc-950/50 border-r border-zinc-100 dark:border-zinc-800">
          <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-zinc-900/50">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors shrink-0 border text-xs font-bold ${
                selectedCategory === null 
                ? "bg-zinc-900 border-zinc-900 text-white" 
                : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800"
              }`}
            >
              Semua Menu
              <span className="text-[10px] ml-1 opacity-60">{getCategoryCount(null)}</span>
            </button>
            {categories.map(cat => (
              <button 
                key={cat.uuid}
                onClick={() => setSelectedCategory(cat.uuid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors shrink-0 border text-xs font-bold ${
                  selectedCategory === cat.uuid 
                  ? "bg-zinc-900 border-zinc-900 text-white" 
                  : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800"
                }`}
              >
                {cat.name}
                <span className="text-[10px] ml-1 opacity-60">{getCategoryCount(cat.uuid)}</span>
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-12">
              {filteredProducts.map(product => {
                const addedQty = fields.find(f => f.productUuid === product.uuid) ? form.watch(`items.${fields.findIndex(f => f.productUuid === product.uuid)}.quantity`) : 0;
                return (
                  <div key={product.uuid} onClick={() => handleAddProduct(product)} className={`group relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl p-3 border transition-colors cursor-pointer ${addedQty > 0 ? 'border-primary ring-1 ring-primary/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}>
                    <div className="aspect-square bg-zinc-50 dark:bg-zinc-800/50 rounded-xl overflow-hidden relative mb-3">
                      {product.media?.path ? <img src={`${env.API_URL}${product.media.path}`} alt={product.name} className="w-full h-full object-contain p-4" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-200">{product.name.charAt(0)}</div>}
                      {addedQty > 0 && <div className="absolute inset-0 bg-primary/10 flex items-center justify-center"><div className="bg-primary text-white font-black text-xl h-12 w-12 rounded-full flex items-center justify-center shadow-lg">{addedQty}</div></div>}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-tight">{product.name}</h3>
                      <p className="text-[10px] font-medium text-zinc-400">{product.category?.name || 'Menu'}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{formatCurrency(Number(product.price))}</span>
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center transition-colors ${addedQty > 0 ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}><Plus size={14} strokeWidth={3} /></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="w-[380px] flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-sm z-20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex flex-col h-full overflow-hidden">
              <div className="p-5 space-y-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-9 rounded-lg bg-white px-3 text-xs font-bold"><SelectValue placeholder="Tipe" /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl"><SelectItem value="DINE_IN" className="text-xs font-bold">MAKAN SINI</SelectItem><SelectItem value="TAKEAWAY" className="text-xs font-bold">BAWA PULANG</SelectItem><SelectItem value="DELIVERY" className="text-xs font-bold">DELIVERY</SelectItem></SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tableUuid" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-9 rounded-lg bg-white px-3 text-xs font-bold"><SelectValue placeholder="Meja" /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl h-60"><SelectItem value="none" className="text-xs font-bold">TANPA MEJA</SelectItem>{tables.map(table => (<SelectItem key={table.uuid} value={table.uuid} className="text-xs font-bold">MEJA {table.number}</SelectItem>))}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="customerUuid" render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-9 rounded-lg bg-white px-3 text-xs font-bold"><SelectValue placeholder="Pilih Pelanggan" /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-xl h-60"><SelectItem value="none" className="text-xs font-bold">WALK-IN GUEST</SelectItem>{customers.map(customer => (<SelectItem key={customer.uuid} value={customer.uuid} className="text-xs font-bold">{customer.name.toUpperCase()}</SelectItem>))}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-5 py-3 flex items-center justify-between shrink-0 border-b bg-white dark:bg-zinc-900"><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Item Terpilih ({fields.length})</span><button type="button" onClick={() => remove()} className="text-[10px] font-bold text-destructive hover:underline uppercase">Hapus Semua</button></div>
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {fields.length === 0 ? <div className="h-40 flex flex-col items-center justify-center opacity-30"><ShoppingCart className="h-8 w-8 mb-2" /><p className="text-[10px] font-bold uppercase tracking-widest">Kosong</p></div> : fields.map((field, index) => {
                      const currentQty = form.watch(`items.${index}.quantity`);
                      return (
                        <div key={field.id} className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-100 transition-colors">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-sm line-clamp-1">{field.name}</h4><p className="text-[10px] text-zinc-400 font-bold">{formatCurrency(field.price || 0)}</p></div>
                            <p className="font-black text-sm">{formatCurrency((field.price || 0) * currentQty)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white dark:bg-zinc-800 rounded-lg p-0.5 border shadow-sm shrink-0">
                              <button type="button" className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700" onClick={() => currentQty <= 1 ? remove(index) : form.setValue(`items.${index}.quantity`, currentQty - 1)}>
                                {currentQty <= 1 ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> : '−'}
                              </button>
                              <div className="w-8 text-center text-xs font-bold">{currentQty}</div>
                              <button type="button" className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700" onClick={() => form.setValue(`items.${index}.quantity`, currentQty + 1)}>+</button>
                            </div>
                            <input 
                              placeholder="Catatan..." 
                              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg h-8 text-xs px-3 font-medium outline-none focus:ring-1 focus:ring-primary/30 transition-shadow" 
                              {...form.register(`items.${index}.notes`)} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-5 border-t bg-white dark:bg-zinc-900 space-y-4 shrink-0 shadow-lg">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      placeholder="KODE PROMO" 
                      className={`flex-1 h-9 bg-zinc-50 dark:bg-zinc-800 border rounded-lg px-3 text-[10px] font-bold uppercase outline-none focus:ring-1 transition-all ${discountError ? 'border-destructive ring-destructive/20' : 'border-zinc-200 dark:border-zinc-700'}`}
                      value={discountCode} 
                      onChange={(e) => {setDiscountCode(e.target.value.toUpperCase()); setDiscountError('');}} 
                    />
                    <Button type="button" size="sm" variant="secondary" className="h-9 px-4 font-bold text-xs" onClick={handleApplyDiscount} disabled={discountLoading || !discountCode}>
                      {discountLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'PAKAI'}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-[10px] font-bold text-destructive px-1 animate-in fade-in slide-in-from-top-1">
                      {discountError}
                    </p>
                  )}
                </div>
                {appliedDiscount && <div className="bg-primary/10 rounded-lg p-2.5 flex items-center justify-between"><div className="flex items-center gap-2"><Tag size={14} className="text-primary" /><span className="text-[10px] font-bold text-primary">{appliedDiscount.code}</span></div><button onClick={handleRemoveDiscount} className="text-primary"><X size={14} /></button></div>}
                <div className="space-y-1.5 px-1">
                  <div className="flex justify-between items-center text-zinc-400"><p className="text-[10px] font-bold uppercase">Subtotal</p><p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(subtotal)}</p></div>
                  {appliedDiscount && <div className="flex justify-between items-center text-green-600"><p className="text-[10px] font-bold uppercase">Diskon</p><p className="text-xs font-bold italic">-{formatCurrency(calculateDiscountAmount(subtotal))}</p></div>}
                  <div className="flex justify-between items-center pt-2 border-t"><p className="text-sm font-bold uppercase">Total</p><p className="text-xl font-black text-primary">{formatCurrency(Math.max(0, subtotal - calculateDiscountAmount(subtotal)))}</p></div>
                </div>
                <Button type="button" className="w-full h-12 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm" disabled={submitting || fields.length === 0} onClick={() => setIsConfirmOpen(true)}>{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'KONFIRMASI PESANAN'}</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold">Review Pesanan</DialogTitle><DialogDescription className="text-xs text-zinc-500">Konfirmasi detail pesanan sebelum memproses.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto no-scrollbar">
            <div className="flex justify-between text-xs"><span className="text-zinc-500">Tipe Layanan</span><span className="font-bold">{form.getValues('type')}</span></div>
            <div className="flex justify-between text-xs"><span className="text-zinc-500">Meja</span><span className="font-bold">{form.getValues('tableUuid') !== 'none' ? tables.find(t => t.uuid === form.getValues('tableUuid'))?.number : '-'}</span></div>
            <div className="divide-y">
              {fields.map((item, index) => (
                <div key={item.id} className="py-2 flex justify-between text-xs">
                  <span>{form.watch(`items.${index}.quantity`)}x {item.name}</span>
                  <span className="font-bold">{formatCurrency((item.price || 0) * form.watch(`items.${index}.quantity`))}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs"><span className="text-zinc-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {appliedDiscount && <div className="flex justify-between text-xs text-green-600"><span>Diskon</span><span>-{formatCurrency(calculateDiscountAmount(subtotal))}</span></div>}
            <div className="flex justify-between text-base font-black pt-2 border-t"><span>Total</span><span>{formatCurrency(Math.max(0, subtotal - calculateDiscountAmount(subtotal)))}</span></div>
          </div>
          <DialogFooter className="flex flex-row gap-2 pt-4">
            <Button variant="ghost" className="flex-1 font-bold h-11" onClick={() => setIsConfirmOpen(false)}>Edit</Button>
            <Button className="flex-1 font-bold h-11" onClick={form.handleSubmit(onFormSubmit)} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Selesaikan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
