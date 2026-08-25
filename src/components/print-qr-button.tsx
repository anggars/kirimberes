"use client"

import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { QrCode, Printer } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function PrintQRButton({ invoice_no }: { invoice_no: string }) {
  // In a real app, this should be the absolute URL (e.g. https://kirimberes.com/track?resi=...)
  // Since we don't know the exact domain yet, we use a relative-like approach or window.location.origin
  // But for QR code scanning on phones, it MUST be an absolute URL.
  // We'll construct it on render.
  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track?resi=${invoice_no}` : `/track?resi=${invoice_no}`

  const handlePrint = () => {
    const printContent = document.getElementById(`qr-print-${invoice_no}`)
    if (printContent) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload() // Reload to restore React state after raw DOM manipulation
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
          <QrCode className="h-4 w-4" />
        </Button>
      }>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Cetak Label QR Code</DialogTitle>
          <DialogDescription>
            Tempelkan QR Code ini pada barang/kardus untuk dilacak.
          </DialogDescription>
        </DialogHeader>
        
        <div id={`qr-print-${invoice_no}`} className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed rounded-lg mt-4">
          <h2 className="text-xl font-bold mb-4">KirimBeres</h2>
          <QRCodeSVG 
            value={trackingUrl} 
            size={200}
            level="H"
            includeMargin={true}
          />
          <p className="mt-4 font-mono font-bold text-lg">{invoice_no}</p>
          <p className="text-sm text-gray-500 mt-2">Scan untuk melacak resi ini</p>
        </div>

        <Button onClick={handlePrint} className="w-full mt-4">
          <Printer className="mr-2 h-4 w-4" /> Cetak Sekarang
        </Button>
      </DialogContent>
    </Dialog>
  )
}
