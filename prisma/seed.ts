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

  // (Bagian pembuatan transaksi dummy telah dihapus agar database transaksi benar-benar kosong mulai dari nol)
  
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
