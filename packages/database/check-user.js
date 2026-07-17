const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function stringToUuid(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

async function run() {
  const rawId = 'Q6gk3csNgLcAo96T595ckUOYyQD3';
  const id = stringToUuid(rawId);
  console.log('Firebase raw ID:', rawId);
  console.log('Mapped UUID:', id);

  const user = await prisma.user.findUnique({
    where: { id },
    include: { company: true }
  });

  if (user) {
    console.log('USER FOUND:', JSON.stringify(user, null, 2));
  } else {
    console.log('USER NOT FOUND IN DB. Checking other users:');
    const users = await prisma.user.findMany({
      take: 10,
      include: { company: true }
    });
    console.log(JSON.stringify(users, null, 2));
  }
  
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
