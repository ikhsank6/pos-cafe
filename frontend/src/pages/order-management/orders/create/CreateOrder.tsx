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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Search, 
  ArrowLeft, 
  ShoppingCart, 
  ClipboardList,
  ChevronRight,
  Tag,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { orderService, type CreateOrderData } from '@/services/order.service';
import { productService, type Product } from '@/services/product.service';
import { tableService, type Table } from '@/services/table.service';
import { customerService, type Customer } from '@/services/customer.service';
import { categoryService, type Category } from '@/services/category.service';
import { discountService, type Discount } from '@/services/discount.service';
import { formatCurrency, showSuccess, showError } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  
  // Discount state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

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

  const calculateSubtotal = () => {
    const items = form.watch('items') || [];
    return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  };

  const subtotal = calculateSubtotal();

  // Auto-remove discount if subtotal drops below minPurchase
  useEffect(() => {
    if (appliedDiscount && appliedDiscount.minPurchase && subtotal < appliedDiscount.minPurchase) {
      setAppliedDiscount(null);
      setDiscountError(`Diskon dilepas: Minimum belanja ${formatCurrency(appliedDiscount.minPurchase)} belum terpenuhi`);
      showError(`Diskon ${appliedDiscount.code} dilepas karena subtotal tidak memenuhi syarat.`);
    }
  }, [subtotal, appliedDiscount]);

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
    
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const subtotal = calculateSubtotal();
      const response = await discountService.validateCode(discountCode, subtotal);
      
      // Based on typical response structure { message, data: { discount, discountAmount } }
      if (response && (response as any).data) {
        setAppliedDiscount((response as any).data.discount);
        showSuccess('Diskon berhasil diterapkan');
      } else {
        setDiscountError('Kode diskon tidak valid');
      }
    } catch (error: any) {
      setDiscountError(error?.response?.data?.meta?.message || 'Gagal memverifikasi diskon');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
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
        tableUuid: data.tableUuid === 'none' ? undefined : (data.tableUuid || undefined),
        customerUuid: data.customerUuid === 'none' ? undefined : (data.customerUuid || undefined),
        discountCode: appliedDiscount?.code,
        notes: data.notes,
        items: data.items.map(item => ({
          productUuid: item.productUuid,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };
      await orderService.create(payload);
      showSuccess('Order berhasil dibuat');
      navigate('/admin/order-management/orders');
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
            <div className="absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm font-medium animate-pulse text-muted-foreground">Menyiapkan Sistem POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/30 dark:bg-zinc-950">
      {/* Top Header - Simple */}
      <div className="flex items-center justify-between px-6 py-3 bg-background border-b shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/admin/order-management/orders')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">POS - Order Baru</h1>
            <p className="text-xs text-muted-foreground">Buat pesanan baru</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/order-management/orders')}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button 
            onClick={form.handleSubmit(onFormSubmit)} 
            disabled={submitting || fields.length === 0}
          >
            {submitting ? 'Memproses...' : 'Proses Pesanan'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col bg-background border-r">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari produk..." 
                className="pl-10 h-10"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b bg-muted/30">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Semua
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.uuid}
                variant={selectedCategory === cat.uuid ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.uuid)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredProducts.map(product => {
                const addedItem = fields.find(f => f.productUuid === product.uuid);
                const addedQty = addedItem ? form.watch(`items.${fields.indexOf(addedItem)}.quantity`) : 0;
                
                return (
                  <Card 
                    key={product.uuid} 
                    className={`group relative border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${addedQty > 0 ? 'ring-2 ring-primary bg-primary/5' : 'bg-card'}`}
                    onClick={() => handleAddProduct(product)}
                  >
                    {/* Floating Price Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-background/90 backdrop-blur-md text-foreground border shadow-sm font-bold">
                        {formatCurrency(Number(product.price))}
                      </Badge>
                    </div>

                    {/* Quantity Badge */}
                    {addedQty > 0 && (
                      <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-black shadow-lg animate-in zoom-in-50 duration-300">
                        {addedQty}
                      </div>
                    )}
                    
                    <CardContent className="p-0 flex-1 flex flex-col">
                      {/* Image Container */}
                      <div className="aspect-4/3 bg-muted relative overflow-hidden">
                        {product.media?.path ? (
                          <img 
                            src={`${env.API_URL}${product.media.path}`} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                            <span className="text-4xl font-bold text-muted-foreground/20 italic">{product.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* Info Container */}
                      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">
                            {product.category?.name || 'Reguler'}
                          </p>
                          <h3 className="font-bold text-sm tracking-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </div>
                        
                        {/* Control Section */}
                        <div>
                          {addedQty > 0 ? (
                            <div className="flex items-center justify-between border rounded-full p-1 bg-background/50 backdrop-blur-sm shadow-inner">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-destructive hover:text-white transition-all active:scale-90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const index = fields.indexOf(addedItem!);
                                  if (addedQty <= 1) {
                                    remove(index);
                                  } else {
                                    form.setValue(`items.${index}.quantity`, addedQty - 1);
                                  }
                                }}
                              >
                                {addedQty <= 1 ? <Trash2 className="h-4 w-4" /> : <span className="text-lg font-bold">−</span>}
                              </Button>
                              <span className="text-sm font-black w-6 text-center">{addedQty}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-all active:scale-90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(product);
                                }}
                              >
                                <span className="text-lg font-bold">+</span>
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full rounded-full border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all font-bold text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(product);
                              }}
                            >
                              <Plus className="mr-2 h-3.5 w-3.5" />
                              TAMBAH
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-[400px] flex flex-col bg-background border-l shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex flex-col h-full overflow-hidden">
              {/* Order Info - Compact */}
              <div className="p-4 space-y-4 border-b shrink-0 bg-muted/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Informasi Order
                  </h2>
                  <Badge variant="outline" className="bg-background">{form.getValues('type')}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue placeholder="Tipe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DINE_IN" className="text-xs">Makan Sini</SelectItem>
                            <SelectItem value="TAKEAWAY" className="text-xs">Bawa Pulang</SelectItem>
                            <SelectItem value="DELIVERY" className="text-xs">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tableUuid"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue placeholder="Meja" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none" className="text-xs">Tanpa Meja</SelectItem>
                            {tables.map(table => (
                              <SelectItem key={table.uuid} value={table.uuid} className="text-xs">
                                Meja {table.number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerUuid"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs bg-background">
                            <SelectValue placeholder="Pilih Pelanggan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs">Walk-in Customer</SelectItem>
                          {customers.map(customer => (
                            <SelectItem key={customer.uuid} value={customer.uuid} className="text-xs">
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Items List Header */}
              <div className="px-4 py-2 border-b bg-muted/10 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm">Item Pesanan</span>
                </div>
                <Badge className="font-bold">{fields.length} Items</Badge>
              </div>

              {/* Scrollable Items */}
              <ScrollArea className="flex-1 bg-muted/5">
                <div className="p-4 space-y-3">
                  {fields.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                      <ShoppingCart className="h-12 w-12 mb-2" />
                      <p className="text-sm font-medium">Belum ada item</p>
                    </div>
                  ) : (
                    fields.map((field, index) => {
                      const currentQty = form.watch(`items.${index}.quantity`);
                      const itemTotal = (field.price || 0) * currentQty;
                      
                      return (
                        <div 
                          key={field.id} 
                          className="bg-background rounded-xl border p-3 shadow-sm space-y-3"
                        >
                          <div className="flex justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm line-clamp-1">{field.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                {formatCurrency(field.price || 0)} x {currentQty}
                              </p>
                            </div>
                            <p className="font-bold text-sm text-primary">
                              {formatCurrency(itemTotal)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 shrink-0 border">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-md"
                                onClick={() => {
                                  if (currentQty <= 1) {
                                    remove(index);
                                  } else {
                                    form.setValue(`items.${index}.quantity`, currentQty - 1);
                                  }
                                }}
                              >
                                {currentQty <= 1 ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> : <span className="text-lg">−</span>}
                              </Button>
                              <div className="w-8 text-center text-sm font-bold">{currentQty}</div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-md"
                                onClick={() => {
                                  form.setValue(`items.${index}.quantity`, currentQty + 1);
                                }}
                              >
                                <span className="text-lg">+</span>
                              </Button>
                            </div>
                            
                            <div className="relative flex-1">
                              <Input 
                                placeholder="Catatan..." 
                                className="h-8 text-[11px] pl-2 bg-muted/20 border-none focus-visible:ring-1"
                                {...form.register(`items.${index}.notes`)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Actions & Summary Section */}
              <div className="p-4 border-t bg-background shadow-[0_-10px_20px_rgba(0,0,0,0.03)] space-y-4 shrink-0">
                {/* Discount Tool */}
                {!appliedDiscount ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Kode Diskon..." 
                          className={`pl-9 h-10 text-xs font-mono uppercase transition-all ${discountError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                          value={discountCode}
                          onChange={(e) => {
                            setDiscountCode(e.target.value);
                            setDiscountError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyDiscount();
                            }
                          }}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="h-10 px-4 font-bold text-xs"
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !discountCode}
                      >
                        {discountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'PAKAI'}
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-[10px] text-destructive font-bold pl-1 animate-in fade-in slide-in-from-top-1">
                        {discountError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white shadow-md">
                        <Check className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary tracking-tight leading-none mb-1">DISKON AKTIF</p>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-foreground/70 uppercase leading-none">Code: {appliedDiscount.code}</p>
                          {Number(appliedDiscount.minPurchase) > 0 && (
                            <p className="text-[9px] text-primary/80 font-bold leading-none animate-pulse">
                              Min. Order: {formatCurrency(Number(appliedDiscount.minPurchase))}
                            </p>
                          )}
                          {Number(appliedDiscount.maxDiscount) > 0 && (
                            <p className="text-[9px] text-primary/80 font-bold leading-none">
                              Max. Potongan: {formatCurrency(Number(appliedDiscount.maxDiscount))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleRemoveDiscount}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Billing Summary */}
                <div className="bg-muted/10 rounded-2xl p-1 space-y-1">
                  <div className="flex justify-between items-center px-3 py-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Subtotal</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(calculateSubtotal())}
                    </p>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between items-center px-3 py-1 bg-green-50/50 dark:bg-green-500/10 rounded-lg">
                      <p className="text-[11px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center gap-1">
                        Diskon {appliedDiscount.type === 'PERCENTAGE' && `(${appliedDiscount.value}%)`}
                      </p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-500">
                        − {formatCurrency(calculateDiscountAmount(calculateSubtotal()))}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center px-3 pt-3 pb-2 border-t mt-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-black tracking-tighter text-primary">
                      {formatCurrency(Math.max(0, calculateSubtotal() - calculateDiscountAmount(calculateSubtotal())))}
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Catatan pesanan (opsional)..." 
                          className="bg-muted/30 border-none text-xs h-10 rounded-xl"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 text-sm font-black rounded-2xl shadow-xl shadow-primary/20 ring-offset-background transition-all active:scale-[0.98] bg-primary hover:bg-primary/95"
                  disabled={submitting || fields.length === 0}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      BUAT PESANAN
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
