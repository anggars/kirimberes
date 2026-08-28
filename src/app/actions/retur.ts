"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function searchLocalInvoice(invoice_no: string) {
  try {
    // @ts-ignore
    const existing = await prisma.transactionInvoice.findFirst({
      where: { invoice_no },
      orderBy: { id: "desc" },
      include: {
        transaction: {
          include: {
            driver: true,
            helper: true,
            vehicle: true
          }
        },
        // @ts-ignore
        items: true
      }
    });

    if (!existing) {
      return { success: false, error: "Faktur tidak ditemukan di database pengiriman." };
    }

    if (existing.status.toLowerCase().includes("returned")) {
      // @ts-ignore
      return { success: false, error: `Faktur sudah diretur dengan alasan: ${existing.return_reason}` };
    }

    return {
      success: true,
      data: {
        id: existing.id,
        invoice_no: existing.invoice_no,
        transaction_no: existing.transaction_no,
        // @ts-ignore
        customer_name: existing.customer_name,
        // @ts-ignore
        total_amount: existing.total_amount,
        // @ts-ignore
        driver_name: existing.transaction.driver.name,
        // @ts-ignore
        helper_name: existing.transaction.helper.name,
        // @ts-ignore
        vehicle_plate: existing.transaction.vehicle.plate_number,
        // @ts-ignore
        // @ts-ignore
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
  return_type: "RETURNED_FULL" | "RETURNED_PARTIAL" = "RETURNED_FULL",
  itemsData?: { item_name: string; qty: number; satuan: string }[]
) {
  try {
    // Find the latest record
    const existing = await prisma.transactionInvoice.findFirst({
      where: { invoice_no },
      orderBy: { id: "desc" }
    });
    
    if (!existing) throw new Error("Not found");

    if (return_type === "RETURNED_FULL") {
      await prisma.transactionInvoice.updateMany({
        where: { invoice_no: invoice_no },
        data: {
          status: "returned",
          // @ts-ignore
          return_reason: return_reason
        }
      });
    } else {
      // Retur Sebagian: JANGAN update status (biarkan "picked up" atau status aslinya)
      // hanya update alasan retur dan QTY barang di bawah
      await prisma.transactionInvoice.updateMany({
        where: { invoice_no: invoice_no },
        data: {
          // @ts-ignore
          return_reason: return_reason
        }
      });
    }

    if (itemsData && itemsData.length > 0) {
      // Update individual items if they exist
      for (const item of itemsData) {
        // Find existing item
        const existingItem = await prisma.invoiceItem.findFirst({
          where: { invoice_id: existing.id, item_name: item.item_name }
        });
        
        if (existingItem) {
          await prisma.invoiceItem.update({
            where: { id: existingItem.id },
            data: { qty: item.qty, satuan: item.satuan }
          });
        }
      }
    }

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${existing.transaction_no}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting return:", error);
    return { success: false, error: "Gagal memproses retur barang." };
  }
}

export async function updateReturnReason(invoice_no: string, return_reason: string, return_type?: "RETURNED_FULL" | "RETURNED_PARTIAL") {
  try {
    const existing = await prisma.transactionInvoice.findFirst({
      where: { invoice_no },
      orderBy: { id: "desc" }
    });
    
    if (!existing) throw new Error("Not found");
    
    const updateData: any = { return_reason };
    if (return_type) {
      updateData.status = return_type;
    }

    await prisma.transactionInvoice.updateMany({
      where: { invoice_no },
      data: updateData
    });

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${existing.transaction_no}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating return:", error);
    return { success: false, error: "Gagal mengubah alasan retur." };
  }
}

export async function deleteReturn(invoice_no: string) {
  try {
    const existing = await prisma.transactionInvoice.findFirst({
      where: { invoice_no },
      orderBy: { id: "desc" }
    });
    
    if (!existing) throw new Error("Not found");

    await prisma.transactionInvoice.updateMany({
      where: { invoice_no },
      data: {
        status: "picked up",
        // @ts-ignore
        return_reason: null
      }
    });

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${existing.transaction_no}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting return:", error);
    return { success: false, error: "Gagal membatalkan retur." };
  }
}
