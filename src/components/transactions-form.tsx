"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Crew, Vehicle } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createTransaction } from "@/app/actions"
import { PlusCircle, Trash2, ArrowLeft, Search, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { searchSalesInvoice } from "@/app/actions/accurate"

export function TransactionsForm({ crews, vehicles }: { crews: Crew[], vehicles: Vehicle[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    transaction_no: "",
    transaction_date: new Date().toISOString().split('T')[0],
    driver_id: "",
    helper_id: "",
    vehicle_plate: "",
    invoices: [] as { no: string, data: any }[]
  })

  const [currentInput, setCurrentInput] = useState("")
  const [inputStatus, setInputStatus] = useState<"idle" | "loading" | "error">("idle")
  const [inputError, setInputError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-generate transaction number on mount
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    const autoNumber = `TRF-${year}${month}${day}-${hours}${minutes}${seconds}`
    setFormData(prev => ({ ...prev, transaction_no: autoNumber }))
  }, [])

  const handleRemoveInvoice = (index: number) => {
    const newInvoices = formData.invoices.filter((_, i) => i !== index)
    setFormData({ ...formData, invoices: newInvoices })
  }

  const handleVerifyCurrent = async () => {
    const invoiceNo = currentInput.trim();
    if (!invoiceNo) return;
    
    // Check duplicates
    if (formData.invoices.some(inv => inv.no === invoiceNo)) {
      setInputStatus("error");
      setInputError("Faktur sudah ada di dalam daftar!");
      return;
    }

    setInputStatus("loading");
    setInputError("");

    const res = await searchSalesInvoice(invoiceNo);
    
    if (res.success) {
      setFormData(prev => ({ 
        ...prev, 
        invoices: [...prev.invoices, { no: invoiceNo, data: res.data }] 
      }));
      setCurrentInput("");
      setInputStatus("idle");
    } else {
      setInputStatus("error");
      setInputError(res.error || "Gagal verifikasi ke Accurate");
    }
    
    // Keep focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerifyCurrent();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const validInvoices = formData.invoices;
      if (validInvoices.length === 0) {
        alert("Harap masukkan setidaknya satu nomor invoice.")
        setIsSubmitting(false)
        return
      }
      
      const invoicesToSubmit = validInvoices.map(inv => ({
        invoice_no: inv.no.trim(),
        customer_code: inv.data?.customer_code,
        customer_name: inv.data?.company_name,
        customer_address: inv.data?.customer_address,
        items_summary: inv.data?.items_summary,
        total_amount: inv.data?.total_amount,
        extracted_items: inv.data?.extracted_items
      }));

      const result = await createTransaction({
        ...formData,
        invoices: invoicesToSubmit
      })

      if (result && !result.success) {
        alert(result.error)
        setIsSubmitting(false)
        return
      }

      router.push("/transactions")
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat menyimpan transaksi.")
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Detail Manifest</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">No. Transaksi / Surat Jalan (Otomatis)</label>
              <Input 
                required
                readOnly
                className="bg-muted font-mono"
                placeholder="TRF-YYYYMMDD-HHMMSS"
                value={formData.transaction_no}
                onChange={(e) => setFormData({...formData, transaction_no: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Transaksi</label>
              <Input 
                type="date"
                required
                value={formData.transaction_date}
                onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Pilih Kendaraan & Awak</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kendaraan</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})}
                >
                  <option value="" disabled>Pilih Kendaraan</option>
                  {vehicles.map(v => (
                    <option key={v.plate_number} value={v.plate_number}>
                      {v.plate_number} - {v.vehicle_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Supir (Driver)</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                  value={formData.driver_id}
                  onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                >
                  <option value="" disabled>Pilih Supir</option>
                  {crews.filter(c => c.id !== formData.helper_id).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kenek (Helper)</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                  value={formData.helper_id}
                  onChange={(e) => setFormData({...formData, helper_id: e.target.value})}
                >
                  <option value="" disabled>Pilih Kenek</option>
                  {crews.filter(c => c.id !== formData.driver_id).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Daftar Invoice / Kargo</h3>
            </div>
            
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/20">
              <label className="text-sm font-medium">Input/Scan Barcode Faktur</label>
              <div className="flex items-center gap-3">
                <Input 
                  ref={inputRef}
                  placeholder="Scan Barcode / Ketik Faktur + Enter"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 invoice-input border-primary/20 focus-visible:ring-primary"
                  autoFocus
                />
                <Button 
                  type="button" 
                  onClick={handleVerifyCurrent}
                  disabled={inputStatus === "loading" || !currentInput.trim()}
                  className="w-32"
                >
                  {inputStatus === "loading" ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                      Mencari...
                    </>
                  ) : "Tambahkan"}
                </Button>
              </div>
              {inputStatus === "error" && (
                <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{inputError}</span>
                </div>
              )}
            </div>

            {formData.invoices.length > 0 && (
              <div className="rounded-md border overflow-hidden mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium w-12">No</th>
                      <th className="px-4 py-2 text-left font-medium">No. Faktur</th>
                      <th className="px-4 py-2 text-left font-medium">Pelanggan</th>
                      <th className="px-4 py-2 text-left font-medium">Nama Barang & Qty</th>
                      <th className="px-4 py-2 text-center font-medium w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.invoices.map((inv, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3 font-mono font-medium">{inv.no}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{inv.data?.company_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-muted-foreground wrap-break-word max-w-50 md:max-w-xs space-y-1">
                            {inv.data?.extracted_items && inv.data.extracted_items.length > 0 ? (
                              inv.data.extracted_items.map((item: any, i: number) => (
                                <div key={i}>• {item.item_name} <span className="font-semibold">({item.quantity})</span></div>
                              ))
                            ) : (
                              inv.data?.items_summary || <span className="text-red-400 italic">Data barang kosong</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleRemoveInvoice(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-6 flex gap-3 justify-end">
            <Link href="/transactions">
              <Button type="button" variant="ghost">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || formData.invoices.length === 0}>
              {isSubmitting ? "Menyimpan..." : "Simpan Manifest"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
