"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteTransaction } from "@/app/actions"
import { useState } from "react"

export function DeleteTransactionButton({ no_pengiriman }: { no_pengiriman: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm("Yakin ingin menghapus manifest transaksi ini beserta semua invoicenya?")) {
      setIsDeleting(true)
      try {
        await deleteTransaction(no_pengiriman)
      } catch (error) {
        console.error(error)
        alert("Gagal menghapus transaksi.")
        setIsDeleting(false)
      }
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
