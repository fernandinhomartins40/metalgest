import prisma from '@metalgest/database';

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
export default prisma;
