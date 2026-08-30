import prisma from "@/lib/prisma"
import { UsersClient } from "@/components/users-client"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }
  
  if (session.role !== "SUPER_USER") {
    redirect("/") // Only SUPER_USER can access this page
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      nama: true,
      peran: true,
    },
    orderBy: {
      username: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola akun pengguna dan hak akses aplikasi.
        </p>
      </div>
      <UsersClient initialUsers={users} />
    </div>
  )
}
