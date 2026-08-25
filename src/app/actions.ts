"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
  invoices: string[] // Array of invoice_no
}) {
  await prisma.transaction.create({
    data: {
      transaction_no: data.transaction_no,
      transaction_date: new Date(data.transaction_date),
      driver_id: data.driver_id,
      helper_id: data.helper_id,
      vehicle_plate: data.vehicle_plate,
      invoices: {
        create: data.invoices.map((inv) => ({ invoice_no: inv })),
      },
    },
  })
  revalidatePath("/transactions")
  revalidatePath("/")
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
