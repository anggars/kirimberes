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
      case "Kru": 
        data = await prisma.kru.findMany({ take: 100 }); 
        break;
      case "Kendaraan": 
        data = await prisma.kendaraan.findMany({ take: 100 }); 
        break;
      case "Manifest_Pengiriman": 
        data = await prisma.manifest_Pengiriman.findMany({ take: 100, orderBy: { tanggal_transaksi: 'desc' } }); 
        break;
      case "Faktur_Pengiriman": 
        data = await prisma.faktur_Pengiriman.findMany({ take: 100, orderBy: { id: 'desc' } }); 
        break;
      case "Rincian_Barang": 
        data = await prisma.rincian_Barang.findMany({ take: 100, orderBy: { id: 'desc' } }); 
        break;
      case "Riwayat_Pelacakan": 
        data = await prisma.riwayat_Pelacakan.findMany({ take: 100, orderBy: { waktu: 'desc' } }); 
        break;
      case "ReturTransaksi": 
        data = await prisma.returTransaksi.findMany({ take: 100, orderBy: { created_at: 'desc' } }); 
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
    await prisma.rincian_Barang.deleteMany({});
    await prisma.faktur_Pengiriman.deleteMany({});
    await prisma.manifest_Pengiriman.deleteMany({});
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting all transactions:", error);
    return { success: false, error: "Gagal menghapus data transaksi." };
  }
}
