import prisma from "@/lib/prisma"
import { TransactionsForm } from "../../../components/transactions-form"

export const dynamic = 'force-dynamic'

export default async function NewTransactionPage() {
  const crews = await prisma.crew.findMany({ orderBy: { name: 'asc' } })
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate_number: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buat Manifest Baru</h1>
        <p className="text-muted-foreground mt-1">
          Formulir untuk membuat transaksi manifest pengiriman baru.
        </p>
      </div>

      <TransactionsForm crews={crews} vehicles={vehicles} />
    </div>
  )
}

