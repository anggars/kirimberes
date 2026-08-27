"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { searchSalesInvoicesAdvanced } from "@/app/actions/accurate"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface InvoiceSearchModalProps {
  onSelect: (invoiceNo: string) => void;
  disabled?: boolean;
}

export function InvoiceSearchModal({ onSelect, disabled }: InvoiceSearchModalProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    setLoading(true)
    setError(null)
    setHasSearched(true)
    
    try {
      const res = await searchSalesInvoicesAdvanced(keyword)
      if (res.success) {
        setResults(res.data)
      } else {
        setError(res.error || "Gagal mengambil data dari Accurate")
        setResults([])
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (invoiceNo: string) => {
    onSelect(invoiceNo)
    setOpen(false)
  }

  // Reset state when opening modal
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && !hasSearched) {
      // Auto search on first open
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled} className="ml-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800">
          <Search className="mr-2 h-4 w-4" />
          Cari Manual (Accurate)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pencarian Faktur (Accurate Online)</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 my-2">
          <Input 
            placeholder="Cari No Faktur..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 mb-2">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="bg-muted sticky top-0">
              <TableRow>
                <TableHead>No. Faktur</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Mengambil data dari server Accurate...
                  </TableCell>
                </TableRow>
              ) : results.length === 0 && hasSearched ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Faktur tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-medium">{inv.invoice_no}</TableCell>
                    <TableCell>{inv.company_name}</TableCell>
                    <TableCell>{inv.trans_date}</TableCell>
                    <TableCell className="text-right">Rp {inv.total_amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" onClick={() => handleSelect(inv.invoice_no)}>
                        Pilih
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
