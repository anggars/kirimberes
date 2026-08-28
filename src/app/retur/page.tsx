import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { ReturForm } from "@/components/retur-form"

export default async function ReturPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  
  if (session.role !== "ADMIN" && session.role !== "SUPER_USER") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Retur Pengiriman</h1>
        <p className="text-muted-foreground mt-2">
          Catat faktur atau barang yang tidak terkirim (retur ke gudang).
        </p>
      </div>
      <ReturForm />
    </div>
  )
}
