"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function generateReturnNumber(): Promise<string> {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateString = `${day}${month}${year}`;
  const prefix = `RET_${dateString}/`;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const lastRetur = await prisma.returTransaksi.findFirst({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    orderBy: {
      nomer_retur_pengiriman: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastRetur) {
    const parts = lastRetur.nomer_retur_pengiriman.split('/');
    if (parts.length > 1) {
      const lastNum = parseInt(parts[1], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }
  }

  return `${prefix}${String(nextNumber).padStart(2, '0')}`;
}

export async function searchLocalInvoice(invoice_no: string) {
  try {
  const existing = await prisma.faktur_Pengiriman.findFirst({
      where: { no_faktur: invoice_no },
      orderBy: { id: "desc" },
      include: {
        manifest: {
          include: {
            supir: true,
            kenek: true,
            kendaraan: true
          }
        },
        items: true
      }
    });

    if (!existing) {
      return { success: false, error: "Faktur tidak ditemukan di database pengiriman." };
    }

    if (existing.status.toLowerCase().includes("returned") || existing.status === "RETURNED_FULL") {
      return { success: false, error: `Faktur sudah diretur dengan alasan: ${existing.alasan_retur || "Retur Full"}` };
    }

    return {
      success: true,
      data: {
        id: existing.id,
        invoice_no: existing.no_faktur,
        no_pengiriman: existing.no_pengiriman,
        customer_name: existing.nama_pelanggan,
        total_amount: existing.total_harga,
        driver_name: existing.manifest.supir.nama,
        helper_name: existing.manifest.kenek.nama,
        vehicle_plate: existing.manifest.kendaraan.plat_nomor,
        items: existing.items
      }
    };
  } catch (error: any) {
    console.error("Error searching local invoice:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function submitReturn(
  invoice_no: string, 
  return_reason: string, 
  return_type: "FULL" | "SEBAGIAN" = "FULL",
  itemsData?: { item_name: string; qty: number; satuan: string }[]
) {
  try {
    const existing = await prisma.faktur_Pengiriman.findFirst({
      where: { no_faktur: invoice_no },
      orderBy: { id: "desc" },
      include: { items: true }
    });
    
    if (!existing) throw new Error("Faktur tidak ditemukan");

    // Check if it's already returned
    if (existing.status === "RETURNED_FULL" || existing.status === "RETURNED") {
        return { success: false, error: "Faktur ini sudah di retur full sebelumnya." };
    }

    // Generate Return Number
    const nomer_retur_pengiriman = await generateReturnNumber();

    // Begin Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create ReturTransaksi
      await tx.returTransaksi.create({
        data: {
          nomer_retur_pengiriman,
          nomer_faktur: existing.no_faktur,
          nomer_piked_up: existing.no_pengiriman,
          tanggal_faktur_acc: new Date(), // using current date
          alasan_retur: return_reason,
          jenis_retur: return_type
        }
      });

      // 2. Create RincianRetur (Items)
      const itemsToSave = (itemsData && itemsData.length > 0) ? itemsData : existing.items;
      
      if (itemsToSave && itemsToSave.length > 0) {
        await tx.rincianRetur.createMany({
          data: itemsToSave.map(item => ({
            nomer_retur_pengiriman,
            nomer_faktur: existing.no_faktur,
            nomer_piked_up: existing.no_pengiriman,
            nama_barang: (item as any).item_name || (item as any).nama_barang,
            qty: item.qty,
            satuan: item.satuan || "PCS"
          }))
        });
      }

      // 3. Update TransactionInvoice Status if FULL
      if (return_type === "FULL") {
        await tx.faktur_Pengiriman.updateMany({
          where: { no_faktur: invoice_no },
          data: {
            status: "RETURNED",
            alasan_retur: return_reason
          }
        });
      } else {
        // If SEBAGIAN, update return_reason and status to RETURNED_PARTIAL
        await tx.faktur_Pengiriman.updateMany({
          where: { no_faktur: invoice_no },
          data: {
            status: "RETURNED_PARTIAL",
            alasan_retur: return_reason
          }
        });
      }
    });

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${existing.no_pengiriman}`);
    
    return { success: true, nomer_retur_pengiriman };
  } catch (error: any) {
    console.error("Error submitting return:", error);
    return { success: false, error: "Gagal memproses retur barang: " + (error.message || "") };
  }
}
