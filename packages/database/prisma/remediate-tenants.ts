import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function remediateTenants() {
  console.log('🚀 Starting Multi-Tenant Database Isolation Remediation...');

  try {
    const allCompanies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (allCompanies.length === 0) {
      console.log('No companies found in database. Clean state.');
      return;
    }

    const firstCompany = allCompanies[0];
    console.log(`📌 Primary Company #1 identified: "${firstCompany.name}" (${firstCompany.id})`);

    // Find all users attached to the first company
    const usersInFirstCompany = await prisma.user.findMany({
      where: { companyId: firstCompany.id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${usersInFirstCompany.length} users attached to Company #1.`);

    if (usersInFirstCompany.length <= 1) {
      console.log('✅ Company #1 has 1 or 0 users. No user crosstalk remediation needed.');
    } else {
      // The very first user created stays with Company #1
      const ownerUser = usersInFirstCompany[0];
      const usersToMigrate = usersInFirstCompany.slice(1);

      console.log(`Keeping original owner: "${ownerUser.email}" (${ownerUser.id}) attached to Company #1.`);
      console.log(`Remediating ${usersToMigrate.length} users to their own dedicated isolated companies...`);

      for (const user of usersToMigrate) {
        const rawName = user.email ? user.email.split('@')[0] : 'User';
        const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const newOrgName = `${cleanName}'s Organization`;
        const newOrgSlug = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Create new company for this user
        const newCompany = await prisma.company.create({
          data: {
            name: newOrgName,
            slug: newOrgSlug,
            primaryColor: '#0A84FF',
          },
        });

        // Update user to point to their own company
        await prisma.user.update({
          where: { id: user.id },
          data: {
            companyId: newCompany.id,
            role: 'ORGANIZATION_OWNER',
          },
        });

        // Provision default department
        await prisma.department.create({
          data: {
            name: 'Executive Leadership',
            companyId: newCompany.id,
          },
        });

        console.log(`  └─ Created Company "${newCompany.name}" (${newCompany.id}) for user "${user.email}"`);
      }
    }

    console.log('✅ Multi-Tenant Database Isolation Remediation Complete!');
  } catch (err) {
    console.error('❌ Remediation error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

remediateTenants();
