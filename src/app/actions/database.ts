"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function getTableData(tableName: string) {
  const session = await getSession();
  if (session?.role !== "SUPER_USER") {
    return { success: false, error: "Unauthorized. Super User access required." };
  }
  
  try {
    let data;
    switch(tableName) {
      case "User": 
        data = await prisma.user.findMany({ take: 100 }); 
        break;
      case "Crew": 
        data = await prisma.crew.findMany({ take: 100 }); 
        break;
      case "Vehicle": 
        data = await prisma.vehicle.findMany({ take: 100 }); 
        break;
      case "Transaction": 
        data = await prisma.transaction.findMany({ take: 100, orderBy: { transaction_date: 'desc' } }); 
        break;
      case "TransactionInvoice": 
        data = await prisma.transactionInvoice.findMany({ take: 100, orderBy: { id: 'desc' } }); 
        break;
      case "InvoiceItem": 
        data = await prisma.invoiceItem.findMany({ take: 100, orderBy: { id: 'desc' } }); 
        break;
      case "TrackingHistory": 
        data = await prisma.trackingHistory.findMany({ take: 100, orderBy: { timestamp: 'desc' } }); 
        break;
      default: 
        return { success: false, error: "Tabel tidak ditemukan" };
    }
    return { success: true, data };
  } catch(e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteAllTransactions() {
  const session = await getSession();
  if (session?.role !== "SUPER_USER") {
    return { success: false, error: "Unauthorized. Super User access required." };
  }

  try {
    // Because of cascade delete, deleting transactions should delete invoices and invoice items
    // But since schema might not have Cascade for everything, let's delete explicitly if needed
    // Or Prisma deleteMany on Transaction will fail if foreign keys exist without Cascade
    
    // Let's delete from bottom up
    await prisma.invoiceItem.deleteMany({});
    await prisma.transactionInvoice.deleteMany({});
    await prisma.transaction.deleteMany({});
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting all transactions:", error);
    return { success: false, error: "Gagal menghapus data transaksi." };
  }
}
