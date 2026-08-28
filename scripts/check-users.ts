import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function checkUsers() {
  const users = await db.user.findMany({
    select: { id: true, email: true, role: true, plan: true, isGuest: true, generateCount: true },
  });
  console.log('Registered users count:', users.length);
  console.log(JSON.stringify(users, null, 2));
}

checkUsers()
  .catch(console.error)
  .finally(() => db.$disconnect());
