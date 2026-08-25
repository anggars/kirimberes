"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

export function ExportExcelButton({ transactions }: { transactions: any[] }) {
  const handleExport = () => {
    // Format data for excel
    const excelData = transactions.map((tx) => ({
      "No Transaksi": tx.transaction_no,
      "Tanggal": new Date(tx.transaction_date).toLocaleDateString('id-ID'),
      "Supir": tx.driver.name,
      "Kenek": tx.helper.name,
      "Plat Nomor": tx.vehicle.plate_number,
      "Kendaraan": tx.vehicle.vehicle_name,
      "Total Invoice": tx.invoices.length,
      "Daftar Invoice": tx.invoices.map((inv: any) => inv.invoice_no).join(", ")
    }))

    // Create a new workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Adjust column widths
    const colWidths = [
      { wch: 20 }, // No Transaksi
      { wch: 12 }, // Tanggal
      { wch: 15 }, // Supir
      { wch: 15 }, // Kenek
      { wch: 12 }, // Plat
      { wch: 15 }, // Kendaraan
      { wch: 15 }, // Total Invoice
      { wch: 50 }, // Daftar Invoice
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi")

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `Laporan_Manifest_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Button variant="outline" className="shadow-sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Excel
    </Button>
  )
}
