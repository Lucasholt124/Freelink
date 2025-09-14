
import { PrismaClient } from '@prisma/client';

// Esta mágica impede que múltiplas instâncias do PrismaClient sejam criadas
// em ambiente de desenvolvimento devido ao hot-reloading do Next.js.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;