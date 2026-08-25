import prisma from "@/lib/prisma"
import { CrewsClient } from "@/components/crews-client"

export default async function CrewsPage() {
  const crews = await prisma.crew.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Supir & Kenek</h1>
        <p className="text-muted-foreground mt-1">
          Manajemen daftar awak kendaraan armada (Crews).
        </p>
      </div>

      <CrewsClient initialCrews={crews} />
    </div>
  )
}
