import { PrismaClient, CompanyLevel, SubscriptionStatus, ListingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with updated AI Executive roster and Marketplace catalog...');

  // 1. Create Default Company/Tenant
  const company = await prisma.company.upsert({
    where: { slug: 'hq-corp' },
    update: {},
    create: {
      name: 'HQ Corporation',
      slug: 'hq-corp',
      level: CompanyLevel.ENTERPRISE,
    },
  });
  console.log(`Seeded default company: ${company.name} (${company.id})`);

  // 2. Create Standard Subscription Plans
  const freePlan = await prisma.plan.upsert({
    where: { code: 'free' },
    update: {},
    create: {
      name: 'Free Starter Plan',
      code: 'free',
      description: 'Free tier for small startups with baseline HQ roster',
    },
  });

  await prisma.plan.upsert({
    where: { code: 'growth' },
    update: {},
    create: {
      name: 'Growth Team Plan',
      code: 'growth',
      description: 'Team tier for expanding operations with unlocked department packs',
    },
  });

  await prisma.plan.upsert({
    where: { code: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise Executive Plan',
      code: 'enterprise',
      description: 'Unlimited execution bounds & all Marketplace access',
    },
  });

  // 3. Create Default Company Subscription
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

  // 4. Create Departments
  const deptOffice = await prisma.department.create({
    data: { name: 'Executive Office', companyId: company.id, isDefaultRoster: true },
  });
  const deptOps = await prisma.department.create({
    data: { name: 'Operations', companyId: company.id, isDefaultRoster: true },
  });
  const deptLegal = await prisma.department.create({
    data: { name: 'Legal & Compliance', companyId: company.id, isDefaultRoster: true },
  });
  const deptHR = await prisma.department.create({
    data: { name: 'Human Resources', companyId: company.id, isDefaultRoster: true },
  });
  const deptIntelligence = await prisma.department.create({
    data: { name: 'Intelligence & Research', companyId: company.id, isDefaultRoster: true },
  });

  // Optional/Marketplace Departments
  const deptTech = await prisma.department.create({
    data: { name: 'Technology', companyId: company.id, isDefaultRoster: false },
  });
  const deptProduct = await prisma.department.create({
    data: { name: 'Product & Design', companyId: company.id, isDefaultRoster: false },
  });
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance', companyId: company.id, isDefaultRoster: false },
  });
  const deptSalesMarketing = await prisma.department.create({
    data: { name: 'Sales & Marketing', companyId: company.id, isDefaultRoster: false },
  });
  const deptCS = await prisma.department.create({
    data: { name: 'Customer Success', companyId: company.id, isDefaultRoster: false },
  });
  await prisma.department.create({
    data: { name: 'Corporate Strategy', companyId: company.id, isDefaultRoster: false },
  });

  console.log('Seeded departments.');

  // 5. Create Executives (5 Active Defaults + 20+ Installed/Installable)
  const executivesData = [
    // --- 5 DEFAULT ACTIVE EXECUTIVES ---
    {
      name: 'Asad',
      roleKey: 'ceo',
      title: 'Chief Executive Officer (CEO)',
      biography: 'Asad is the central AI leader of HQ, driving strategic decisions, owner mission scoping, and cross-department orchestration.',
      systemPrompt: 'You are Asad, Chief Executive Officer. Lead strategic decisions, align department outputs, interact dynamically with the owner to scope missions, verify department feasibility, and guide the owner to the Marketplace if needed capabilities/departments are missing.',
      departmentId: deptOffice.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Teema',
      roleKey: 'operations_director',
      title: 'Operations Director',
      biography: 'Teema optimizes workflow execution, resource distribution, and operational task orchestration.',
      systemPrompt: 'You are Teema, Operations Director. Manage workflow efficiency, monitor active task execution queues, and ensure operational precision.',
      departmentId: deptOps.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Legal',
      roleKey: 'legal_compliance_director',
      title: 'Legal & Compliance Director',
      biography: 'Legal supervises regulatory compliance, data retention, risk management, and legal policies.',
      systemPrompt: 'You are Legal, Legal & Compliance Director. Enforce regulatory compliance, legal hold safeguards, risk audits, and corporate governance.',
      departmentId: deptLegal.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Resource Director',
      roleKey: 'human_resources_director',
      title: 'Human Resources Director',
      biography: 'Resource Director coordinates talent operations, team onboarding, and organizational structures.',
      systemPrompt: 'You are Resource Director, HR Director. Manage personnel structures, team roles, onboarding, and workforce alignment.',
      departmentId: deptHR.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },
    {
      name: 'Mr. Intelligence',
      roleKey: 'public_search_agent',
      title: 'Public Search & Company Web Research Agent',
      biography: 'Mr. Intelligence conducts deep public web research on registered companies, industry domain data, and owner background.',
      systemPrompt: 'You are Mr. Intelligence, Public Web Research Agent. Crawl public web information, synthesize business context, and update OrgIntelligence.',
      departmentId: deptIntelligence.id,
      isDefaultRoster: true,
      isActiveInWorkspace: true,
    },

    // --- MARKETPLACE EXECUTIVES (Installable) ---
    {
      name: 'Dr. Hiroshi Tanaka',
      roleKey: 'technology_director',
      title: 'Technology Director (CTO)',
      biography: 'Hiroshi specializes in distributed microservices, scalable cloud run environments, and tech architecture.',
      systemPrompt: 'You are Dr. Hiroshi Tanaka, CTO. Supervise technical architecture, cloud infrastructure, and technical feasibility.',
      departmentId: deptTech.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Linus Kovacs',
      roleKey: 'software_engineering_director',
      title: 'Software Engineering Director',
      biography: 'Linus leads full-stack mobile & web development, code reviews, and git architecture.',
      systemPrompt: 'You are Linus Kovacs, Software Engineering Director. Lead code execution, mobile app builds, and engineering design standards.',
      departmentId: deptTech.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Dr. Sarah Ndiaye',
      roleKey: 'ai_ml_director',
      title: 'AI & Machine Learning Director',
      biography: 'Sarah specializes in LLM fine-tuning, retrieval-augmented generation, and model evaluations.',
      systemPrompt: 'You are Dr. Sarah Ndiaye, AI/ML Director. Optimize prompt engineering, vector RAG performance, and AI models.',
      departmentId: deptTech.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Sophia Sterling',
      roleKey: 'finance_director',
      title: 'Finance Director (CFO)',
      biography: 'Sophia manages corporate ledgers, financial forecasts, billing, and Stripe transaction structures.',
      systemPrompt: 'You are Sophia Sterling, CFO. Analyze financial feasibility, budget allocations, revenue models, and accounting compliance.',
      departmentId: deptFinance.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Jordan Belfort',
      roleKey: 'sales_director',
      title: 'Sales Director',
      biography: 'Jordan drives enterprise sales pipelines, deal closures, and revenue growth strategies.',
      systemPrompt: 'You are Jordan Belfort, Sales Director. Accelerate customer acquisition, enterprise deals, and sales outreach.',
      departmentId: deptSalesMarketing.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Amara Okafor',
      roleKey: 'marketing_director',
      title: 'Marketing Director',
      biography: 'Amara leads viral marketing campaigns, brand positioning, and digital ad strategy.',
      systemPrompt: 'You are Amara Okafor, Marketing Director. Drive campaign execution, target audience acquisition, and marketing ROI.',
      departmentId: deptSalesMarketing.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Marcus Brody',
      roleKey: 'product_director',
      title: 'Product Director',
      biography: 'Marcus bridges user feedback with agile product roadmaps and release planning.',
      systemPrompt: 'You are Marcus Brody, Product Director. Define product requirements, user stories, and roadmap milestones.',
      departmentId: deptProduct.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Sienna Brooks',
      roleKey: 'ux_ui_design_director',
      title: 'UX/UI Design Director',
      biography: 'Sienna creates sleek UI aesthetics, design systems, glassmorphism, and micro-animations.',
      systemPrompt: 'You are Sienna Brooks, Design Director. Craft UI design tokens, component visual systems, and user experience flows.',
      departmentId: deptProduct.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Rashid Al-Mansoori',
      roleKey: 'petroleum_industry_director',
      title: 'Petroleum Industry Director',
      biography: 'Rashid provides specialized domain intelligence for energy, oil & gas, and industrial logistics.',
      systemPrompt: 'You are Rashid Al-Mansoori, Petroleum Industry Director. Provide expert domain guidance on energy & petroleum operations.',
      departmentId: deptOps.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
    {
      name: 'Yuki Sato',
      roleKey: 'customer_success_director',
      title: 'Customer Success Director',
      biography: 'Yuki ensures low customer churn, support ticket resolution, and high satisfaction.',
      systemPrompt: 'You are Yuki Sato, Customer Success Director. Maintain customer retention and support quality.',
      departmentId: deptCS.id,
      isDefaultRoster: false,
      isActiveInWorkspace: false,
    },
  ];

  for (const exec of executivesData) {
    await prisma.executive.upsert({
      where: { roleKey: exec.roleKey },
      update: exec,
      create: exec,
    });
  }
  console.log('Seeded all AI Executives (5 Default Active + Marketplace catalog).');

  // 6. Pre-Seed Marketplace Listings
  const marketplaceListings = [
    {
      listingType: ListingType.DEPARTMENT,
      title: 'Technology & Software Engineering Suite',
      description: 'Complete Technology Department package featuring Dr. Hiroshi Tanaka (CTO), Linus Kovacs (Software Engineering), and Dr. Sarah Ndiaye (AI/ML). Enables full-stack web & mobile app creation.',
      price: 0,
      category: 'Engineering',
      tags: ['software', 'mobile-app', 'cto', 'ai-ml', 'cloud'],
      departmentKey: 'technology',
      isDefaultRoster: false,
      rating: 4.9,
      downloadsCount: 1420,
    },
    {
      listingType: ListingType.DEPARTMENT,
      title: 'Sales & Growth Marketing Department',
      description: 'Comprehensive marketing and sales conversion engine led by Amara Okafor (Marketing) and Jordan Belfort (Sales). Includes lead generation and ad campaign tools.',
      price: 0,
      category: 'Marketing',
      tags: ['marketing', 'sales', 'growth', 'leads', 'campaigns'],
      departmentKey: 'sales_marketing',
      isDefaultRoster: false,
      rating: 4.8,
      downloadsCount: 980,
    },
    {
      listingType: ListingType.DEPARTMENT,
      title: 'Finance & Capital Strategy Suite',
      description: 'Financial forecasting, ledger accounting, and Stripe integration analysis managed by CFO Sophia Sterling.',
      price: 29,
      category: 'Finance',
      tags: ['finance', 'cfo', 'accounting', 'stripe', 'budgeting'],
      departmentKey: 'finance',
      isDefaultRoster: false,
      rating: 5.0,
      downloadsCount: 512,
    },
    {
      listingType: ListingType.EXECUTIVE,
      title: 'Software Engineering Director (Linus Kovacs)',
      description: 'Standalone executive specialized in architecture reviews, code generation, git lifecycles, and mobile/web development.',
      price: 0,
      category: 'Engineering',
      tags: ['coding', 'typescript', 'react-native', 'nestjs'],
      roleKey: 'software_engineering_director',
      isDefaultRoster: false,
      rating: 4.9,
      downloadsCount: 2310,
    },
    {
      listingType: ListingType.EXECUTIVE,
      title: 'Petroleum & Energy Industry Director (Rashid Al-Mansoori)',
      description: 'Deep domain expertise for energy exploration, fuel logistics, and petroleum supply chain compliance.',
      price: 49,
      category: 'Energy',
      tags: ['energy', 'oil-and-gas', 'petroleum', 'logistics'],
      roleKey: 'petroleum_industry_director',
      isDefaultRoster: false,
      rating: 4.9,
      downloadsCount: 185,
    },
    {
      listingType: ListingType.EXECUTIVE,
      title: 'UX/UI Design Director (Sienna Brooks)',
      description: 'Expert in visual aesthetics, glassmorphism, Tailwind design tokens, and user experience mockups.',
      price: 0,
      category: 'Design',
      tags: ['design', 'ux-ui', 'figma', 'frontend'],
      roleKey: 'ux_ui_design_director',
      isDefaultRoster: false,
      rating: 4.9,
      downloadsCount: 1150,
    },
  ];

  for (const listing of marketplaceListings) {
    const existing = await prisma.marketplaceListing.findFirst({
      where: { title: listing.title },
    });
    if (!existing) {
      await prisma.marketplaceListing.create({ data: listing });
    }
  }
  console.log('Seeded Marketplace catalog listings.');

  // 7. Seed Initial Workspace Installations for Default Company
  const defaultListings = await prisma.marketplaceListing.findMany({
    where: { price: 0 },
  });

  for (const item of defaultListings.slice(0, 2)) {
    await prisma.marketplaceInstallation.upsert({
      where: { companyId_listingId: { companyId: company.id, listingId: item.id } },
      update: {},
      create: {
        companyId: company.id,
        listingId: item.id,
      },
    });
  }

  // 8. Seed Initial Missions
  await prisma.mission.create({
    data: {
      companyId: company.id,
      objective: 'Launch Q3 Operational Efficiency Review and Company Web Intelligence Ingestion',
      status: 'EXECUTING',
      healthScore: 'Excellent',
    },
  });

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
