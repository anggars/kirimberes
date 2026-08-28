"use client"

import { useState } from "react"
import { getTrackingHistory } from "@/app/actions/tracking"
import { Badge } from "@/components/ui/badge"
import { FileText, Navigation, User, MapPin, Package, DollarSign } from "lucide-react"
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

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>
        <Badge variant="outline" className="bg-background flex items-center gap-1 font-normal text-xs border-primary/30 cursor-pointer hover:bg-primary/10 transition-colors">
          <FileText className="h-3 w-3 text-primary" />
          {invoice_no}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Detail Faktur: <span className="font-mono text-primary">{invoice_no}</span>
          </DialogTitle>
          <DialogDescription>
            Informasi pelanggan dan rincian barang dari Accurate.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Navigation className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-muted-foreground">
            Data faktur tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                  <User className="h-4 w-4" /> Pelanggan
                </div>
                <div className="font-medium text-base">
                  {data.customer_code ? `${data.customer_code} - ` : ''}{data.customer_name || "-"}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" /> Nilai Faktur
                </div>
                <div className="font-bold text-lg text-primary">
                  {data.total_amount ? `Rp ${data.total_amount.toLocaleString('id-ID')}` : "-"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" /> Alamat Pengiriman
              </div>
              <div className="text-sm">
                {data.customer_address || "-"}
              </div>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                <Package className="h-4 w-4" /> Rincian Barang
              </div>
              <div className="text-sm font-mono whitespace-pre-wrap">
                {data.items && data.items.length > 0 ? (
                  data.items.map((it: any, i: number) => (
                    <div key={i}>• {it.item_name} ({it.qty} {it.satuan})</div>
                  ))
                ) : (
                  <span className="text-red-400 italic">Data barang kosong</span>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              Tergabung dalam Manifest: <span className="font-mono font-medium">{data.transaction_no}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
