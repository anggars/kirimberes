"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Crew, Vehicle } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createTransaction } from "@/app/actions"
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function TransactionsForm({ crews, vehicles }: { crews: Crew[], vehicles: Vehicle[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    transaction_no: "",
    transaction_date: new Date().toISOString().split('T')[0],
    driver_id: "",
    helper_id: "",
    vehicle_plate: "",
    invoices: [""]
  })

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

  const handleAddInvoice = () => {
    setFormData(prev => ({ ...prev, invoices: [...prev.invoices, ""] }))
  }

  const handleRemoveInvoice = (index: number) => {
    const newInvoices = formData.invoices.filter((_, i) => i !== index)
    setFormData({ ...formData, invoices: newInvoices })
  }

  const handleInvoiceChange = (index: number, value: string) => {
    const newInvoices = [...formData.invoices]
    newInvoices[index] = value
    setFormData({ ...formData, invoices: newInvoices })
  }

  // Handle barcode scanner 'Enter' keypress
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission
      
      // Only add a new row if the current one is not empty
      if (formData.invoices[index].trim() !== "") {
        handleAddInvoice()
        
        // Use timeout to wait for React to render the new input, then focus it
        setTimeout(() => {
          const inputs = document.querySelectorAll('.invoice-input')
          if (inputs.length > index + 1) {
            ;(inputs[index + 1] as HTMLInputElement).focus()
          }
        }, 50)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Filter out empty invoices
      const validInvoices = formData.invoices.filter(inv => inv.trim() !== "")
      if (validInvoices.length === 0) {
        alert("Harap masukkan setidaknya satu nomor invoice.")
        setIsSubmitting(false)
        return
      }

      // Check for duplicates within the form
      const uniqueInvoices = new Set(validInvoices)
      if (uniqueInvoices.size !== validInvoices.length) {
        alert("Terdapat nomor invoice ganda (duplikat) di dalam form. Harap periksa kembali.")
        setIsSubmitting(false)
        return
      }

      const result = await createTransaction({
        ...formData,
        invoices: validInvoices
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
                  {crews.map(c => (
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
                  {crews.map(c => (
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
              <Button type="button" variant="outline" size="sm" onClick={handleAddInvoice}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Baris
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.invoices.map((inv, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                  <Input 
                    required
                    autoFocus={index === formData.invoices.length - 1 && index !== 0}
                    placeholder="Scan Barcode / Ketik Invoice + Enter"
                    value={inv}
                    onChange={(e) => handleInvoiceChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="flex-1 invoice-input"
                  />
                  {formData.invoices.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveInvoice(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-3 justify-end">
            <Link href="/transactions">
              <Button type="button" variant="ghost">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Manifest"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
