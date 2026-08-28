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
