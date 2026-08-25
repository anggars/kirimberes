import prisma from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Truck, Users, FileText, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export default async function Dashboard() {
  const [totalVehicles, totalCrews, totalTransactions, totalInvoices] = await Promise.all([
    prisma.vehicle.count(),
    prisma.crew.count(),
    prisma.transaction.count(),
    prisma.transactionInvoice.count(),
  ])

  const recentTransactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: { transaction_date: 'desc' },
    include: {
      driver: true,
      vehicle: true,
      invoices: true,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ringkasan Beranda</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang di KirimBeres! Berikut adalah ringkasan operasional pengiriman Anda hari ini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kendaraan</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">Armada terdaftar</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crew</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrews}</div>
            <p className="text-xs text-muted-foreground mt-1">Supir & kenek aktif</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengiriman</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Manifest diproses</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Terkirim</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Total kargo dikirim</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-7 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manifest Pengiriman Terbaru</CardTitle>
            <CardDescription>
              5 transaksi terakhir yang tercatat dalam sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentTransactions.map((tx) => (
                <div key={tx.transaction_no} className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {tx.transaction_no} - {tx.vehicle.plate_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supir: {tx.driver.name} | {tx.invoices.length} invoice
                    </p>
                  </div>
                  <div className="font-medium text-sm">
                    {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            {recentTransactions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Belum ada transaksi terbaru.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
