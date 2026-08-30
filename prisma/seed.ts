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
      peran: 'SUPER_USER',
      nama: 'Super Administrator'
    }
  })

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHash,
      peran: 'ADMIN',
      nama: 'Administrator'
    }
  })

  await prisma.user.upsert({
    where: { username: 'user1' },
    update: {},
    create: {
      username: 'user1',
      password: passwordHash,
      peran: 'USER',
      nama: 'Kasir 1'
    }
  })
  console.log('Users seeded.')

  // Seed Crews
  const crews = [
    { id: 'sup-001', nama: 'wawan', jenis_kelamin: 'laki laki', alamat: 'jakarta' },
    { id: 'sup-002', nama: 'tio', jenis_kelamin: 'laki laki', alamat: 'jakarta' },
    { id: 'sup-003', nama: 'hasan', jenis_kelamin: 'laki laki', alamat: 'jakarta' },
    { id: 'sup-004', nama: 'ubai', jenis_kelamin: 'laki laki', alamat: 'jakarta' },
  ]

  for (const crew of crews) {
    await prisma.kru.upsert({
      where: { id: crew.id },
      update: {},
      create: crew,
    })
  }
  console.log('Crews seeded.')

  // Seed Vehicles
  const vehicles = [
    { plat_nomor: 'B 1234 ZN', nama_kendaraan: 'isuzu box', merek: 'ISUZU' },
    { plat_nomor: 'B 1235 ZN', nama_kendaraan: 'isuzu box', merek: 'ISUZU' },
    { plat_nomor: 'B 1236 ZN', nama_kendaraan: 'isuzu box', merek: 'ISUZU' },
    { plat_nomor: 'B 1237 ZN', nama_kendaraan: 'isuzu box', merek: 'ISUZU' },
  ]

  for (const v of vehicles) {
    await prisma.kendaraan.upsert({
      where: { plat_nomor: v.plat_nomor },
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
