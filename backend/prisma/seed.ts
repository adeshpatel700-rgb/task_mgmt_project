import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Complete project documentation',
        description: 'Write comprehensive README and API documentation',
        status: 'TODO',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement authentication',
        description: 'Set up JWT-based authentication with refresh tokens',
        status: 'IN_PROGRESS',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'DONE',
        userId: user.id,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} sample tasks`);
  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
