"use client"

import { useState } from "react"
import { Vehicle } from "@prisma/client"
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

export function VehiclesClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    plate_number: "",
    vehicle_name: "",
    brand: "",
  })

  const resetForm = () => {
    setFormData({ plate_number: "", vehicle_name: "", brand: "" })
    setEditingId(null)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setFormData(vehicle)
    setEditingId(vehicle.plate_number)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateVehicle(editingId, {
        vehicle_name: formData.vehicle_name,
        brand: formData.brand,
      })
    } else {
      await createVehicle(formData)
    }
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = async (plate_number: string) => {
    if (confirm("Yakin ingin menghapus kendaraan ini?")) {
      await deleteVehicle(plate_number)
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
                  value={formData.plate_number}
                  onChange={(e) => setFormData({...formData, plate_number: e.target.value.toUpperCase()})}
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama / Tipe Kendaraan</label>
                <Input 
                  required
                  placeholder="Misal: isuzu box"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({...formData, vehicle_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Merek Kendaraan</label>
                <Input 
                  required
                  placeholder="Misal: ISUZU"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value.toUpperCase()})}
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
              <TableRow key={vehicle.plate_number}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="uppercase font-bold tracking-widest">{vehicle.plate_number}</Badge>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{vehicle.vehicle_name}</TableCell>
                <TableCell className="uppercase font-semibold">{vehicle.brand}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.plate_number)}>
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
