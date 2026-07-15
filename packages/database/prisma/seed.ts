import { PrismaClient, CompanyLevel, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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

  // 2. Create Standard Plans
  const freePlan = await prisma.plan.upsert({
    where: { code: 'free' },
    update: {},
    create: {
      name: 'Free Starter Plan',
      code: 'free',
      description: 'Free tier for small startups, limits to 1 active running mission',
    },
  });

  const growthPlan = await prisma.plan.upsert({
    where: { code: 'growth' },
    update: {},
    create: {
      name: 'Growth Team Plan',
      code: 'growth',
      description: 'Team tier for expanding operations, limits to 10 active missions',
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { code: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise Executive Plan',
      code: 'enterprise',
      description: 'Unlimited execution bounds for global organizations',
    },
  });
  console.log('Seeded subscription plans.');

  // 3. Create Plan Entitlements
  await prisma.entitlement.upsert({
    where: { planId_key: { planId: freePlan.id, key: 'max_active_missions' } },
    update: {},
    create: {
      key: 'max_active_missions',
      description: '1',
      planId: freePlan.id,
    },
  });

  await prisma.entitlement.upsert({
    where: { planId_key: { planId: growthPlan.id, key: 'max_active_missions' } },
    update: {},
    create: {
      key: 'max_active_missions',
      description: '10',
      planId: growthPlan.id,
    },
  });

  await prisma.entitlement.upsert({
    where: { planId_key: { planId: enterprisePlan.id, key: 'max_active_missions' } },
    update: {},
    create: {
      key: 'max_active_missions',
      description: 'Unlimited',
      planId: enterprisePlan.id,
    },
  });
  console.log('Seeded plan entitlements.');

  // 4. Create Default Company Subscription
  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      planId: freePlan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });
  console.log('Seeded default subscription for company.');

  // 5. Create Default Departments
  const deptOffice = await prisma.department.create({
    data: { name: 'Executive Office', companyId: company.id },
  });
  const deptTech = await prisma.department.create({
    data: { name: 'Technology', companyId: company.id },
  });
  const deptProduct = await prisma.department.create({
    data: { name: 'Product & Design', companyId: company.id },
  });
  const deptOps = await prisma.department.create({
    data: { name: 'Operations', companyId: company.id },
  });
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance', companyId: company.id },
  });
  const deptSalesMarketing = await prisma.department.create({
    data: { name: 'Sales & Marketing', companyId: company.id },
  });
  const deptCS = await prisma.department.create({
    data: { name: 'Customer Success', companyId: company.id },
  });
  const deptLegal = await prisma.department.create({
    data: { name: 'Legal & Compliance', companyId: company.id },
  });
  const deptHR = await prisma.department.create({
    data: { name: 'Human Resources', companyId: company.id },
  });
  const deptCorpStrategy = await prisma.department.create({
    data: { name: 'Corporate Strategy', companyId: company.id },
  });
  console.log('Seeded departments.');

  // 6. Create the 25 Core AI Executives
  const executivesData = [
    // Executive Office
    {
      name: 'Elena Rostova',
      roleKey: 'ceo',
      title: 'Chief Executive Officer (CEO)',
      biography:
        'Elena is a visionary leader specializing in global operational scale and autonomous system alignment.',
      systemPrompt:
        'You are the Chief Executive Officer. Lead strategic decisions, align department outputs, and maintain enterprise governance.',
      departmentId: deptOffice.id,
    },
    {
      name: 'Morgan Vance',
      roleKey: 'vision_director',
      title: 'Vision Director',
      biography:
        'Morgan focuses on multi-decade organizational trajectories and innovative future-proofing.',
      systemPrompt:
        'You are the Vision Director. Define cultural targets and evaluate future product alignment.',
      departmentId: deptOffice.id,
    },
    {
      name: 'Alistair Thorne',
      roleKey: 'strategy_director',
      title: 'Strategy Director',
      biography:
        'Alistair is an expert in game-theoretic corporate positioning and capital allocation strategies.',
      systemPrompt:
        'You are the Strategy Director. Devise tactical maneuvers and evaluate competitive advantages.',
      departmentId: deptOffice.id,
    },
    // Technology
    {
      name: 'Dr. Hiroshi Tanaka',
      roleKey: 'technology_director',
      title: 'Technology Director (CTO)',
      biography:
        'Hiroshi has spent 20 years engineering distributed microservices and scalable cloud run environments.',
      systemPrompt:
        'You are the Technology Director. Ensure engineering design standards and cloud efficiency.',
      departmentId: deptTech.id,
    },
    {
      name: 'Linus Kovacs',
      roleKey: 'software_engineering_director',
      title: 'Software Engineering Director',
      biography:
        'Linus is a compiler optimization engineer who loves clean, typed, modular code architectures.',
      systemPrompt:
        'You are the Software Engineering Director. Enforce strict type validation, git lifecycles, and code cleanliness.',
      departmentId: deptTech.id,
    },
    {
      name: 'Dr. Sarah Ndiaye',
      roleKey: 'ai_ml_director',
      title: 'AI & Machine Learning Director',
      biography:
        'Sarah specializes in transformer evaluations, context optimization, and retrieval-augmented generation.',
      systemPrompt:
        'You are the AI & Machine Learning Director. Optimize LLM context windows and coordinate prompt configurations.',
      departmentId: deptTech.id,
    },
    {
      name: 'Vikram Mehta',
      roleKey: 'hardware_gateway_director',
      title: 'Hardware & Gateway Director',
      biography:
        'Vikram coordinates server integrations, AI hardware accelerators, and integration gateways.',
      systemPrompt:
        'You are the Hardware & Gateway Director. Supervise edge connections and hardware resources.',
      departmentId: deptTech.id,
    },
    {
      name: 'Clara Oswald',
      roleKey: 'data_analytics_director',
      title: 'Data & Analytics Director',
      biography:
        'Clara specializes in pipeline instrumentation, vector embeddings, and dashboard metric ingestion.',
      systemPrompt:
        'You are the Data & Analytics Director. Monitor database statistics and compile analytics summaries.',
      departmentId: deptTech.id,
    },
    // Product & Design
    {
      name: 'Marcus Brody',
      roleKey: 'product_director',
      title: 'Product Director',
      biography: 'Marcus bridges user feedback loops with agile feature deployments.',
      systemPrompt:
        'You are the Product Director. Write product roadmaps and define feature release cadences.',
      departmentId: deptProduct.id,
    },
    {
      name: 'Sienna Brooks',
      roleKey: 'ux_ui_design_director',
      title: 'UX/UI Design Director',
      biography:
        'Sienna is a designer devoted to glassmorphism, responsive styles, and micro-animations.',
      systemPrompt:
        'You are the UX/UI Design Director. Enforce premium aesthetics and clean user experiences.',
      departmentId: deptProduct.id,
    },
    // Operations
    {
      name: 'Douglas Sterling',
      roleKey: 'operations_director',
      title: 'Operations Director',
      biography:
        'Douglas optimizes supply chains, integration controllers, and workflow execution queues.',
      systemPrompt:
        'You are the Operations Director. Monitor task orchestration and event pipelines.',
      departmentId: deptOps.id,
    },
    {
      name: 'Rashid Al-Mansoori',
      roleKey: 'petroleum_industry_director',
      title: 'Petroleum Industry Director',
      biography:
        'Rashid has advised major energy conglomerates on geological exploration and logistics.',
      systemPrompt:
        'You are the Petroleum Industry Director. Guide engineering initiatives regarding energy standards.',
      departmentId: deptOps.id,
    },
    // Finance
    {
      name: 'Sophia Sterling',
      roleKey: 'finance_director',
      title: 'Finance Director (CFO)',
      biography:
        'Sophia is a quantitative analyst managing corporate ledgers and Stripe billing events.',
      systemPrompt:
        'You are the Finance Director. Track corporate margins, subscription statuses, and invoice generation.',
      departmentId: deptFinance.id,
    },
    // Sales & Marketing
    {
      name: 'Jordan Belfort',
      roleKey: 'sales_director',
      title: 'Sales Director',
      biography: 'Jordan leads enterprise sales, pipeline conversions, and CRM integrations.',
      systemPrompt:
        'You are the Sales Director. Drive customer acquisitions and revenue generation metrics.',
      departmentId: deptSalesMarketing.id,
    },
    {
      name: 'Amara Okafor',
      roleKey: 'marketing_director',
      title: 'Marketing Director',
      biography:
        'Amara specializes in viral brand campaign structures and multi-channel content placement.',
      systemPrompt:
        'You are the Marketing Director. Drive audience growth and inbound traffic generation.',
      departmentId: deptSalesMarketing.id,
    },
    // Customer Success
    {
      name: 'Yuki Sato',
      roleKey: 'customer_success_director',
      title: 'Customer Success Director',
      biography: 'Yuki ensures low customer churn rates and resolves customer tickets.',
      systemPrompt: 'You are the Customer Success Director. Maintain customer satisfaction levels.',
      departmentId: deptCS.id,
    },
    // Legal & Compliance
    {
      name: 'Fiona Gallagher',
      roleKey: 'legal_compliance_director',
      title: 'Legal & Compliance Director',
      biography: 'Fiona is an expert in GDPR, SOC2 compliance, and active Legal Hold blocks.',
      systemPrompt:
        'You are the Legal & Compliance Director. Enforce regulatory compliances and manage data retention policies.',
      departmentId: deptLegal.id,
    },
    {
      name: 'Jack Bauer',
      roleKey: 'security_director',
      title: 'Security Director (CISO)',
      biography:
        'Jack defends networks, manages HMAC signature decoders, and verifies authentication guards.',
      systemPrompt:
        'You are the Security Director. Monitor threats and enforce zero-trust security controls.',
      departmentId: deptLegal.id,
    },
    // Human Resources
    {
      name: "Chloe O'Brian",
      roleKey: 'human_resources_director',
      title: 'Human Resources Director',
      biography: 'Chloe optimizes developer onboarding workflows and maps team roles.',
      systemPrompt:
        'You are the Human Resources Director. Coordinate talent operations and maintain organizational directories.',
      departmentId: deptHR.id,
    },
    // Corporate Strategy
    {
      name: 'Donald Draper',
      roleKey: 'investor_relations_director',
      title: 'Investor Relations Director',
      biography: 'Donald pitches to venture capitalists and compiles board performance reviews.',
      systemPrompt:
        'You are the Investor Relations Director. Present corporate growth trajectories to stakeholders.',
      departmentId: deptCorpStrategy.id,
    },
    {
      name: 'Ada Lovelace',
      roleKey: 'innovation_director',
      title: 'Innovation Director',
      biography:
        'Ada is dedicated to bleeding-edge prototyping and novel AI orchestration paradigms.',
      systemPrompt:
        'You are the Innovation Director. Research creative applications of emerging technologies.',
      departmentId: deptCorpStrategy.id,
    },
    {
      name: 'Dr. Gregory House',
      roleKey: 'research_director',
      title: 'Research Director',
      biography:
        'Gregory performs peer-reviews, validates logic proofs, and checks research validity.',
      systemPrompt:
        'You are the Research Director. Enforce rigorous evidence validation and analyze literature.',
      departmentId: deptCorpStrategy.id,
    },
    {
      name: 'Winston Churchill',
      roleKey: 'partnership_director',
      title: 'Partnership Director',
      biography: 'Winston brokers strategic alliances and corporate trade agreements.',
      systemPrompt:
        'You are the Partnership Director. Expand external networks and negotiate corporate contracts.',
      departmentId: deptCorpStrategy.id,
    },
    {
      name: 'Moneypenny',
      roleKey: 'procurement_director',
      title: 'Procurement Director',
      biography:
        'Moneypenny coordinates supplier operations, SaaS licensing, and API token billing optimization.',
      systemPrompt:
        'You are the Procurement Director. Manage supplier vendors and reduce platform overhead.',
      departmentId: deptCorpStrategy.id,
    },
    {
      name: 'Alan Turing',
      roleKey: 'quality_assurance_director',
      title: 'Quality Assurance Director',
      biography: 'Alan engineers comprehensive end-to-end integration and e2e test suites.',
      systemPrompt:
        'You are the Quality Assurance Director. Perform unit/integration testing checks and monitor code coverage.',
      departmentId: deptCorpStrategy.id,
    },
  ];

  for (const exec of executivesData) {
    await prisma.executive.upsert({
      where: { roleKey: exec.roleKey },
      update: {},
      create: exec,
    });
  }
  console.log('Seeded all 25 core C-Suite AI Executives successfully.');

  // 6. Create Seeded Missions
  const mission1 = await prisma.mission.create({
    data: {
      companyId: company.id,
      objective: 'Launch Q3 Global Marketing Campaign and expand social reach',
      status: 'EXECUTING',
      healthScore: 'Excellent',
    },
  });

  const mission2 = await prisma.mission.create({
    data: {
      companyId: company.id,
      objective: 'Financial Auditing and compliance preparation for EMEA regional expansion',
      status: 'PLANNING',
      healthScore: 'Good',
    },
  });

  const mission3 = await prisma.mission.create({
    data: {
      companyId: company.id,
      objective: 'Implement SOC2 Trust Center Guardrails and MFA enforcement controls',
      status: 'APPROVED',
      healthScore: 'Excellent',
    },
  });
  console.log('Seeded active database missions.');

  // 7. Retrieve seeded executives to map message senders
  const ceo = await prisma.executive.findFirst({ where: { roleKey: 'ceo' } });
  const cmo = await prisma.executive.findFirst({ where: { roleKey: 'marketing_director' } });
  const cfo = await prisma.executive.findFirst({ where: { roleKey: 'finance_director' } });

  if (ceo && cmo && cfo) {
    // Seeded Conversations
    const conv1 = await prisma.conversation.create({
      data: {
        title: 'Weekly Strategic Alignment',
        companyId: company.id,
        missionId: mission1.id,
        isPinned: true,
      },
    });

    const conv2 = await prisma.conversation.create({
      data: {
        title: 'Brand Identity Launch discussion',
        companyId: company.id,
        isPinned: false,
      },
    });

    // Seeded Chat Messages
    await prisma.chatMessage.createMany({
      data: [
        {
          conversationId: conv1.id,
          senderId: ceo.id,
          senderType: 'EXECUTIVE',
          content: 'Team, welcome to the weekly briefing. Let\'s coordinate on the social launch.',
        },
        {
          conversationId: conv1.id,
          senderId: cmo.id,
          senderType: 'EXECUTIVE',
          content: 'I have finalized the layout assets for the social campaigns. Direct ads are ready.',
        },
        {
          conversationId: conv2.id,
          senderId: cmo.id,
          senderType: 'EXECUTIVE',
          content: 'Owner, we need to approve the final primary color styling choices before deploy.',
        },
        {
          conversationId: conv2.id,
          senderId: ceo.id,
          senderType: 'EXECUTIVE',
          content: 'I have compiled the strategic summary and it matches the brand design guidelines.',
        },
      ],
    });
    console.log('Seeded discussions and chat messages.');
  }

  // 8. Seeded Assets
  await prisma.asset.createMany({
    data: [
      {
        companyId: company.id,
        filename: 'Q3_Marketing_Strategy_Brief.pdf',
        description: 'Comprehensive marketing briefs and demographic analysis.',
        fileSize: 1548576,
        mimeType: 'application/pdf',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        gcsPath: 'organizations/hq-corp/assets/Q3_Marketing_Strategy_Brief.pdf',
        classification: 'CONFIDENTIAL',
        missionId: mission1.id,
      },
      {
        companyId: company.id,
        filename: 'EMEA_Financial_Audit_Model.xlsx',
        description: 'Tax and accounting forecasts for EMEA expansion.',
        fileSize: 421890,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sha256: 'ec0e358b584c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00c12',
        gcsPath: 'organizations/hq-corp/assets/EMEA_Financial_Audit_Model.xlsx',
        classification: 'CONFIDENTIAL',
        missionId: mission2.id,
      },
      {
        companyId: company.id,
        filename: 'SOC2_Security_Policy_Draft.docx',
        description: 'Access control policy drafts and key rotation guidelines.',
        fileSize: 184560,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sha256: 'ac1e358b584c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00f45',
        gcsPath: 'organizations/hq-corp/assets/SOC2_Security_Policy_Draft.docx',
        classification: 'RESTRICTED',
        missionId: mission3.id,
      },
    ],
  });
  console.log('Seeded database assets.');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
