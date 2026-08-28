import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import React from "react"

export default async function PrintTransactionPage(props: { params: Promise<{ transaction_no: string }> }) {
  const params = await props.params
  const transaction_no = decodeURIComponent(params.transaction_no)

  const tx: any = await prisma.transaction.findUnique({
    where: { transaction_no },
    include: {
      driver: true,
      helper: true,
      vehicle: true,
      invoices: {
        include: {
          // @ts-ignore
          items: true
        }
      },
      createdByUser: true,
    }
  })

  if (!tx) {
    notFound()
  }

  // Determine the number of rows to render. 
  // Minimum 10 rows so the table has empty space for handwriting.
  const minRows = 10;
  const rowsCount = Math.max(minRows, tx.invoices.length);
  const rows = Array.from({ length: rowsCount });

  const getExtractedItemNames = (summary?: string) => {
    if (!summary) return "";
    return summary.split(',').map(item => item.split('(')[0].trim()).join(', ');
  }

  const getExtractedItemQty = (summary?: string) => {
    if (!summary) return "";
    const matches = summary.match(/\((\d+)\)/g);
    if (!matches) return "";
    return matches.reduce((sum, match) => sum + parseInt(match.replace(/\D/g, '')), 0) || "";
  }

  // renderItemNames and renderItemQty removed, logic moved to table map

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
              <td className="border-b border-black border-dotted min-w-37.5">
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
            <th className="border border-black px-1 py-1 text-center w-52">Nama Perusahaan</th>
            <th className="border border-black px-1 py-1 text-center w-52">Nama Barang</th>
            <th className="border border-black px-1 py-1 text-center w-16">Biaya<br/>Parkir</th>
            <th className="border border-black px-1 py-1 text-center w-16">Total Yg<br/>Dibawa</th>
            <th className="border border-black px-1 py-1 text-center w-16">Total Yg<br/>Diterima</th>
            <th className="border border-black px-1 py-1 text-center w-24">No<br/>Faktur</th>
            <th className="border border-black px-1 py-1 text-center">Keterangan / Lain-lain</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, idx) => {
            const inv = tx.invoices[idx] as any;
            
            // Get items for this invoice
            let items: { name: string, qty: string }[] = [];
            if (inv?.items && inv.items.length > 0) {
              items = inv.items.map((it: any) => ({ name: it.item_name, qty: it.quantity }));
            } else if (inv?.items_summary) {
              const names = inv.items_summary.split(',').map((item: string) => item.split('(')[0].trim());
              const matches = inv.items_summary.match(/\((\d+)\)/g);
              const qtys = matches ? matches.map((match: string) => match.replace(/\D/g, '')) : [];
              items = names.map((name: string, i: number) => ({ name, qty: qtys[i] || "" }));
            }
            
            // If no items, ensure at least one empty item to render the row structure
            if (items.length === 0) {
              items = [{ name: "", qty: "" }];
            }

            return (
              <React.Fragment key={idx}>
                {items.map((item, itemIdx) => {
                  const isNotLastItem = itemIdx !== items.length - 1;
                  const borderBottomStyle = isNotLastItem ? 'rgba(0,0,0,0.3)' : 'black';
                  
                  return (
                    <tr key={`${idx}-${itemIdx}`} className="h-6">
                      {itemIdx === 0 && (
                        <>
                          <td className="border border-black px-1 py-0.5 text-center" rowSpan={items.length}>{idx + 1}</td>
                          <td className="border border-black px-1 py-0.5 font-semibold text-[10px] leading-tight" rowSpan={items.length}>{inv?.customer_name || ""}</td>
                        </>
                      )}
                      
                      <td 
                        className="border border-black px-1 py-0.5 text-[10px] leading-tight" 
                        style={{ borderBottomColor: borderBottomStyle }}
                      >
                        {item.name}
                      </td>
                      
                      {itemIdx === 0 && (
                        <td className="border border-black px-1 py-0.5" rowSpan={items.length}></td>
                      )}
                      
                      <td 
                        className="border border-black px-1 py-0.5 text-center text-[10px] font-bold"
                        style={{ borderBottomColor: borderBottomStyle }}
                      >
                        {item.qty}
                      </td>
                      
                      {itemIdx === 0 && (
                        <>
                          <td className="border border-black px-1 py-0.5" rowSpan={items.length}></td>
                          <td className="border border-black px-1 py-0.5 text-center font-mono text-[10px]" rowSpan={items.length}>{inv?.invoice_no || ""}</td>
                          <td className="border border-black px-1 py-0.5 text-[10px]" rowSpan={items.length}>
                            {inv?.status === "RETURNED" && (
                              <div className="text-red-600 font-semibold italic">
                                Tidak Terkirim: {inv.return_reason || "Retur"}
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
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
                    <span className="flex-1 border-b border-black border-dotted mx-2 min-w-12.5"></span>
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
          @page { size: A4; margin: 0.5cm; }
          html, body { 
            background-color: white !important; 
            color: black !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          /* Hide the sidebar and header */
          aside, header, nav, .sidebar { display: none !important; }
          
          /* Reset parent layout containers (LayoutWrapper) */
          body > div { 
            display: block !important; 
            height: auto !important; 
            background: white !important; 
          }
          main { 
            display: block !important; 
            overflow: visible !important; 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
          }
          main > div { 
            padding: 0 !important; 
            background: white !important; 
            overflow: visible !important; 
            height: auto !important;
          }
          
          /* Make sure our print container takes full width */
          .max-w-5xl { 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }
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
