import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { TransactionFilters } from "@/components/transaction-filters"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Truck, Users, X } from "lucide-react"
import Link from "next/link"
import { DeleteTransactionButton } from "@/components/delete-transaction-button"
import { ExportExcelButton } from "@/components/export-excel-button"
import { PrintQRButton } from "@/components/print-qr-button"
import { PrintManifestButton } from "@/components/print-manifest-button"
import { TrackingModal } from "@/components/tracking-modal"
import { getSession } from "@/lib/session"

export default async function TransactionsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const dateParam = searchParams?.date
  const dateFilter = typeof dateParam === 'string' ? dateParam : undefined
  
  const driverParam = searchParams?.driver
  const driverFilter = typeof driverParam === 'string' ? driverParam : undefined

  const vehicleParam = searchParams?.vehicle
  const vehicleFilter = typeof vehicleParam === 'string' ? vehicleParam : undefined

  const invoiceParam = searchParams?.invoice
  const invoiceFilter = typeof invoiceParam === 'string' ? invoiceParam : undefined

  const session = await getSession()
  const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_USER"

  let whereClause: any = {}
  const conditions: any[] = []

  if (dateFilter) {
    const dateObj = new Date(dateFilter)
    if (!isNaN(dateObj.getTime())) {
      conditions.push({
        transaction_date: {
          gte: new Date(`${dateFilter}T00:00:00.000Z`),
          lte: new Date(`${dateFilter}T23:59:59.999Z`),
        }
      })
    }
  }

  if (driverFilter) {
    conditions.push({
      driver: {
        name: { contains: driverFilter, mode: 'insensitive' }
      }
    })
  }

  if (vehicleFilter) {
    conditions.push({
      vehicle: {
        OR: [
          { plate_number: { contains: vehicleFilter, mode: 'insensitive' } },
          { vehicle_name: { contains: vehicleFilter, mode: 'insensitive' } },
        ]
      }
    })
  }

  if (invoiceFilter) {
    conditions.push({
      invoices: {
        some: {
          invoice_no: { contains: invoiceFilter, mode: 'insensitive' }
        }
      }
    })
  }

  if (conditions.length > 0) {
    whereClause = { AND: conditions }
  }

  let transactions: any[] = []
  let errorMsg = null

  try {
    transactions = await prisma.manifest_Pengiriman.findMany({
      where: whereClause,
      orderBy: { no_pengiriman: 'desc' },
      take: 100,
      include: {
        driver: true,
        helper: true,
        vehicle: true,
        invoices: true,
        createdByUser: true,
      }
    })
  } catch (err: any) {
    errorMsg = err?.message || String(err)
  }

  if (errorMsg) {
    return (
      <div className="p-8 text-red-500 font-mono">
        <h1 className="text-xl font-bold mb-4">Server Error Detailed</h1>
        <p>{errorMsg}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manifest Pengiriman</h1>
          <p className="text-muted-foreground mt-1">
            Data transaksi logistik dan pengiriman kargo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <ExportExcelButton transactions={JSON.parse(JSON.stringify(transactions))} />
          <Link href="/transactions/new" className="flex-1 sm:flex-none">
            <Button className="w-full shadow-md shadow-primary/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Manifest
            </Button>
          </Link>
        </div>
      </div>
      
      <TransactionFilters />

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Semua manifest pengiriman beserta detail invoice-nya.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kru & Kendaraan</TableHead>
                  <TableHead>Pembuat</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.no_pengiriman}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col space-y-1">
                        <span className="font-bold text-primary">{tx.no_pengiriman}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(tx.transaction_date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center text-sm gap-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="capitalize">{tx.driver.name} (Supir) & {tx.helper.name} (Kenek)</span>
                        </div>
                        <div className="flex items-center text-sm gap-2">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
                            {tx.vehicle.plate_number}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize hidden sm:inline-block">
                            {tx.vehicle.vehicle_name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="capitalize">{tx.createdByUser?.name || tx.createdByUser?.username || "Sistem"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 max-w-xs">
                        {tx.invoices.map((inv: any) => (
                          <div key={inv.id} className="flex flex-col gap-1 p-2 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-1">
                              <TrackingModal invoice_no={inv.invoice_no} />
                              <PrintQRButton invoice_no={inv.invoice_no} />
                            </div>
                            {inv.customer_name && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-semibold">{inv.customer_name}</span>
                                {inv.items_summary && (
                                  <span className="block truncate text-[10px] mt-0.5" title={inv.items_summary}>
                                    {inv.items_summary}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PrintManifestButton no_pengiriman={tx.no_pengiriman} />
                        {isAdmin && <DeleteTransactionButton no_pengiriman={tx.no_pengiriman} />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                      Belum ada transaksi manifest.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
