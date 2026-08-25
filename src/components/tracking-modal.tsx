"use client"

import { useState } from "react"
import { getTrackingHistory } from "@/app/actions/tracking"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, MapPin, Package, CheckCircle2, Truck, Clock, Navigation } from "lucide-react"
import { Map, Marker } from "pigeon-maps"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TrackingModal({ invoice_no }: { invoice_no: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !data) {
      setLoading(true)
      const result = await getTrackingHistory(invoice_no)
      if (!result.error && result.data) {
        setData(result.data)
      }
      setLoading(false)
    }
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

  const latestLocation = data?.trackingHistory?.find((h: any) => h.lat && h.lng)
  const latestCoords = latestLocation ? { lat: latestLocation.lat, lng: latestLocation.lng } : null

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>
        <Badge variant="outline" className="bg-background flex items-center gap-1 font-normal text-xs border-primary/30 cursor-pointer hover:bg-primary/10 transition-colors">
          <FileText className="h-3 w-3 text-primary" />
          {invoice_no}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Navigation className="h-5 w-5 text-primary" />
            Lacak Resi: <span className="font-mono text-primary">{invoice_no}</span>
          </DialogTitle>
          <DialogDescription>
            Informasi pengiriman dan posisi realtime paket.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Navigation className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-muted-foreground">
            Data pelacakan tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {latestCoords ? (
              <div className="rounded-xl overflow-hidden border shadow-inner h-50 relative">
                <Map height={200} defaultCenter={[latestCoords.lat, latestCoords.lng]} defaultZoom={13}>
                  <Marker width={50} anchor={[latestCoords.lat, latestCoords.lng]} color="#f97316" />
                </Map>
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs px-2 py-1 rounded shadow text-foreground font-medium flex items-center gap-1 border">
                  <MapPin className="h-3 w-3 text-primary" /> Posisi Terakhir
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Titik koordinat GPS belum tersedia untuk resi ini.
              </div>
            )}

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
              {data.trackingHistory.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Belum ada riwayat perjalanan.</p>
              ) : (
                data.trackingHistory.map((history: any) => (
                  <div key={history.id} className="relative flex items-center justify-normal gap-4 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/10 text-primary shrink-0 z-10">
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="flex-1 p-3 rounded-lg border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-primary text-sm">{getStatusText(history.status)}</span>
                        <time className="text-xs font-medium text-muted-foreground">
                          {new Date(history.timestamp).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
                          })}
                        </time>
                      </div>
                      {history.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 mt-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-medium">{history.location}</span>
                        </div>
                      )}
                      {history.description && (
                        <p className="text-xs mt-1.5">{history.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
