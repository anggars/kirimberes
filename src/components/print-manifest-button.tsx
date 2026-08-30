"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PrintManifestButton({ no_pengiriman }: { no_pengiriman: string }) {
  return (
    <Link href={`/transactions/${no_pengiriman}/print`} target="_blank">
      <Button variant="outline" size="icon" title="Cetak Manifest">
        <Printer className="h-4 w-4" />
      </Button>
    </Link>
  )
}
