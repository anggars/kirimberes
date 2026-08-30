"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

export function ExportExcelButton({ transactions }: { transactions: any[] }) {
  const handleExportRows = () => {
    const excelData: any[] = []

    transactions.forEach((tx) => {
      if (tx.invoices.length === 0) {
        excelData.push({
          "No Transaksi": tx.no_pengiriman,
          "Tanggal": new Date(tx.transaction_date).toLocaleDateString('id-ID'),
          "Supir": tx.driver.name,
          "Kenek": tx.helper.name,
          "Plat Nomor": tx.vehicle.plate_number,
          "Kendaraan": tx.vehicle.vehicle_name,
          "Total Invoice": 0,
          "Daftar Invoice": ""
        })
        return
      }

      tx.invoices.forEach((inv: any, index: number) => {
        excelData.push({
          "No Transaksi": tx.no_pengiriman,
          "Tanggal": new Date(tx.transaction_date).toLocaleDateString('id-ID'),
          "Supir": tx.driver.name,
          "Kenek": tx.helper.name,
          "Plat Nomor": tx.vehicle.plate_number,
          "Kendaraan": tx.vehicle.vehicle_name,
          "Total Invoice": index === 0 ? tx.invoices.length : "",
          "Daftar Invoice": inv.invoice_no
        })
      })
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, 
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 25 }
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi")
    XLSX.writeFile(wb, `Laporan_Manifest_Per_Baris_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportCombined = () => {
    const excelData = transactions.map((tx) => ({
      "No Transaksi": tx.no_pengiriman,
      "Tanggal": new Date(tx.transaction_date).toLocaleDateString('id-ID'),
      "Supir": tx.driver.name,
      "Kenek": tx.helper.name,
      "Plat Nomor": tx.vehicle.plate_number,
      "Kendaraan": tx.vehicle.vehicle_name,
      "Total Invoice": tx.invoices.length,
      "Daftar Invoice": tx.invoices.map((inv: any) => inv.invoice_no).join(", ")
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, 
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 50 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi")
    XLSX.writeFile(wb, `Laporan_Manifest_Gabung_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" className="shadow-sm" onClick={handleExportRows}>
        <Download className="mr-2 h-4 w-4" />
        Excel (Per Baris)
      </Button>
      <Button variant="outline" className="shadow-sm" onClick={handleExportCombined}>
        <Download className="mr-2 h-4 w-4" />
        Excel (Gabung)
      </Button>
    </div>
  )
}
