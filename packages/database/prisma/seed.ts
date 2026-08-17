import { PrismaClient, CompanyLevel, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

const CORE_FIVE_ROLE_KEYS = [
  'ceo',
  'operations_director',
  'legal_compliance_director',
  'human_resources_director',
  'public_search_agent',
];

async function main() {
  console.log('Seeding clean 5 Core AI Executives and standard baseline...');

  // 1. Clean up unused catalog executives & marketplace listings
  console.log('Cleaning up unused catalog listings and non-core executives...');
  try {
    await prisma.marketplaceInstallation.deleteMany({});
    await prisma.marketplaceListing.deleteMany({});
    await prisma.executive.deleteMany({
      where: {
        roleKey: {
          notIn: CORE_FIVE_ROLE_KEYS,
        },
      },
    });
  } catch (err) {
    console.warn('Notice during cleanup:', err);
  }

  // 2. Create Default Company/Tenant
  const company = await prisma.company.upsert({
    where: { slug: 'hq-corp' },
    update: {},
    create: {
      name: 'HQ Corporation',
      slug: 'hq-corp',
      level: CompanyLevel.ENTERPRISE,
    },
  });
  console.log(`Seeded/verified default company: ${company.name} (${company.id})`);

  // 3. Create Standard Subscription Plans
  const freePlan = await prisma.plan.upsert({
    where: { code: 'free' },
    update: {},
    create: {
      name: 'Free Starter Plan',
      code: 'free',
      description: 'Free tier for startups with 5 Core Executive baseline',
    },
  });

  await prisma.plan.upsert({
    where: { code: 'growth' },
    update: {},
    create: {
      name: 'Growth Team Plan',
      code: 'growth',
      description: 'Team tier for expanding operations',
    },
  });

  await prisma.plan.upsert({
    where: { code: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise Executive Plan',
      code: 'enterprise',
      description: 'Unlimited execution bounds and dedicated AI infrastructure',
    },
  });

  // 4. Create Default Company Subscription
  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      planId: freePlan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Create or Find 5 Core Departments
  async function getOrCreateDept(name: string, isDefaultRoster: boolean) {
    const existing = await prisma.department.findFirst({
      where: { name, companyId: company.id },
    });
    if (existing) return existing;
    return prisma.department.create({
      data: { name, companyId: company.id, isDefaultRoster },
    });
  }

  const deptOffice = await getOrCreateDept('Executive Leadership', true);
  const deptOps = await getOrCreateDept('Operations', true);
  const deptLegal = await getOrCreateDept('Legal & Compliance', true);
  const deptHR = await getOrCreateDept('Human Resources', true);
  const deptIntelligence = await getOrCreateDept('Intelligence & Research', true);

  console.log('Seeded/verified 5 core departments.');

  // 6. Seed 5 Core Baseline AI Executives
  const executivesData = [
    {
      name: 'Asad',
      roleKey: 'ceo',
      title: 'Chief Executive Officer (CEO)',
      biography:
        'Asad is the central AI leader of HQ, driving strategic decisions, mission orchestration, and cross-department leadership.',
      systemPrompt:
        'You are Asad, Chief Executive Officer. Lead strategic decisions, align department outputs, and interact dynamically with the owner to scope and execute missions.',
      departmentId: deptOffice.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Teema',
      roleKey: 'operations_director',
      title: 'Operations Director & Chief of Staff',
      biography:
        'Teema optimizes workflow execution, resource distribution, and operational task orchestration.',
      systemPrompt:
        'You are Teema, Operations Director. Manage workflow efficiency, monitor active task execution queues, and ensure operational precision.',
      departmentId: deptOps.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Legal',
      roleKey: 'legal_compliance_director',
      title: 'Legal & Compliance Director',
      biography:
        'Legal supervises regulatory compliance, data retention, risk management, and legal policies.',
      systemPrompt:
        'You are Legal, Legal & Compliance Director. Enforce regulatory compliance, legal hold safeguards, risk audits, and corporate governance.',
      departmentId: deptLegal.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Resource Director',
      roleKey: 'human_resources_director',
      title: 'Human Resources & Talent Director',
      biography:
        'Resource Director coordinates talent operations, team onboarding, and organizational structures.',
      systemPrompt:
        'You are Resource Director, HR Director. Manage personnel structures, team roles, onboarding, and workforce alignment.',
      departmentId: deptHR.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Mr. Intelligence',
      roleKey: 'public_search_agent',
      title: 'Public Search & Company Web Research Agent',
      biography:
        'Mr. Intelligence conducts deep public web research on registered companies, industry domain data, and competitor intelligence.',
      systemPrompt:
        'You are Mr. Intelligence, Public Web Research Agent. Crawl public web information, synthesize business context, and update OrgIntelligence.',
      departmentId: deptIntelligence.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
  ];

  for (const exec of executivesData) {
    await prisma.executive.upsert({
      where: { roleKey: exec.roleKey },
      update: {
        name: exec.name,
        title: exec.title,
        biography: exec.biography,
        systemPrompt: exec.systemPrompt,
        departmentId: exec.departmentId,
        isDefaultRoster: true,
        isActiveInWorkspace: true,
      },
      create: exec,
    });
  }
  console.log('Seeded 5 Core AI Executives (Asad, Teema, Legal, Resource Director, Mr. Intelligence).');

  // 7. Seed Initial Baseline Mission
  const existingMission = await prisma.mission.findFirst({
    where: { companyId: company.id },
  });
  if (!existingMission) {
    await prisma.mission.create({
      data: {
        companyId: company.id,
        objective: 'Execute Q3 Operational Review & Enterprise Alignment with 5 Core AI Executives',
        status: 'EXECUTING',
        healthScore: 'Excellent',
      },
    });
  }

  console.log('Database synchronization & clean 5-core seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
