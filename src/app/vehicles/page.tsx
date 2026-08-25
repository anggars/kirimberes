import prisma from "@/lib/prisma"
import { VehiclesClient } from "@/components/vehicles-client"

export const dynamic = 'force-dynamic'

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plate_number: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Kendaraan</h1>
        <p className="text-muted-foreground mt-1">
          Manajemen daftar armada truk dan kendaraan operasional.
        </p>
      </div>

      <VehiclesClient initialVehicles={vehicles} />
    </div>
  )
}
