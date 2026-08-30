"use client"

import { useState } from "react"
import { User } from "@prisma/client"
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
import { createUser, updateUser, deleteUser } from "@/app/actions"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

export function UsersClient({ initialUsers }: { initialUsers: Omit<User, 'password'>[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    username: "",
    nama: "",
    peran: "USER",
    password: "", // Only used for creating or changing password
  })

  const resetForm = () => {
    setFormData({ username: "", nama: "", peran: "USER", password: "" })
    setEditingId(null)
  }

  const handleEdit = (user: any) => {
    setFormData({
      username: user.username,
      nama: user.nama || "",
      peran: user.peran,
      password: "", // don't load password
    })
    setEditingId(user.id)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateUser(editingId, {
        username: formData.username,
        nama: formData.nama,
        peran: formData.peran,
        password: formData.password || undefined,
      })
    } else {
      await createUser(formData)
    }
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus user ini?")) {
      await deleteUser(id)
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
              Tambah User
            </Button>}>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit User" : "Tambah User Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input 
                  required
                  placeholder="Username untuk login"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input 
                  required
                  placeholder="Nama Pengguna"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                  value={formData.peran}
                  onChange={(e) => setFormData({...formData, peran: e.target.value})}
                >
                  <option value="USER">User (Input Transaksi)</option>
                  <option value="ADMIN">Admin (Akses Master Data & Transaksi)</option>
                  <option value="SUPER_USER">Super User (Akses Penuh)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password {editingId && "(Kosongkan jika tidak ingin diubah)"}</label>
                <Input 
                  type="password"
                  placeholder={editingId ? "Password Baru" : "Password (min. 6 karakter)"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingId}
                  minLength={6}
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
              <TableHead>Username</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.username}
                </TableCell>
                <TableCell className="font-medium">{user.nama}</TableCell>
                <TableCell>
                  <Badge variant={user.peran === 'SUPER_USER' ? 'default' : user.peran === 'ADMIN' ? 'secondary' : 'outline'}>
                    {user.peran}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Belum ada data user.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
