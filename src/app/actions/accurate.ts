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
    // We add more fields to capture customer info and item names
    const response = await fetchAccurateAPI(
      `/api/sales-invoice/list.do?fields=id,number,customer,totalAmount,shipTo,toAddress,detailItem,detailItems&filter.number.op=EQUAL&filter.number.val=${encodeURIComponent(invoiceNo)}`,
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
    
    // If list API doesn't return detailItem, fetch full details
    if (!invoice.detailItem || invoice.detailItem.length === 0) {
      const detailResponse = await fetchAccurateAPI(
        `/api/sales-invoice/detail.do?id=${invoice.id}`,
        "GET",
        undefined,
        host
      );
      if (detailResponse.s !== false && detailResponse.d) {
        const detailData = Array.isArray(detailResponse.d) ? detailResponse.d[0] : detailResponse.d;
        if (detailData) {
          if (detailData.detailItem) {
            invoice.detailItem = detailData.detailItem;
          }
          if (detailData.customer) {
            // Merge in the richer customer object from detail
            invoice.customer = { ...invoice.customer, ...detailData.customer };
          }
          if (detailData.shipTo || detailData.toAddress) {
            invoice.shipTo = detailData.shipTo || detailData.toAddress;
          }
        }
      }
    }

    // Process items
    let extracted_items: { item_name: string; qty: number; original_qty: number; satuan: string }[] = [];
    if ((invoice.detailItem || invoice.detailItems) && Array.isArray(invoice.detailItem || invoice.detailItems)) {
      const itemsList = invoice.detailItem || invoice.detailItems;
      extracted_items = itemsList.map((item: any) => ({
        item_name: item.item?.name || item.itemName || "Unknown Item",
        qty: Number(item.quantity) || 1,
        original_qty: Number(item.quantity) || 1,
        satuan: item.itemUnit?.name || item.unitName || "PCS"
      }));
    }
    
    return {
      success: true,
      data: {
        id: invoice.id,
        invoice_no: invoice.number,
        company_name: invoice.customer?.name || "",
        customer_code: invoice.customer?.customerNo || invoice.customer?.no || "",
        customer_address: invoice.toAddress || invoice.shipTo || invoice.customer?.address || invoice.customer?.billStreet || invoice.customer?.shipStreet || "-",
        total_amount: invoice.totalAmount || 0,
        extracted_items
      }
    };
  } catch (error: any) {
    console.error("Error searching Accurate invoice:", error);
    return { success: false, error: error.message || "Gagal menghubungi server Accurate." };
  }
}

/**
 * Search for multiple Sales Invoices with keyword (for manual lookup)
 */
export async function searchSalesInvoicesAdvanced(keyword: string = "") {
  try {
    const host = await getDbHost();
    
    // Using accurate's list API with a generic 'keywords' parameter or customer filter
    // If accurate doesn't support 'keywords', we might need to filter by customer name or number
    let url = `/api/sales-invoice/list.do?fields=id,number,customer,totalAmount,transDate,shipTo,toAddress,detailItem,detailItems`;
    if (keyword) {
      // Filtering by number containing keyword (LIKE)
      url += `&filter.number.op=LIKE&filter.number.val=%${encodeURIComponent(keyword)}%`;
    }
    
    const response = await fetchAccurateAPI(url, "GET", undefined, host);

    if (response.s === false) {
      return { success: false, error: response.d[0] };
    }

    if (!response.d) {
      return { success: true, data: [] };
    }
    
    return {
      success: true,
      data: response.d.map((invoice: any) => {
        let extracted_items: { item_name: string; qty: number; original_qty: number; satuan: string }[] = [];
        if (invoice.detailItem && Array.isArray(invoice.detailItem)) {
          extracted_items = invoice.detailItem.map((item: any) => ({
            item_name: item.item?.name || item.itemName || "Unknown Item",
            qty: Number(item.quantity) || 1,
            original_qty: Number(item.quantity) || 1,
            satuan: item.itemUnit?.name || item.unitName || "PCS"
          }));
        }

        return {
          id: invoice.id,
          invoice_no: invoice.number,
          company_name: invoice.customer?.name || "",
          customer_code: invoice.customer?.customerNo || invoice.customer?.no || "",
          customer_address: invoice.toAddress || invoice.shipTo || invoice.customer?.address || "-",
          total_amount: invoice.totalAmount || 0,
          trans_date: invoice.transDate || "",
          extracted_items
        };
      })
    };
  } catch (error: any) {
    console.error("Error searching Accurate invoices advanced:", error);
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
