"use client"

import { useState } from "react"
import { getTrackingHistory } from "@/app/actions/tracking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, MapPin, Package, CheckCircle2, Truck, Clock } from "lucide-react"

export default function TrackPage() {
  const [resi, setResi] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!resi.trim()) return

    setLoading(true)
    setError(null)
    setData(null)

    const result = await getTrackingHistory(resi)
    if (result.error) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-5 w-5 text-amber-500" />
      case "IN_TRANSIT": return <Truck className="h-5 w-5 text-blue-500" />
      case "DELIVERED": return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default: return <Package className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Menunggu Pengiriman"
      case "IN_TRANSIT": return "Dalam Perjalanan"
      case "DELIVERED": return "Telah Terkirim"
      case "CANCELLED": return "Dibatalkan"
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Lacak Kiriman
          </h1>
          <p className="text-muted-foreground">Masukkan nomor resi / invoice untuk melihat status pengiriman.</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                value={resi}
                onChange={(e) => setResi(e.target.value)}
                placeholder="Contoh: INV-JKT-TSK-001"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={loading || !resi.trim()}>
                {loading ? "Mencari..." : <><Search className="mr-2 h-4 w-4" /> Lacak</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Nomor Resi</CardDescription>
                    <CardTitle className="text-xl font-mono text-primary">{data.invoice_no}</CardTitle>
                  </div>
                  <div className="text-right">
                    <CardDescription>Status Saat Ini</CardDescription>
                    <div className="font-bold uppercase tracking-wider flex items-center justify-end gap-2 mt-1">
                      {getStatusIcon(data.status)}
                      {getStatusText(data.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 pb-6 border-b">
                  <div>
                    <p className="text-muted-foreground mb-1">Kurir / Driver</p>
                    <p className="font-medium capitalize">{data.transaction.driver.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Kenek</p>
                    <p className="font-medium capitalize">{data.transaction.helper.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Kendaraan</p>
                    <p className="font-medium uppercase">{data.transaction.vehicle.plate_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Tgl Manifest</p>
                    <p className="font-medium">
                      {new Date(data.transaction.transaction_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
                  {data.trackingHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground">Belum ada riwayat perjalanan.</p>
                  ) : (
                    data.trackingHistory.map((history: any, idx: number) => (
                      <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {getStatusIcon(history.status)}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-primary">{getStatusText(history.status)}</span>
                            <time className="text-xs font-medium text-muted-foreground">
                              {new Date(history.timestamp).toLocaleString('id-ID', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
                              })}
                            </time>
                          </div>
                          {history.location && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2 mt-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium">{history.location}</span>
                            </div>
                          )}
                          {history.description && (
                            <p className="text-sm mt-2">{history.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                            Diupdate oleh: <span className="font-medium">{history.updated_by}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
