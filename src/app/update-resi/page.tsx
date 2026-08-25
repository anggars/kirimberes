"use client"

import { useState, useEffect } from "react"
import { updateTrackingStatus } from "@/app/actions/tracking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScanBarcode, MapPin, CheckCircle2, Navigation } from "lucide-react"

export default function UpdateResiPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(true)
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setGpsLoading(false)
        },
        (error) => {
          console.warn("GPS Location access denied or unavailable", error)
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      setGpsLoading(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateTrackingStatus(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Status untuk resi ${formData.get("invoice_no")} berhasil diperbarui!`)
      // Reset form but keep location
      const form = e.target as HTMLFormElement
      const location = formData.get("location")
      form.reset()
      if (location) {
        (form.elements.namedItem("location") as HTMLInputElement).value = location as string
      }
      // Focus back to invoice input for next scan
      setTimeout(() => {
        const input = document.getElementById("invoice_no")
        if (input) input.focus()
      }, 100)
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Update Status Pengiriman</h1>
        <p className="text-muted-foreground mt-1">
          Scan resi atau input nomor secara manual untuk memperbarui lokasi barang.
        </p>
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/5 border-b pb-6">
          <CardTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5 text-primary" />
            Scanner Input
          </CardTitle>
          <CardDescription>
            Pastikan kursor berada di kolom "Nomor Resi" saat menggunakan alat Scanner Barcode.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 text-green-600 text-sm p-4 rounded-md flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Resi / Invoice</label>
              <Input
                id="invoice_no"
                name="invoice_no"
                required
                placeholder="Scan barcode di sini..."
                className="text-lg py-6 font-mono bg-amber-50 focus-visible:ring-amber-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Baru</label>
                <select 
                  name="status"
                  required
                  defaultValue="IN_TRANSIT"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="PENDING">Menunggu Pengiriman</option>
                  <option value="IN_TRANSIT">Dalam Perjalanan / Transit</option>
                  <option value="DELIVERED">Telah Terkirim (Selesai)</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Lokasi Saat Ini
                </label>
                <Input
                  name="location"
                  placeholder="Misal: Gudang Transit Bandung"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Keterangan / Catatan (Opsional)</span>
                {gpsLoading ? (
                  <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                    <Navigation className="h-3 w-3 animate-spin" /> Mengambil lokasi GPS...
                  </span>
                ) : coords ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> GPS Aktif
                  </span>
                ) : (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> GPS Mati
                  </span>
                )}
              </label>
              <Textarea
                name="description"
                placeholder="Misal: Barang diturunkan di gudang sortir"
                rows={3}
              />
            </div>
            
            {coords && (
              <>
                <input type="hidden" name="lat" value={coords.lat} />
                <input type="hidden" name="lng" value={coords.lng} />
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Menyimpan..." : "Update Status"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
