"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTableData, deleteAllTransactions } from "@/app/actions/database"
import { Trash2 } from "lucide-react"

const TABLES = [
  { id: "User", name: "User", columns: ["id", "username", "password", "role", "name"] },
  { id: "Crew", name: "Kru (Supir/Kenek)", columns: ["id", "name", "gender", "address"] },
  { id: "Vehicle", name: "Kendaraan", columns: ["plate_number", "vehicle_name", "brand"] },
  { id: "Manifest_Pengiriman", name: "Manifest Pengiriman", columns: ["no_pengiriman", "transaction_date", "driver_id", "helper_id", "vehicle_plate", "created_by"] },
  { id: "TransactionInvoice", name: "Faktur (Invoice)", columns: ["id", "no_pengiriman", "invoice_no", "status", "return_reason", "customer_code", "customer_name", "customer_address", "total_amount"] },
  { id: "InvoiceItem", name: "Rincian Barang", columns: ["id", "invoice_id", "invoice_no", "item_name", "qty", "original_qty", "satuan"] },
  { id: "ReturTransaksi", name: "Retur Transaksi", columns: ["nomer_retur_pengiriman", "nomer_faktur", "nomer_piked_up", "tanggal_faktur_acc", "alasan_retur", "jenis_retur", "created_at"] }
]

export function DatabaseViewer() {
  const [activeTable, setActiveTable] = useState(TABLES[0].id)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadData = async (tableName: string) => {
    setLoading(true)
    setError("")
    
    const res = await getTableData(tableName)
    if (res.success) {
      setData(res.data || [])
    } else {
      setError(res.error || "Gagal mengambil data")
      setData([])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadData(activeTable)
  }, [activeTable])

  const handleDeleteTransactions = async () => {
    if (!confirm("PERINGATAN KERAS! Apakah Anda yakin ingin menghapus SEMUA data transaksi secara permanen? Data yang dihapus tidak dapat dikembalikan!")) return;
    if (!confirm("Apakah Anda benar-benar yakin?")) return;
    
    setLoading(true);
    const res = await deleteAllTransactions();
    if (res.success) {
      alert("Semua data transaksi berhasil dihapus.");
      loadData(activeTable);
    } else {
      alert(res.error || "Gagal menghapus data transaksi");
    }
    setLoading(false);
  }

  const renderTable = () => {
    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading data...</div>
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>
    const currentTableDef = TABLES.find(t => t.id === activeTable);
    const columns = data && data.length > 0 
      ? Array.from(new Set(data.flatMap(Object.keys)))
      : currentTableDef?.columns || [];

    if (columns.length === 0) return <div className="p-8 text-center text-muted-foreground">Tabel ini kosong.</div>;

    return (
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground italic">
                  Tabel ini kosong. Tidak ada data.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => {
                    let val = row[col];
                    
                    // Format value for display
                    if (val === null) val = <span className="text-muted-foreground italic">null</span>;
                    else if (val === undefined) val = "";
                    else if (typeof val === 'boolean') val = val ? "true" : "false";
                    else if (val instanceof Date) val = val.toISOString();
                    else if (typeof val === 'object') val = JSON.stringify(val);
                    else val = String(val);

                    return (
                      <td key={col} className="px-4 py-2 max-w-xs truncate" title={String(row[col] || '')}>
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Card className="shadow-sm">
      <div className="flex border-b overflow-x-auto">
        {TABLES.map(table => (
          <button
            key={table.id}
            onClick={() => setActiveTable(table.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTable === table.id 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {table.name}
          </button>
        ))}
        <div className="ml-auto px-4 py-2 flex items-center gap-2">
          {activeTable.includes("Transaction") && (
            <Button variant="destructive" size="sm" onClick={handleDeleteTransactions} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-1" /> Hapus Semua Transaksi
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => loadData(activeTable)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        {renderTable()}
      </CardContent>
    </Card>
  )
}
