"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react"
import { searchLocalInvoice, submitReturn } from "@/app/actions/retur"
import Link from "next/link"

export function ReturForm() {
  const router = useRouter()
  const [currentInput, setCurrentInput] = useState("")
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [searchMessage, setSearchMessage] = useState("")
  
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [returnReason, setReturnReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    const invoiceNo = currentInput.trim()
    if (!invoiceNo) return

    setSearchStatus("loading")
    setSearchMessage("")
    setInvoiceData(null)
    setReturnReason("")

    const res = await searchLocalInvoice(invoiceNo)
    
    if (res.success) {
      setSearchStatus("success")
      setInvoiceData(res.data)
    } else {
      setSearchStatus("error")
      setSearchMessage(res.error || "Gagal menemukan faktur.")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceData || !returnReason.trim()) return

    setIsSubmitting(true)
    const res = await submitReturn(invoiceData.invoice_no, returnReason)
    
    if (res.success) {
      alert("Retur berhasil dicatat.")
      setInvoiceData(null)
      setCurrentInput("")
      setReturnReason("")
      setSearchStatus("idle")
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      alert(res.error || "Terjadi kesalahan saat memproses retur.")
    }
    
    setIsSubmitting(false)
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Form Barang Tidak Terkirim / Retur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/20">
            <label className="text-sm font-medium">Nomor Faktur</label>
            <div className="flex items-center gap-3">
              <Input 
                ref={inputRef}
                placeholder="Scan / Ketik No. Faktur + Enter"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                autoFocus
              />
              <Button 
                type="button" 
                onClick={handleSearch}
                disabled={searchStatus === "loading" || !currentInput.trim()}
                className="w-32"
              >
                {searchStatus === "loading" ? "Mencari..." : "Cari Faktur"}
              </Button>
            </div>
            {searchStatus === "error" && (
              <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                <AlertCircle className="h-4 w-4" />
                <span>{searchMessage}</span>
              </div>
            )}
          </div>

          {invoiceData && (
            <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 bg-card shadow-sm">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Data Pengiriman Ditemukan
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">No. Faktur</p>
                  <p className="font-semibold">{invoiceData.invoice_no}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">No. Transaksi / Manifest</p>
                  <p className="font-mono">{invoiceData.transaction_no}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">{invoiceData.customer_name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kendaraan & Kru</p>
                  <p className="">{invoiceData.vehicle_plate} (S: {invoiceData.driver_name}, K: {invoiceData.helper_name})</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-sm mb-2">Rincian Barang:</p>
                <div className="text-sm p-3 bg-muted/30 rounded-md">
                  {invoiceData.items && invoiceData.items.length > 0 ? (
                    <ul className="space-y-1">
                      {invoiceData.items.map((it: any, i: number) => (
                        <li key={i}>• {it.item_name} <span className="font-semibold">({it.quantity})</span></li>
                      ))}
                    </ul>
                  ) : (
                    <p>{invoiceData.items_summary || "Detail barang tidak tersedia"}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <label className="text-sm font-medium text-red-600">Alasan Retur / Tidak Terkirim *</label>
                <Input 
                  required
                  placeholder="Contoh: Toko tutup, barang rusak, ditolak penerima, dll."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="border-red-200 focus-visible:ring-red-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => {
                  setInvoiceData(null);
                  setCurrentInput("");
                }}>Batal</Button>
                <Button type="submit" variant="destructive" disabled={isSubmitting || !returnReason.trim()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Menyimpan..." : "Simpan Retur"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
