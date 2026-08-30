"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { createDeliveryOrder } from "./accurate"

export async function getTrackingHistory(invoice_no: string) {
  try {
    const invoice = await prisma.faktur_Pengiriman.findFirst({
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
        trackingHistory: {
          orderBy: { waktu: 'desc' }
        },
        items: true
      }
    })

    if (!invoice) return { error: "Resi tidak ditemukan" }
    
    return { data: invoice }
  } catch (error) {
    console.error(error)
    return { error: "Terjadi kesalahan saat mengambil data pelacakan" }
  }
}

export async function updateTrackingStatus(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Anda harus login untuk melakukan aksi ini" }

  const invoice_no = formData.get("invoice_no") as string
  const status = formData.get("status") as string
  const location = formData.get("location") as string
  const description = formData.get("description") as string

  if (!invoice_no || !status) {
    return { error: "Nomor resi dan status wajib diisi" }
  }

  try {
    const invoice = await prisma.faktur_Pengiriman.findFirst({
      where: { no_faktur: invoice_no },
      orderBy: { id: "desc" },
      include: { manifest: true }
    })

    if (!invoice) return { error: "Nomor resi tidak ditemukan di sistem" }

    // Update main status
    await prisma.faktur_Pengiriman.update({
      where: { id: invoice.id },
      data: { status }
    })

    // Add history
    await prisma.riwayat_Pelacakan.create({
      data: {
        id_faktur: invoice.id,
        status,
        lokasi: location || null,
        deskripsi: description || null,
        diperbarui_oleh: session.name || session.username,
        lat: formData.get("lat") ? parseFloat(formData.get("lat") as string) : null,
        lng: formData.get("lng") ? parseFloat(formData.get("lng") as string) : null,
      }
    })

    // If delivered, push to Accurate
    if (status === "DELIVERED") {
      try {
        const doResult = await createDeliveryOrder(
          invoice.manifest.no_pengiriman,
          new Date().toISOString(),
          [invoice.no_faktur]
        );
        if (!doResult.success) {
          console.warn("Accurate DO Push Failed:", doResult.error);
          // Optional: we can return a warning to the user, but we still return success for the local update
        }
      } catch (doError) {
        console.error("Error pushing DO to accurate", doError);
      }
    }

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Gagal memperbarui status pengiriman" }
  }
}
