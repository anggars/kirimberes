"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateReturnReason, deleteReturn } from "@/app/actions/retur"
import { Trash2, Edit, Printer, FileText, X } from "lucide-react"

export function ReturActions({ invoice }: { invoice: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [reason, setReason] = useState(invoice.return_reason || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const handleEdit = async () => {
    if (!reason.trim()) return
    setIsSubmitting(true)
    const res = await updateReturnReason(invoice.invoice_no, reason)
    setIsSubmitting(false)
    if (res.success) {
      setIsEditing(false)
    } else {
      alert(res.error)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus status retur untuk faktur ${invoice.invoice_no}? Status akan kembali menjadi TERKIRIM.`)) return
    setIsSubmitting(true)
    const res = await deleteReturn(invoice.invoice_no)
    setIsSubmitting(false)
    if (!res.success) {
      alert(res.error)
    }
  }

  const handlePrint = () => {
    // Generate a simple print view for this return
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tanda Terima Retur - ${invoice.invoice_no}</title>
            <style>
              body { font-family: monospace; padding: 20px; font-size: 14px; }
              .header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; text-decoration: underline; }
              .row { display: flex; margin-bottom: 8px; }
              .col { width: 150px; }
              .val { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
              .sign { width: 200px; border-top: 1px solid #000; padding-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">TANDA TERIMA RETUR BARANG</div>
            <div class="row"><div class="col">No. Faktur</div><div class="val">: ${invoice.invoice_no}</div></div>
            <div class="row"><div class="col">Manifest</div><div class="val">: ${invoice.transaction_no}</div></div>
            <div class="row"><div class="col">Pelanggan</div><div class="val">: ${invoice.customer_name || '-'}</div></div>
            <div class="row"><div class="col">Kendaraan</div><div class="val">: ${invoice.transaction?.vehicle?.plate_number || '-'}</div></div>
            <div class="row"><div class="col">Supir / Kenek</div><div class="val">: ${invoice.transaction?.driver?.name || '-'} / ${invoice.transaction?.helper?.name || '-'}</div></div>
            <div class="row"><div class="col">Alasan Retur</div><div class="val">: ${invoice.return_reason}</div></div>
            
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Barang</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items && invoice.items.length > 0 
                  ? invoice.items.map((it: any, idx: number) => `<tr><td>${idx+1}</td><td>${it.item_name}</td><td>${it.quantity}</td></tr>`).join('') 
                  : `<tr><td colspan="3">${invoice.items_summary || 'Tidak ada detail'}</td></tr>`
                }
              </tbody>
            </table>

            <div class="footer">
              <div>
                <br><br><br>
                <div class="sign">Gudang Penerima</div>
              </div>
              <div>
                <br><br><br>
                <div class="sign">Supir / Pembawa</div>
              </div>
            </div>
            
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input 
            className="border text-xs px-2 py-1 rounded w-32" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            autoFocus
          />
          <Button size="sm" variant="default" className="h-6 text-[10px] px-2" onClick={handleEdit} disabled={isSubmitting}>OK</Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setIsEditing(false)}>Batal</Button>
        </div>
      ) : (
        <>
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium mr-2 max-w-40 truncate" title={invoice.return_reason}>
            {invoice.return_reason}
          </span>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={() => setIsEditing(true)} title="Edit Alasan">
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:bg-indigo-50" onClick={() => setShowDetail(true)} title="Detail Barang">
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:bg-amber-50" onClick={handlePrint} title="Cetak Tanda Terima">
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={handleDelete} title="Hapus Retur (Batal)" disabled={isSubmitting}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Detail Faktur: {invoice.invoice_no}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Pelanggan</p>
                <p className="font-medium text-sm">{invoice.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rincian Barang</p>
                <div className="bg-muted p-2 rounded text-xs mt-1 space-y-1 max-h-80 overflow-y-auto">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((it: any, i: number) => (
                      <div key={i}>• {it.item_name} <span className="font-semibold">({it.quantity})</span></div>
                    ))
                  ) : (
                    <div>{invoice.items_summary}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
