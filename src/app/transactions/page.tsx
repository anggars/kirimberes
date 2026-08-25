import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Truck, Users } from "lucide-react"
import Link from "next/link"
import { DeleteTransactionButton } from "@/components/delete-transaction-button"

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { transaction_date: 'desc' },
    include: {
      driver: true,
      helper: true,
      vehicle: true,
      invoices: true,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manifest Pengiriman</h1>
          <p className="text-muted-foreground mt-1">
            Data transaksi logistik dan pengiriman kargo.
          </p>
        </div>
        <Link href="/transactions/new">
          <Button className="shadow-md shadow-primary/20">
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Manifest Baru
          </Button>
        </Link>
      </div>

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
                  <TableHead>Invoices</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.transaction_no}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col space-y-1">
                        <span className="font-bold text-primary">{tx.transaction_no}</span>
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
                      <div className="flex flex-wrap gap-1.5 max-w-62.5">
                        {tx.invoices.map((inv) => (
                          <Badge key={inv.id} variant="outline" className="bg-background flex items-center gap-1 font-normal text-xs border-primary/30">
                            <FileText className="h-3 w-3 text-primary" />
                            {inv.invoice_no}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteTransactionButton transaction_no={tx.transaction_no} />
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
