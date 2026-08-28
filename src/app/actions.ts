"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// --- CREW ACTIONS ---

export async function createCrew(data: { id: string; name: string; gender: string; address: string }) {
  await prisma.crew.create({ data })
  revalidatePath("/crews")
  revalidatePath("/")
}

export async function updateCrew(id: string, data: { name: string; gender: string; address: string }) {
  await prisma.crew.update({ where: { id }, data })
  revalidatePath("/crews")
}

export async function deleteCrew(id: string) {
  await prisma.crew.delete({ where: { id } })
  revalidatePath("/crews")
  revalidatePath("/")
}

// --- VEHICLE ACTIONS ---

export async function createVehicle(data: { plate_number: string; vehicle_name: string; brand: string }) {
  await prisma.vehicle.create({ data })
  revalidatePath("/vehicles")
  revalidatePath("/")
}

export async function updateVehicle(plate_number: string, data: { vehicle_name: string; brand: string }) {
  await prisma.vehicle.update({ where: { plate_number }, data })
  revalidatePath("/vehicles")
}

export async function deleteVehicle(plate_number: string) {
  await prisma.vehicle.delete({ where: { plate_number } })
  revalidatePath("/vehicles")
  revalidatePath("/")
}

// --- TRANSACTION ACTIONS ---

export async function createTransaction(data: {
  transaction_no: string
  transaction_date: string
  driver_id: string
  helper_id: string
  vehicle_plate: string
  invoices: {
    invoice_no: string
    customer_code?: string
    customer_name?: string
    customer_address?: string
    items_summary?: string
    total_amount?: number
    extracted_items?: { item_name: string; quantity: string }[]
  }[] // Array of detailed invoice objects
}) {
  const { getSession } = await import("@/lib/session")
  const session = await getSession()
  
  // Check for duplicate invoices in the database
  const invoiceNos = data.invoices.map(i => i.invoice_no)
  const existingInvoices = await prisma.transactionInvoice.findMany({
    where: {
      invoice_no: { in: invoiceNos }
    }
  })

  if (existingInvoices.length > 0) {
    const duplicates = existingInvoices.map((inv) => inv.invoice_no).join(", ")
    return { success: false, error: `Gagal: Invoice sudah terdaftar di sistem (${duplicates})` }
  }

  await prisma.transaction.create({
    data: {
      transaction_no: data.transaction_no,
      transaction_date: new Date(data.transaction_date),
      driver_id: data.driver_id,
      helper_id: data.helper_id,
      vehicle_plate: data.vehicle_plate,
      created_by: session?.id,
      invoices: {
        create: data.invoices.map((inv) => ({ 
          invoice_no: inv.invoice_no,
          customer_code: inv.customer_code,
          customer_name: inv.customer_name,
          customer_address: inv.customer_address,
          items_summary: inv.items_summary,
          total_amount: inv.total_amount,
          items: inv.extracted_items && inv.extracted_items.length > 0 ? {
            create: inv.extracted_items.map(item => ({
              item_name: item.item_name,
              quantity: item.quantity
            }))
          } : undefined
        })),
      },
    },
  })
  revalidatePath("/transactions")
  revalidatePath("/")
  return { success: true }
}

export async function deleteTransaction(transaction_no: string) {
  // First delete associated invoices because of foreign key constraint
  await prisma.transactionInvoice.deleteMany({
    where: { transaction_no },
  })
  await prisma.transaction.delete({
    where: { transaction_no },
  })
  revalidatePath("/transactions")
  revalidatePath("/")
}

// --- USER ACTIONS (SUPER_USER ONLY) ---

export async function createUser(data: { username: string; password?: string; name: string; role: string }) {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash("123456", 10)
  
  await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: data.role,
    }
  })
  revalidatePath("/users")
}

export async function updateUser(id: string, data: { username: string; password?: string; name: string; role: string }) {
  const updateData: any = {
    username: data.username,
    name: data.name,
    role: data.role,
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
