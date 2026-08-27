import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function PrintTransactionPage(props: { params: Promise<{ transaction_no: string }> }) {
  const params = await props.params
  const transaction_no = decodeURIComponent(params.transaction_no)

  const tx = await prisma.transaction.findUnique({
    where: { transaction_no },
    include: {
      driver: true,
      helper: true,
      vehicle: true,
      invoices: true,
      createdByUser: true,
    }
  })

  if (!tx) {
    notFound()
  }

  // Determine the number of rows to render. 
  // If invoices are less than 20, render at least 20 rows so the table has empty space for handwriting.
  const minRows = 25;
  const rowsCount = Math.max(minRows, tx.invoices.length);
  const rows = Array.from({ length: rowsCount });

  return (
    <div className="bg-white text-black p-8 max-w-5xl mx-auto min-h-screen font-sans text-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Laporan Pengiriman Barang</h1>
          <p className="text-xs text-gray-500 mt-1">No. Transaksi: {tx.transaction_no}</p>
        </div>
        
        <table className="text-sm">
          <tbody>
            <tr>
              <td className="pr-4 py-1">Tgl</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted min-w-[150px]">
                {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </td>
            </tr>
            <tr>
              <td className="pr-4 py-1">Supir</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted capitalize">{tx.driver.name}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1">Kneck</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted capitalize">{tx.helper.name}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1">No. Polisi</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted uppercase">{tx.vehicle.plate_number}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse border border-black mb-8 text-sm">
        <thead>
          <tr>
            <th className="border border-black px-2 py-2 text-center w-10">No.</th>
            <th className="border border-black px-2 py-2 text-center w-64">Nama Perusahaan</th>
            <th className="border border-black px-2 py-2 text-center w-24">Biaya<br/>Parkir</th>
            <th className="border border-black px-2 py-2 text-center w-24">Total Yg<br/>Di Bawa</th>
            <th className="border border-black px-2 py-2 text-center w-24">Total Yg<br/>Di Terima</th>
            <th className="border border-black px-2 py-2 text-center w-32">No<br/>Faktur</th>
            <th className="border border-black px-2 py-2 text-center">Barang-Barang<br/>Kembalian</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, idx) => {
            const inv = tx.invoices[idx];
            return (
              <tr key={idx} className="h-8">
                <td className="border border-black px-2 py-1 text-center">{idx + 1}</td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1 text-center font-mono text-xs">{inv?.invoice_no || ""}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-start text-sm">
        <div className="w-1/2 space-y-6">
          <div className="flex">
            <span className="w-24">Keterangan</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-black border-dotted"></div>
          </div>
          <div className="flex">
            <span className="w-24"></span>
            <span className="mr-2"></span>
            <div className="flex-1 border-b border-black border-dotted"></div>
          </div>
          
          <div className="flex justify-between w-64 mt-8">
            <div className="text-center">
              <p className="mb-16">Laporan dibuat,</p>
              <p>( .................................. )</p>
            </div>
            <div className="text-center">
              <p className="mb-16">Disetujui,</p>
              <p>( .................................. )</p>
            </div>
          </div>
        </div>

        <div className="w-1/3">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1">Total Parkir</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1">Biaya Lain</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1">Bensin</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1">Pembelian Cash</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1">Total Seluruhnya</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1">Penerimaan</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1">Sisa</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-2 pt-4" colSpan={3}>
                  <div className="flex items-center">
                    <span>Total Pengiriman : (</span>
                    <span className="flex-1 border-b border-black border-dotted mx-2"></span>
                    <span>) Crt</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 1cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />

      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`
        }}
      />
    </div>
  )
}
