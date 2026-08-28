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

    if (existing.status.startsWith("RETURNED")) {
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
        items: existing.items,
        // @ts-ignore
        items_summary: existing.items_summary
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
  itemsData?: { item_name: string; quantity: string }[]
) {
  try {
    // Find the latest record
    const existing = await prisma.transactionInvoice.findFirst({
      where: { invoice_no },
      orderBy: { id: "desc" }
    });
    
    if (!existing) throw new Error("Not found");

    // @ts-ignore
    const updated = await prisma.transactionInvoice.update({
      where: { id: existing.id },
      data: {
        status: return_type,
        // @ts-ignore
        return_reason: return_reason
      }
    });

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
            data: { quantity: item.quantity }
          });
        }
      }
      
      // Also update items_summary string
      const newSummary = itemsData.map(i => `${i.item_name} (${i.quantity})`).join(", ");
      await prisma.transactionInvoice.update({
        where: { id: existing.id },
        data: { items_summary: newSummary }
      });
    }

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${updated.transaction_no}`);
    
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

    // @ts-ignore
    const updated = await prisma.transactionInvoice.update({
      where: { id: existing.id },
      data: updateData
    });

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${updated.transaction_no}`);
    
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

    // @ts-ignore
    const updated = await prisma.transactionInvoice.update({
      where: { id: existing.id },
      data: {
        status: "TERKIRIM",
        // @ts-ignore
        return_reason: null
      }
    });

    revalidatePath("/retur");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${updated.transaction_no}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting return:", error);
    return { success: false, error: "Gagal membatalkan retur." };
  }
}
