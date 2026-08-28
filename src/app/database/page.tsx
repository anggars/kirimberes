import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { DatabaseViewer } from "@/components/database-viewer"

export const metadata = {
  title: 'Manajemen Database | KirimBeres',
}

export default async function DatabasePage() {
  const session = await getSession()
  
  if (!session || session.role !== "SUPER_USER") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Database</h1>
          <p className="text-muted-foreground mt-2">Lihat dan analisis data mentah (raw data) dari setiap tabel di database.</p>
        </div>
      </div>
      
      <DatabaseViewer />
    </div>
  )
}
