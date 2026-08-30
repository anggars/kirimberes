"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// --- CREW ACTIONS ---

export async function createCrew(data: { id: string; nama: string; jenis_kelamin: string; alamat: string }) {
  await prisma.kru.create({ data })
  revalidatePath("/crews")
  revalidatePath("/")
}

export async function updateCrew(id: string, data: { nama: string; jenis_kelamin: string; alamat: string }) {
  await prisma.kru.update({ where: { id }, data })
  revalidatePath("/crews")
}

export async function deleteCrew(id: string) {
  await prisma.kru.delete({ where: { id } })
  revalidatePath("/crews")
  revalidatePath("/")
}

// --- VEHICLE ACTIONS ---

export async function createVehicle(data: { plat_nomor: string; nama_kendaraan: string; merek: string }) {
  await prisma.kendaraan.create({ data })
  revalidatePath("/vehicles")
  revalidatePath("/")
}

export async function updateVehicle(plat_nomor: string, data: { nama_kendaraan: string; merek: string }) {
  await prisma.kendaraan.update({ where: { plat_nomor }, data })
  revalidatePath("/vehicles")
}

export async function deleteVehicle(plat_nomor: string) {
  await prisma.kendaraan.delete({ where: { plat_nomor } })
  revalidatePath("/vehicles")
  revalidatePath("/")
}

// --- TRANSACTION ACTIONS ---

export async function createTransaction(data: {
  no_pengiriman: string
  tanggal_transaksi: string
  id_supir: string
  id_kenek: string
  plat_kendaraan: string
  invoices: {
    no_faktur: string
    kode_pelanggan?: string
    nama_pelanggan?: string
    alamat_pelanggan?: string
    items_summary?: string
    total_harga?: number
    extracted_items?: { item_name: string; quantity: string }[]
  }[] // Array of detailed invoice objects
}) {
  const { getSession } = await import("@/lib/session")
  const session = await getSession()
  
  let validUserId: string | undefined = undefined;
  if (session?.id) {
    const userExists = await prisma.user.findUnique({ where: { id: session.id } });
    if (userExists) {
      validUserId = session.id;
    } else {
      return { success: false, error: "Sesi login Anda sudah usang (database baru saja direset). Silakan Logout dan Login kembali." }
    }
  }
  
  // Check for duplicate invoices in the database
  // Only block if the LATEST record is not RETURNED_FULL
  const invoiceNos = data.invoices.map(i => i.no_faktur)
  const existingInvoices = await prisma.faktur_Pengiriman.findMany({
    where: {
      no_faktur: { in: invoiceNos }
    },
    orderBy: { id: "desc" }
  })

  // Group by no_faktur to get only the latest for each
  const latestInvoices = new Map();
  for (const inv of existingInvoices) {
    if (!latestInvoices.has(inv.no_faktur)) {
      latestInvoices.set(inv.no_faktur, inv);
    }
  }

  const conflictingInvoices = Array.from(latestInvoices.values()).filter(inv => {
    const s = inv.status.toLowerCase();
    return s.includes("picked up") || s === "terkirim" || s === "pending";
  })

  if (conflictingInvoices.length > 0) {
    const duplicates = conflictingInvoices.map((inv) => inv.no_faktur).join(", ")
    return { success: false, error: `Gagal: Invoice sudah berstatus Picked Up di sistem (${duplicates})` }
  }

  await prisma.manifest_Pengiriman.create({
    data: {
      no_pengiriman: data.no_pengiriman,
      tanggal_transaksi: new Date(data.tanggal_transaksi),
      id_supir: data.id_supir,
      id_kenek: data.id_kenek,
      plat_kendaraan: data.plat_kendaraan,
      dibuat_oleh: validUserId,
      invoices: {
        create: data.invoices.map((inv) => ({ 
          no_faktur: inv.no_faktur,
          kode_pelanggan: inv.kode_pelanggan,
          nama_pelanggan: inv.nama_pelanggan,
          alamat_pelanggan: inv.alamat_pelanggan,
          total_harga: inv.total_harga,
          status: "picked up",
          items: {
            create: inv.extracted_items?.map((item: any) => ({
              no_faktur: inv.no_faktur,
              nama_barang: item.item_name,
              qty: Number(item.qty),
              qty_asli: Number(item.original_qty || item.qty),
              satuan: item.satuan,
            })) || [],
          },
        })),
      },
    },
  })
  revalidatePath("/transactions")
  revalidatePath("/")
  return { success: true }
}

export async function checkInvoiceGlobalDuplicate(no_faktur: string) {
  const existing = await prisma.faktur_Pengiriman.findFirst({
    where: { no_faktur },
    orderBy: { id: "desc" }
  })
  
  if (existing) {
    const status = existing.status.toLowerCase();
    
    // Jika berisikan "picked up", maka ditolak
    if (status.includes("picked up") || status === "terkirim" || status === "pending") {
      return { 
        isDuplicate: true, 
        message: `Faktur sudah ada di dalam transaksi ${existing.no_pengiriman} dengan status Picked Up!` 
      }
    }
    
    // Jika berisikan "returned", maka boleh disimpan (return isDuplicate: false)
    if (status.includes("returned")) {
      return { isDuplicate: false }
    }
    
    return { 
      isDuplicate: true, 
      message: `Faktur tidak bisa dimasukkan (Status saat ini: ${existing.status})` 
    }
  }
  return { isDuplicate: false }
}

export async function deleteTransaction(no_pengiriman: string) {
  // First delete associated invoices because of foreign key constraint
  await prisma.faktur_Pengiriman.deleteMany({
    where: { no_pengiriman },
  })
  await prisma.manifest_Pengiriman.delete({
    where: { no_pengiriman },
  })
  revalidatePath("/transactions")
  revalidatePath("/")
}

export async function getNextTransactionNumber(dateString: string) {
  // dateString is "YYYY-MM-DD"
  const parts = dateString.split('-');
  if (parts.length !== 3) return "UNKNOWN-01";
  
  const prefix = `${parts[2]}${parts[1]}${parts[0]}`; // DDMMYYYY
  
  const transactions = await prisma.manifest_Pengiriman.findMany({
    where: { no_pengiriman: { startsWith: prefix } },
    select: { no_pengiriman: true }
  });

  let maxSeq = 0;
  for (const t of transactions) {
    const p = t.no_pengiriman.split('-');
    if (p.length === 2) {
      const seq = parseInt(p[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(2, '0');
  return `${prefix}-${seqPadded}`;
}

// --- USER ACTIONS (SUPER_USER ONLY) ---

export async function createUser(data: { username: string; password?: string; nama: string; peran: string }) {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash("123456", 10)
  
  await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      nama: data.nama,
      peran: data.peran,
    }
  })
  revalidatePath("/users")
}

export async function updateUser(id: string, data: { username: string; password?: string; nama: string; peran: string }) {
  const updateData: any = {
    username: data.username,
    nama: data.nama,
    peran: data.peran,
  }
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  })
  revalidatePath("/users")
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } })
  revalidatePath("/users")
}
