
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const prisma = new PrismaClient();
const rl = readline.createInterface({ input, output });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing.');
  }

  const email = 'superadmin@adse.local';
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    throw new Error(
      `Setup stopped: ${existingUsers} user(s) already exist. No changes made.`
    );
  }

  const password = await rl.question(
    'Enter a new password for the Super Admin (minimum 12 characters): '
  );

  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters.');
  }

  const confirm = await rl.question(
    'Create superadmin@adse.local in this database? Type YES to confirm: '
  );

  if (confirm !== 'YES') {
    console.log('Cancelled. No changes made.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      passwordHash,
    },
  });

  console.log('Super Admin account created successfully.');
  console.log('Email:', email);
  console.log('Use the password you entered to log in.');
}

main()
  .catch((error) => {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
