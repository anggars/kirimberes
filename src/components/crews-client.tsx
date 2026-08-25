"use client"

import { useState } from "react"
import { Crew } from "@prisma/client"
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
import { createCrew, updateCrew, deleteCrew } from "@/app/actions"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

export function CrewsClient({ initialCrews }: { initialCrews: Crew[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gender: "",
    address: "",
  })

  const resetForm = () => {
    setFormData({ id: "", name: "", gender: "", address: "" })
    setEditingId(null)
  }

  const handleEdit = (crew: Crew) => {
    setFormData(crew)
    setEditingId(crew.id)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateCrew(editingId, {
        name: formData.name,
        gender: formData.gender,
        address: formData.address,
      })
    } else {
      await createCrew(formData)
    }
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus crew ini?")) {
      await deleteCrew(id)
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
              Tambah Crew
            </Button>}>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Data Crew" : "Tambah Data Crew"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Crew</label>
                <Input 
                  required
                  placeholder="Misal: sup-005"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input 
                  required
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Kelamin</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="" disabled>Pilih Jenis Kelamin</option>
                  <option value="laki laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat</label>
                <Input 
                  required
                  placeholder="Alamat"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
              <TableHead className="w-25">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCrews.map((crew) => (
              <TableRow key={crew.id}>
                <TableCell className="font-medium">
                  <Badge variant="outline">{crew.id}</Badge>
                </TableCell>
                <TableCell className="capitalize font-medium">{crew.name}</TableCell>
                <TableCell className="capitalize">{crew.gender}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{crew.address}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(crew)}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(crew.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialCrews.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Belum ada data crew.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
