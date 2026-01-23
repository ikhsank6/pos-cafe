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
  FormLabel,
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
  ChevronRight
} from 'lucide-react';
import { orderService, type CreateOrderData } from '@/services/order.service';
import { productService, type Product } from '@/services/product.service';
import { tableService, type Table } from '@/services/table.service';
import { customerService, type Customer } from '@/services/customer.service';
import { categoryService, type Category } from '@/services/category.service';
import { formatCurrency, showSuccess, showError } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Memuat POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/order-management/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">POS - Order Baru</h1>
            <p className="text-sm text-muted-foreground">Tambah pesanan baru ke sistem</p>
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
            className="px-8"
          >
            {submitting ? 'Memproses...' : 'Selesaikan Order'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col border-r bg-muted/5">
          {/* Categories Strip */}
          <div className="p-4 border-b bg-background shadow-sm overflow-x-auto scrollbar-none">
            <div className="flex gap-2">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => setSelectedCategory(null)}
              >
                Semua
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat.uuid}
                  variant={selectedCategory === cat.uuid ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setSelectedCategory(cat.uuid)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-background border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari produk berdasarkan nama atau SKU..." 
                className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.uuid} 
                  className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer active:scale-95 border-none bg-background ring-1 ring-border"
                  onClick={() => handleAddProduct(product)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-4/3 bg-muted/30 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="text-muted-foreground font-bold text-lg opacity-20">{product.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1 bg-muted/50 border-none">{product.stock} stk</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Order Summary & Customer Info */}
        <div className="w-[400px] flex flex-col bg-background shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex flex-col h-full">
              {/* Order Info Section */}
              <div className="p-6 space-y-6 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">Informasi Order</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Tipe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DINE_IN">Makan Sini</SelectItem>
                            <SelectItem value="TAKEAWAY">Bawa Pulang</SelectItem>
                            <SelectItem value="DELIVERY">Delivery</SelectItem>
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
                        <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Meja</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Tanpa Meja</SelectItem>
                            {Array.isArray(tables) && tables.map(table => (
                              <SelectItem key={table.uuid} value={table.uuid}>
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
                      <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Pelanggan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Walk-in Customer</SelectItem>
                          {Array.isArray(customers) && customers.map(customer => (
                            <SelectItem key={customer.uuid} value={customer.uuid}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Items List */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b bg-muted/5">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <span className="font-bold">Item Pesanan</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{fields.length} Items</Badge>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {fields.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-30">
                        <Plus className="h-10 w-10 border-2 rounded-full p-2 border-dashed border-muted-foreground" />
                        <p className="text-sm font-medium italic">Klik produk untuk menambah</p>
                      </div>
                    ) : (
                      fields.map((field, index) => (
                        <div key={field.id} className="group p-3 rounded-xl border ring-offset-background transition-all duration-200 hover:ring-1 hover:ring-primary/30 hover:shadow-sm bg-background">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{field.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(field.price || 0)}</p>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 -mt-1 -mr-1" 
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-md hover:bg-background shadow-none"
                                onClick={() => {
                                  const val = form.getValues(`items.${index}.quantity`);
                                  if (val > 1) form.setValue(`items.${index}.quantity`, val - 1);
                                }}
                              >
                                -
                              </Button>
                              <div className="w-8 text-center text-sm font-bold">
                                {form.watch(`items.${index}.quantity`)}
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-md hover:bg-background shadow-none"
                                onClick={() => {
                                  const val = form.getValues(`items.${index}.quantity`);
                                  form.setValue(`items.${index}.quantity`, val + 1);
                                }}
                              >
                                +
                              </Button>
                            </div>
                            <div className="font-bold text-sm text-primary">
                              {formatCurrency((field.price || 0) * form.watch(`items.${index}.quantity`))}
                            </div>
                          </div>
                          
                          <div className="mt-2 group-focus-within:block hidden">
                            <Input 
                              placeholder="Tambah catatan..." 
                              className="h-8 text-xs bg-muted/20 border-none shadow-none"
                              {...form.register(`items.${index}.notes`)}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Order Totals Section */}
              <div className="p-6 bg-muted/5 border-t space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Pembayaran</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                          <Input placeholder="Catatan untuk dapur/kurir..." {...field} className="pl-10 h-10 text-sm bg-background border-muted" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={submitting || fields.length === 0}
                >
                  {submitting ? 'Memproses...' : 'BUAT PESANAN'}
                  {!submitting && <ChevronRight className="ml-2 h-5 w-5" />}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
