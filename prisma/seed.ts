import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin user
  const adminEmail = 'admin@dar-ul-kutub.com'
  const adminPassword = 'Admin123!' // Change this in production!

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('✅ Admin user created:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ID: ${admin.id}`)
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  // Create sample vendor for testing
  const vendorEmail = 'vendor@example.com'
  const vendorPassword = 'Vendor123!'

  const existingVendor = await prisma.user.findUnique({
    where: { email: vendorEmail },
  })

  if (!existingVendor) {
    const hashedPassword = await hashPassword(vendorPassword)

    const vendorUser = await prisma.user.create({
      data: {
        email: vendorEmail,
        passwordHash: hashedPassword,
        role: 'VENDOR',
        status: 'ACTIVE',
        vendor: {
          create: {
            businessName: 'Test Islamic Bookstore',
            businessType: 'BOOKSTORE',
            description: 'A test bookstore for development',
            contactName: 'John Doe',
            contactEmail: vendorEmail,
            contactPhone: '+12025551234',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            status: 'APPROVED',
            approvedAt: new Date(),
          },
        },
      },
      include: {
        vendor: true,
      },
    })

    console.log('✅ Test vendor created:')
    console.log(`   Email: ${vendorEmail}`)
    console.log(`   Password: ${vendorPassword}`)
    console.log(`   Business: ${vendorUser.vendor?.businessName}`)
  } else {
    console.log('ℹ️  Test vendor already exists')
  }

  // Create sample CMS pages
  const pages = [
    {
      slug: 'terms',
      title: 'Terms and Conditions',
      content: '# Terms and Conditions\n\nYour terms here...',
      published: true,
      updatedBy: 'system',
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '# Privacy Policy\n\nYour privacy policy here...',
      published: true,
      updatedBy: 'system',
    },
    {
      slug: 'vendor-agreement',
      title: 'Vendor Agreement',
      content: '# Vendor Agreement\n\nVendor terms here...',
      published: true,
      updatedBy: 'system',
    },
  ]

  for (const page of pages) {
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: page.slug },
    })

    if (!existing) {
      await prisma.cmsPage.create({ data: page })
      console.log(`✅ Created CMS page: ${page.title}`)
    }
  }

  console.log('\n✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
