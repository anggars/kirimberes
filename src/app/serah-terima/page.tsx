import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export const metadata = {
  title: 'Serah Terima Faktur | KirimBeres',
}

export default async function SerahTerimaPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="p-8 bg-card rounded-xl border border-dashed border-primary/30 flex flex-col items-center justify-center max-w-md text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Serah Terima Faktur</h1>
        <p className="text-muted-foreground">
          Sedang dalam tahap pengembangan
        </p>
      </div>
    </div>
  )
}
