import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Users, 
  Wallet, 
  ShoppingBag, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Calendar,
  RefreshCw
} from "lucide-react"
import { dashboardService, type DashboardStats } from "@/services/dashboard.service"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: ""
  })

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getStats({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      })
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [filters.startDate, filters.endDate])

  const handleReset = () => {
    setFilters({ startDate: "", endDate: "" })
  }

  const isFiltering = !!(filters.startDate || filters.endDate)

  const statCards = [
    {
      title: "Total Pendapatan",
      value: formatCurrency(stats?.totalIncome || 0),
      description: isFiltering ? "Pendapatan di periode ini" : "Total pendapatan akumulasi",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Order Terbayar",
      value: stats?.totalPaidOrders?.toLocaleString() || "0",
      description: isFiltering ? "Order terbayar di periode ini" : "Total order terbayar",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: isFiltering ? "Pelanggan Baru" : "Total Pelanggan",
      value: (isFiltering ? stats?.newCustomersInPeriod : stats?.totalCustomers)?.toLocaleString() || "0",
      description: isFiltering ? "Pelanggan baru di periode ini" : "Jumlah pelanggan terdaftar",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Pending Order",
      value: stats?.ordersByStatus.find(s => s.status === 'PENDING')?.count?.toLocaleString() || "0",
      description: "Order yang belum diproses",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
  ]

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Selamat datang kembali! Berikut adalah ringkasan bisnis Anda.</p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-card p-3 rounded-xl border border-border/50 shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 bg-secondary/70 h-10 px-3 rounded-lg self-stretch sm:self-auto">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">Filter Tanggal</span>
          </div>
          
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto min-w-0">
            <div className="flex-1 min-w-[140px]">
              <DatePicker 
                date={filters.startDate ? new Date(filters.startDate) : undefined}
                setDate={(date) => setFilters(prev => ({ ...prev, startDate: date ? format(date, "yyyy-MM-dd") : "" }))}
                placeholder="Mulai"
              />
            </div>
            <span className="text-muted-foreground text-xs font-semibold px-1 select-none">s/d</span>
            <div className="flex-1 min-w-[140px]">
              <DatePicker 
                date={filters.endDate ? new Date(filters.endDate) : undefined}
                setDate={(date) => setFilters(prev => ({ ...prev, endDate: date ? format(date, "yyyy-MM-dd") : "" }))}
                placeholder="Selesai"
              />
            </div>
          </div>

          {isFiltering && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-10 px-3 text-xs font-medium self-stretch sm:self-auto"
              onClick={handleReset}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Status Breakdown */}
            <Card className="lg:col-span-12 xl:col-span-7 border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Status Order</CardTitle>
                <CardDescription>
                  Ringkasan status order pada periode terpilih.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {stats?.ordersByStatus.map((item) => {
                    const total = stats.ordersByStatus.reduce((sum, s) => sum + s.count, 0) || 1;
                    const percentage = (item.count / total) * 100;
                    
                    const statusConfig = {
                      'PENDING': 'bg-yellow-500',
                      'CONFIRMED': 'bg-blue-500',
                      'PREPARING': 'bg-orange-500',
                      'READY': 'bg-green-400',
                      'SERVED': 'bg-teal-500',
                      'COMPLETED': 'bg-green-600',
                      'CANCELLED': 'bg-red-500',
                    } as Record<string, string>;

                    return (
                      <div key={item.status} className="space-y-1.5">
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.status}
                          </span>
                          <span className="text-sm font-bold">{item.count}</span>
                        </div>
                        <div className="w-full bg-secondary/40 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${statusConfig[item.status] || 'bg-primary'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {(!stats?.ordersByStatus || stats?.ordersByStatus.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                      <Activity className="h-12 w-12 mb-3 opacity-10" />
                      <p className="text-sm font-medium">Tidak ada data order.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-12 xl:col-span-5 border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Transaksi Terbaru</CardTitle>
                <CardDescription>
                  5 transaksi terbaru hari ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {stats?.recentTransactions.map((tx) => (
                    <div key={tx.uuid} className="group flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className={`p-2.5 rounded-full ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 
                        tx.status === 'REFUNDED' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                        'bg-red-100 dark:bg-red-900/20 text-red-600'
                      }`}>
                        {tx.status === 'COMPLETED' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{tx.orderNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-foreground">{formatCurrency(tx.amount)}</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{formatDateTime(tx.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentTransactions || stats?.recentTransactions.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                      <TrendingUp className="h-12 w-12 mb-3 opacity-10" />
                      <p className="text-sm font-medium">Belum ada transaksi.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}


