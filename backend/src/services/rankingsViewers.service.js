import prisma from '../lib/prisma.js';

export async function listViewers() {
  return prisma.rankingsViewer.findMany({
    orderBy: { email: 'asc' },
  });
}

export async function addViewer(email) {
  return prisma.rankingsViewer.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase() },
  });
}

export async function removeViewer(id) {
  await prisma.rankingsViewer.delete({ where: { id } }).catch((err) => {
    if (err.code === 'P2025') {
      const notFound = new Error('Viewer not found');
      notFound.status = 404;
      throw notFound;
    }
    throw err;
  });
}
