import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // Seed Users
  const passwordHash = await bcrypt.hash('password123', 10)
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
      name: 'Administrator'
    }
  })

  await prisma.user.upsert({
    where: { username: 'user1' },
    update: {},
    create: {
      username: 'user1',
      password: passwordHash,
      role: 'USER',
      name: 'Kasir 1'
    }
  })
  console.log('Users seeded.')

  // Seed Crews
  const crews = [
    { id: 'sup-001', name: 'wawan', gender: 'laki laki', address: 'jakarta' },
    { id: 'sup-002', name: 'tio', gender: 'laki laki', address: 'jakarta' },
    { id: 'sup-003', name: 'hasan', gender: 'laki laki', address: 'jakarta' },
    { id: 'sup-004', name: 'ubai', gender: 'laki laki', address: 'jakarta' },
  ]

  for (const crew of crews) {
    await prisma.crew.upsert({
      where: { id: crew.id },
      update: {},
      create: crew,
    })
  }
  console.log('Crews seeded.')

  // Seed Vehicles
  const vehicles = [
    { plate_number: 'B 1234 ZN', vehicle_name: 'isuzu box', brand: 'ISUZU' },
    { plate_number: 'B 1235 ZN', vehicle_name: 'isuzu box', brand: 'ISUZU' },
    { plate_number: 'B 1236 ZN', vehicle_name: 'isuzu box', brand: 'ISUZU' },
    { plate_number: 'B 1237 ZN', vehicle_name: 'isuzu box', brand: 'ISUZU' },
  ]

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { plate_number: v.plate_number },
      update: {},
      create: v,
    })
  }
  console.log('Vehicles seeded.')

  // Seed Transactions & Invoices
  // TR-003
  await prisma.transaction.upsert({
    where: { transaction_no: 'TR-003' },
    update: {},
    create: {
      transaction_no: 'TR-003',
      transaction_date: new Date('2026-08-24T00:00:00.000Z'),
      driver_id: 'sup-002', // tio
      helper_id: 'sup-001', // wawan
      vehicle_plate: 'B 1237 ZN',
      invoices: {
        create: [
          { invoice_no: 'ami-0002' },
          { invoice_no: 'ami-0003' },
          { invoice_no: 'ami-0004' },
          { invoice_no: 'ami-0005' },
        ],
      },
    },
  })

  // TR-004
  await prisma.transaction.upsert({
    where: { transaction_no: 'TR-004' },
    update: {},
    create: {
      transaction_no: 'TR-004',
      transaction_date: new Date('2026-08-24T00:00:00.000Z'),
      driver_id: 'sup-003', // hasan
      helper_id: 'sup-004', // ubai
      vehicle_plate: 'B 1234 ZN',
      invoices: {
        create: [
          { invoice_no: 'ami-0021' },
          { invoice_no: 'ami-0022' },
          { invoice_no: 'ami-0023' },
          { invoice_no: 'ami-0024' },
          { invoice_no: 'ami-0025' },
          { invoice_no: 'ami-0026' },
        ],
      },
    },
  })

  // TR-005 (Tracking Demo: Jakarta - Tasikmalaya)
  const jktTskTx = await prisma.transaction.upsert({
    where: { transaction_no: 'TR-005' },
    update: {},
    create: {
      transaction_no: 'TR-005',
      transaction_date: new Date(),
      driver_id: 'sup-001', // wawan
      helper_id: 'sup-002', // tio
      vehicle_plate: 'B 1234 ZN',
      invoices: {
        create: [
          { invoice_no: 'INV-JKT-TSK-001', status: 'IN_TRANSIT' },
        ],
      },
    },
  })

  // Add Tracking History for INV-JKT-TSK-001
  const invoice = await prisma.transactionInvoice.findUnique({
    where: { invoice_no: 'INV-JKT-TSK-001' }
  })

  if (invoice) {
    // Avoid duplicating history if already seeded
    const existingHistory = await prisma.trackingHistory.findFirst({
      where: { invoice_id: invoice.id }
    })

    if (!existingHistory) {
      await prisma.trackingHistory.createMany({
        data: [
          {
            invoice_id: invoice.id,
            status: 'PENDING',
            location: 'Gudang Jakarta Pusat',
            description: 'Barang diterima dan diproses di gudang pengirim',
            updated_by: 'Admin Jakarta',
            lat: -6.1751,
            lng: 106.8272,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          },
          {
            invoice_id: invoice.id,
            status: 'IN_TRANSIT',
            location: 'Rest Area KM 57 Tol Japek',
            description: 'Barang dalam perjalanan menuju Bandung',
            updated_by: 'Driver Wawan',
            lat: -6.3813,
            lng: 107.3626,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          },
          {
            invoice_id: invoice.id,
            status: 'IN_TRANSIT',
            location: 'Gudang Sortir Bandung',
            description: 'Barang sedang transit di Bandung, menunggu jadwal ke Tasikmalaya',
            updated_by: 'Admin Bandung',
            lat: -6.9175,
            lng: 107.6191,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          }
        ]
      })
    }
  }

  console.log('Transactions & Invoices seeded.')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
