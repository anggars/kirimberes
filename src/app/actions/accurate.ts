"use server"

import { fetchAccurateAPI, openAccurateDatabase } from "@/lib/accurate"

// You can get this DB ID from your accurate session or config
const ACCURATE_DB_ID = process.env.ACCURATE_DB_ID || "2869680"; 

let dbSessionHost = "";

/**
 * Get or initialize the database session host
 */
async function getDbHost() {
  if (!dbSessionHost) {
    dbSessionHost = await openAccurateDatabase(ACCURATE_DB_ID);
  }
  return dbSessionHost;
}

/**
 * Search for a Sales Invoice in Accurate by its invoice number
 */
export async function searchSalesInvoice(invoiceNo: string) {
  try {
    const host = await getDbHost();
    
    // Using accurate's list API with a filter for the invoice number
    // Accurate usually expects fields to search, e.g. "number"
    const response = await fetchAccurateAPI(
      `/api/sales-invoice/list.do?fields=id,number,customer,totalAmount&filter.number.op=EQUAL&filter.number.val=${encodeURIComponent(invoiceNo)}`,
      "GET",
      undefined,
      host
    );

    if (response.s === false) {
      return { success: false, error: response.d[0] };
    }

    if (!response.d || response.d.length === 0) {
      return { success: false, error: "Faktur tidak ditemukan di Accurate." };
    }

    const invoice = response.d[0];
    
    return {
      success: true,
      data: {
        id: invoice.id,
        invoice_no: invoice.number,
        company_name: invoice.customer?.name || "",
        total_amount: invoice.totalAmount || 0,
      }
    };
  } catch (error: any) {
    console.error("Error searching Accurate invoice:", error);
    return { success: false, error: error.message || "Gagal menghubungi server Accurate." };
  }
}

/**
 * Send a Delivery Order to Accurate when a transaction is completed
 */
export async function createDeliveryOrder(transactionNo: string, date: string, invoices: string[]) {
  try {
    const host = await getDbHost();
    
    // Accurate Delivery Order creation payload
    // Note: The actual payload structure depends on Accurate API docs. 
    // Usually it requires customerId, itemId, qty, etc.
    // For now, we scaffold the request.
    const payload = {
      number: `DO-${transactionNo}`,
      transDate: date.split("T")[0],
      // We would map invoices to details here based on actual Accurate API requirements
      detailItem: invoices.map((inv, idx) => ({
        salesInvoiceNumber: inv,
        // Other required fields...
      }))
    };

    const response = await fetchAccurateAPI(
      `/api/delivery-order/save.do`,
      "POST",
      payload,
      host
    );

    if (response.s === false) {
      return { success: false, error: response.d[0] };
    }

    return { success: true, data: response.d };
  } catch (error: any) {
    console.error("Error creating Accurate Delivery Order:", error);
    return { success: false, error: error.message || "Gagal membuat Delivery Order di Accurate." };
  }
}
