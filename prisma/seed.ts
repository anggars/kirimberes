import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // Seed Users
  const passwordHash = await bcrypt.hash('password123', 10)
  
  await prisma.user.upsert({
    where: { username: 'superuser' },
    update: {},
    create: {
      username: 'superuser',
      password: passwordHash,
      role: 'SUPER_USER',
      name: 'Super Administrator'
    }
  })

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
  // SEED TRANSACTIONS (1 MONTH SIMULATION)
  const today = new Date()
  today.setHours(12, 0, 0, 0) // Normalize to midday

  for (let i = 0; i < 30; i++) {
    const txDate = new Date(today)
    txDate.setDate(txDate.getDate() - i)
    
    // Create 1 or 2 transactions per day
    const numTransactions = Math.floor(Math.random() * 2) + 1
    
    for (let j = 0; j < numTransactions; j++) {
      const txNum = `TR-${txDate.getFullYear()}${(txDate.getMonth()+1).toString().padStart(2,'0')}${txDate.getDate().toString().padStart(2,'0')}-${j+1}`
      
      // Random driver/helper/vehicle
      const driver = ['sup-001', 'sup-002', 'sup-003'][Math.floor(Math.random() * 3)]
      const helper = ['sup-001', 'sup-002', 'sup-004'][Math.floor(Math.random() * 3)]
      const vehicle = ['B 1234 ZN', 'B 1235 ZN', 'B 1236 ZN', 'B 1237 ZN'][Math.floor(Math.random() * 4)]

      // Create transaction
      const transaction = await prisma.transaction.upsert({
        where: { transaction_no: txNum },
        update: {},
        create: {
          transaction_no: txNum,
          transaction_date: txDate,
          driver_id: driver,
          helper_id: helper,
          vehicle_plate: vehicle,
        }
      })

      // Create random number of invoices (1 to 5)
      const numInvoices = Math.floor(Math.random() * 5) + 1
      for (let k = 0; k < numInvoices; k++) {
        const invNum = `INV-${txDate.getFullYear().toString().slice(-2)}${(txDate.getMonth()+1).toString().padStart(2,'0')}${txDate.getDate().toString().padStart(2,'0')}-${txNum.slice(-1)}-${k+1}`
        
        const invoice = await prisma.transactionInvoice.upsert({
          where: { invoice_no: invNum },
          update: {},
          create: {
            transaction_no: transaction.transaction_no,
            invoice_no: invNum,
            status: i === 0 ? 'PENDING' : 'DELIVERED', // Today's are pending, past are delivered
          }
        })

        // Check if history exists
        const existingHistory = await prisma.trackingHistory.findFirst({ where: { invoice_id: invoice.id } })
        if (!existingHistory) {
          // Add dummy tracking history based on status
          if (i === 0) {
            await prisma.trackingHistory.create({
              data: {
                invoice_id: invoice.id,
                status: 'PENDING',
                location: 'Gudang Pusat',
                updated_by: 'Admin',
                timestamp: txDate
              }
            })
          } else {
            await prisma.trackingHistory.create({
              data: {
                invoice_id: invoice.id,
                status: 'PENDING',
                location: 'Gudang Pusat',
                updated_by: 'Admin',
                timestamp: new Date(txDate.getTime() - 1000 * 60 * 60 * 24)
              }
            })
            await prisma.trackingHistory.create({
              data: {
                invoice_id: invoice.id,
                status: 'DELIVERED',
                location: 'Lokasi Tujuan',
                updated_by: 'Driver',
                timestamp: txDate
              }
            })
          }
        }
      }
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
