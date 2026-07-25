import prisma from '../lib/prisma.js';
import { STARTING_ELO } from '../lib/elo.js';

export async function listPlayers() {
  return prisma.player.findMany({
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true, email: true, elo: true },
  });
}

export async function ensurePlayerForUser({ email, name }) {
  return prisma.player.upsert({
    where: { email },
    update: {},
    create: {
      email,
      displayName: name || email,
      elo: STARTING_ELO,
    },
  });
}

export async function setRankingsOptIn(email, rankingsOptIn) {
  return prisma.player.update({
    where: { email },
    data: { rankingsOptIn },
  });
}
