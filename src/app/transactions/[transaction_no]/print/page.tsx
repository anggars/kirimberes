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
  // If invoices are less than 22, render at least 22 rows so the table has empty space for handwriting, 
  // ensuring it fits perfectly on one A4 page.
  const minRows = 22;
  const rowsCount = Math.max(minRows, tx.invoices.length);
  const rows = Array.from({ length: rowsCount });

  return (
    <div className="bg-white text-black p-4 md:p-8 max-w-5xl mx-auto min-h-screen font-sans text-xs">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-lg font-bold">Laporan Pengiriman Barang</h1>
          <p className="text-[10px] text-gray-500 mt-1">No. Transaksi: {tx.transaction_no}</p>
        </div>
        
        <table className="text-xs">
          <tbody>
            <tr>
              <td className="pr-4 py-0.5">Tgl</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted min-w-[150px]">
                {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </td>
            </tr>
            <tr>
              <td className="pr-4 py-0.5">Supir</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted capitalize">{tx.driver.name}</td>
            </tr>
            <tr>
              <td className="pr-4 py-0.5">Kneck</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted capitalize">{tx.helper.name}</td>
            </tr>
            <tr>
              <td className="pr-4 py-0.5">No. Polisi</td>
              <td className="px-2">:</td>
              <td className="border-b border-black border-dotted uppercase">{tx.vehicle.plate_number}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse border border-black mb-4 text-xs">
        <thead>
          <tr>
            <th className="border border-black px-1 py-1 text-center w-8">No.</th>
            <th className="border border-black px-1 py-1 text-center w-64">Nama Perusahaan</th>
            <th className="border border-black px-1 py-1 text-center w-20">Biaya<br/>Parkir</th>
            <th className="border border-black px-1 py-1 text-center w-20">Total Yg<br/>Dibawa</th>
            <th className="border border-black px-1 py-1 text-center w-20">Total Yg<br/>Diterima</th>
            <th className="border border-black px-1 py-1 text-center w-28">No<br/>Faktur</th>
            <th className="border border-black px-1 py-1 text-center">Barang-Barang<br/>Kembalian</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, idx) => {
            const inv = tx.invoices[idx];
            return (
              <tr key={idx} className="h-6">
                <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                <td className="border border-black px-1 py-0.5"></td>
                <td className="border border-black px-1 py-0.5"></td>
                <td className="border border-black px-1 py-0.5"></td>
                <td className="border border-black px-1 py-0.5"></td>
                <td className="border border-black px-1 py-0.5 text-center font-mono text-[10px]">{inv?.invoice_no || ""}</td>
                <td className="border border-black px-1 py-0.5"></td>
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
          
          <div className="flex gap-16 mt-8">
            <div className="text-center">
              <p className="mb-16">Laporan dibuat,</p>
              <p className="whitespace-nowrap">( ........................................ )</p>
            </div>
            <div className="text-center">
              <p className="mb-16">Disetujui,</p>
              <p className="whitespace-nowrap">( ........................................ )</p>
            </div>
          </div>
        </div>

        <div className="w-1/3">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 whitespace-nowrap">Total Parkir</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1 whitespace-nowrap">Biaya Lain</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1 whitespace-nowrap">Bensin</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1 whitespace-nowrap">Pembelian Cash</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1 whitespace-nowrap">Total Seluruhnya</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1 whitespace-nowrap">Penerimaan</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-1 whitespace-nowrap">Sisa</td>
                <td className="px-2">:</td>
                <td className="border-b border-black border-dotted w-full"></td>
              </tr>
              <tr>
                <td className="py-2 pt-4 whitespace-nowrap" colSpan={3}>
                  <div className="flex items-center">
                    <span>Total Pengiriman : (</span>
                    <span className="flex-1 border-b border-black border-dotted mx-2 min-w-[50px]"></span>
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
          html, body { background-color: white !important; color: black !important; margin: 0 !important; padding: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Hide the sidebar and other non-print elements */
          aside, header, nav, .sidebar { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
          .max-w-5xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
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
