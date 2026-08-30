"use client"

import { useState } from "react"
import { Kendaraan } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createVehicle, updateVehicle, deleteVehicle } from "@/app/actions"
import { PlusCircle, Pencil, Trash2, Truck } from "lucide-react"

export function VehiclesClient({ initialVehicles }: { initialVehicles: Kendaraan[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    plat_nomor: "",
    nama_kendaraan: "",
    merek: "",
  })

  const resetForm = () => {
    setFormData({ plat_nomor: "", nama_kendaraan: "", merek: "" })
    setEditingId(null)
  }

  const handleEdit = (vehicle: Kendaraan) => {
    setFormData(vehicle)
    setEditingId(vehicle.plat_nomor)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateVehicle(editingId, {
        nama_kendaraan: formData.nama_kendaraan,
        merek: formData.merek,
      })
    } else {
      await createVehicle(formData)
    }
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = async (plat_nomor: string) => {
    if (confirm("Yakin ingin menghapus kendaraan ini?")) {
      await deleteVehicle(plat_nomor)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger render={<Button className="shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Kendaraan
            </Button>}>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Data Kendaraan" : "Tambah Data Kendaraan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plat Nomor</label>
                <Input 
                  required
                  placeholder="Misal: B 1234 ZN"
                  value={formData.plat_nomor}
                  onChange={(e) => setFormData({...formData, plat_nomor: e.target.value.toUpperCase()})}
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama / Tipe Kendaraan</label>
                <Input 
                  required
                  placeholder="Misal: isuzu box"
                  value={formData.nama_kendaraan}
                  onChange={(e) => setFormData({...formData, nama_kendaraan: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Merek Kendaraan</label>
                <Input 
                  required
                  placeholder="Misal: ISUZU"
                  value={formData.merek}
                  onChange={(e) => setFormData({...formData, merek: e.target.value.toUpperCase()})}
                />
              </div>
              <Button type="submit" className="w-full">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-37.5">Plat Nomor</TableHead>
              <TableHead>Nama Kendaraan</TableHead>
              <TableHead>Merek</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialVehicles.map((vehicle) => (
              <TableRow key={vehicle.plat_nomor}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="uppercase font-bold tracking-widest">{vehicle.plat_nomor}</Badge>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{vehicle.nama_kendaraan}</TableCell>
                <TableCell className="uppercase font-semibold">{vehicle.merek}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.plat_nomor)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Belum ada data kendaraan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
