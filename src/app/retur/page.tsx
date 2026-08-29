import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
// @ts-ignore
import { ReturForm } from "@/components/retur-form"
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
  const riwayatRetur = await prisma.returTransaksi.findMany({
    include: {
      manifest: {
        include: { driver: true, vehicle: true }
      },
      invoice: true
    },
    orderBy: { created_at: "desc" }
  });

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
        
        {riwayatRetur.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg border border-dashed text-muted-foreground">
            Belum ada riwayat retur pengiriman.
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">No. Retur</th>
                    <th className="px-4 py-3 font-medium">No. Faktur</th>
                    <th className="px-4 py-3 font-medium">Manifest & Supir</th>
                    <th className="px-4 py-3 font-medium">Jenis</th>
                    <th className="px-4 py-3 font-medium text-red-600">Alasan Retur</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {riwayatRetur.map((ret: any) => (
                    <tr key={ret.nomer_retur_pengiriman} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-bold">{ret.nomer_retur_pengiriman}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-primary">{ret.nomer_faktur}</td>
                      <td className="px-4 py-3">
                        <Link href={`/transactions/${ret.nomer_piked_up}/print`} target="_blank" className="font-mono text-xs text-primary hover:underline">
                          {ret.nomer_piked_up}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1">
                          {ret.manifest?.vehicle?.plate_number} • {ret.manifest?.driver?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ret.jenis_retur === 'FULL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {ret.jenis_retur}
                        </span>
                      </td>
                      <td className="px-4 py-3">{ret.alasan_retur}</td>
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
