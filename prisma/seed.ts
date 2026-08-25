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
