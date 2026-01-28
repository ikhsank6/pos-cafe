import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Percent, Save, Loader2 } from "lucide-react"
import { settingsService } from "@/services/settings.service"
import { showSuccess, showError } from "@/lib/utils"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxRate, setTaxRate] = useState("0")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getTaxSettings()
      setTaxEnabled(data.taxEnabled)
      setTaxRate(data.taxRate.toString())
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      showError("Gagal mengambil pengaturan")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await settingsService.updateTaxSettings({
        taxEnabled: taxEnabled ? "true" : "false",
        taxRate: taxRate
      })
      showSuccess("Pengaturan berhasil disimpan")
    } catch (error) {
      console.error("Failed to save settings:", error)
      showError("Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Pajak</h2>
        <p className="text-muted-foreground">Kelola persentase pajak dan biaya layanan cafe Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Pengaturan Pajak</CardTitle>
                <CardDescription>Konfigurasi Pajak (PPN/Service Charge)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 border p-4 rounded-xl bg-secondary/20">
              <div className="space-y-0.5">
                <Label htmlFor="tax-enabled">Aktifkan Pajak</Label>
                <p className="text-[12px] text-muted-foreground">Terapkan pajak pada setiap pesanan baru.</p>
              </div>
              <Switch
                id="tax-enabled"
                checked={taxEnabled}
                onCheckedChange={setTaxEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Persentase Pajak (%)</Label>
              <div className="relative">
                <Input
                  id="tax-rate"
                  type="number"
                  placeholder="Contoh: 10"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  disabled={!taxEnabled}
                  className="pl-3 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  %
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pajak akan dihitung dari subtotal setelah dikurangi diskon.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-secondary/10 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-muted-foreground">Pengaturan Lainnya</CardTitle>
                <CardDescription>Segera hadir</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Modul tambahan akan tersedia pada update berikutnya.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
