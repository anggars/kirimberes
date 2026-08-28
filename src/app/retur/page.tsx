import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
// @ts-ignore
import { ReturForm } from "@/components/retur-form"
import { ReturActions } from "@/components/retur-actions"
import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function ReturPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  
  if (session.role !== "ADMIN" && session.role !== "SUPER_USER") {
    redirect("/")
  }

  // Fetch returned invoices
  // @ts-ignore
  const returnedInvoices = await prisma.transactionInvoice.findMany({
    where: {
      OR: [
        { status: "returned" },
        { return_reason: { not: null } }
      ]
    },
    include: {
      transaction: {
        include: {
          driver: true,
          vehicle: true
        }
      }
    },
    orderBy: { id: "desc" }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Retur Pengiriman</h1>
        <p className="text-muted-foreground mt-2">
          Catat faktur atau barang yang tidak terkirim (retur ke gudang).
        </p>
      </div>
      
      <ReturForm />

      <div className="pt-8">
        <h2 className="text-xl font-bold mb-4">Riwayat Retur / Tidak Terkirim</h2>
        
        {returnedInvoices.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg border border-dashed text-muted-foreground">
            Belum ada riwayat retur pengiriman.
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">No. Faktur</th>
                    <th className="px-4 py-3 font-medium">Pelanggan</th>
                    <th className="px-4 py-3 font-medium">Manifest & Supir</th>
                    <th className="px-4 py-3 font-medium text-red-600">Alasan Retur</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {returnedInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-semibold">
                        <span className="text-primary hover:underline cursor-pointer" title="Klik tombol detail di kolom aksi untuk melihat barang">{inv.invoice_no}</span>
                      </td>
                      <td className="px-4 py-3">{inv.customer_name || "-"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/transactions/${inv.transaction_no}/print`} target="_blank" className="font-mono text-xs text-primary hover:underline">
                          {inv.transaction_no}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1">
                          {inv.transaction?.vehicle?.plate_number} • {inv.transaction?.driver?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ReturActions invoice={inv} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
