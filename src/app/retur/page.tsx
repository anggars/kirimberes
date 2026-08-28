import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
// @ts-ignore
import { ReturForm } from "@/components/retur-form"
import prisma from "@/lib/prisma"

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
    where: { status: "RETURNED" },
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
                      <td className="px-4 py-3 font-mono font-semibold">{inv.invoice_no}</td>
                      <td className="px-4 py-3">{inv.customer_name || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs">{inv.transaction_no}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {inv.transaction?.vehicle?.plate_number} • {inv.transaction?.driver?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                          {inv.return_reason}
                        </span>
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
