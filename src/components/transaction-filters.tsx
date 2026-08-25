"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Calendar, User, Truck, FileText } from "lucide-react"

export function TransactionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [date, setDate] = useState(searchParams.get("date") || "")
  const [driver, setDriver] = useState(searchParams.get("driver") || "")
  const [vehicle, setVehicle] = useState(searchParams.get("vehicle") || "")
  const [invoice, setInvoice] = useState(searchParams.get("invoice") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (date) params.set("date", date)
    if (driver) params.set("driver", driver)
    if (vehicle) params.set("vehicle", vehicle)
    if (invoice) params.set("invoice", invoice)

    router.push(`/transactions?${params.toString()}`)
  }

  const handleReset = () => {
    setDate("")
    setDriver("")
    setVehicle("")
    setInvoice("")
    router.push(`/transactions`)
  }

  const hasActiveFilters = Boolean(searchParams.get("date") || searchParams.get("driver") || searchParams.get("vehicle") || searchParams.get("invoice"))

  return (
    <form onSubmit={handleSearch} className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4" /> Filter Pencarian
        </h3>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3 mr-1" /> Reset Filter
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Tanggal
          </label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="h-9 text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <User className="h-3 w-3" /> Supir
          </label>
          <Input 
            type="text" 
            placeholder="Ketik nama supir..." 
            value={driver} 
            onChange={(e) => setDriver(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Truck className="h-3 w-3" /> Kendaraan / Plat
          </label>
          <Input 
            type="text" 
            placeholder="Ketik plat / mobil..." 
            value={vehicle} 
            onChange={(e) => setVehicle(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> No. Invoice
          </label>
          <Input 
            type="text" 
            placeholder="Ketik invoice..." 
            value={invoice} 
            onChange={(e) => setInvoice(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" className="w-full sm:w-auto shadow-sm">
          Terapkan Filter
        </Button>
      </div>
    </form>
  )
}
