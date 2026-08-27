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

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto min-h-screen font-sans">
      <div className="border-b-2 border-black pb-4 mb-6 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Manifest Pengiriman Barang</h1>
        <p className="text-gray-600 mt-2">KirimBeres Logistics</p>
      </div>

      <div className="flex justify-between items-start mb-8 text-sm">
        <div className="space-y-1">
          <p><span className="font-semibold inline-block w-32">No. Manifest</span> : <span className="font-mono">{tx.transaction_no}</span></p>
          <p><span className="font-semibold inline-block w-32">Tanggal</span> : {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p><span className="font-semibold inline-block w-32">Pembuat</span> : {tx.createdByUser?.name || tx.createdByUser?.username || "Sistem"}</p>
        </div>
        <div className="space-y-1">
          <p><span className="font-semibold inline-block w-32">Kendaraan</span> : {tx.vehicle.plate_number} ({tx.vehicle.vehicle_name})</p>
          <p><span className="font-semibold inline-block w-32">Supir (Driver)</span> : {tx.driver.name}</p>
          <p><span className="font-semibold inline-block w-32">Kenek (Helper)</span> : {tx.helper.name}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-12 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-4 py-2 text-left w-16">No.</th>
            <th className="border border-black px-4 py-2 text-left">Nomor Invoice / Resi</th>
            <th className="border border-black px-4 py-2 text-left">Status Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {tx.invoices.map((inv, idx) => (
            <tr key={inv.id}>
              <td className="border border-black px-4 py-2 text-center">{idx + 1}</td>
              <td className="border border-black px-4 py-2 font-mono font-medium">{inv.invoice_no}</td>
              <td className="border border-black px-4 py-2">{inv.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-around mt-16 text-center text-sm">
        <div className="w-48">
          <p className="mb-20">Yang Menyerahkan,</p>
          <p className="border-t border-black pt-2 font-semibold">Petugas Gudang</p>
        </div>
        <div className="w-48">
          <p className="mb-20">Yang Menerima,</p>
          <p className="border-t border-black pt-2 font-semibold">{tx.driver.name}</p>
          <p className="text-xs text-gray-600 mt-1">(Supir)</p>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`
        }}
      />
    </div>
  )
}
