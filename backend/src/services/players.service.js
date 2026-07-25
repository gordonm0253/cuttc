import prisma from '../lib/prisma.js';
import { STARTING_ELO } from '../lib/elo.js';

export async function listPlayers() {
  const [viewers, players] = await Promise.all([
    prisma.rankingsViewer.findMany({ select: { email: true } }),
    prisma.player.findMany({
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true, email: true, elo: true },
    }),
  ]);

  const allowedEmails = new Set(viewers.map((v) => v.email.toLowerCase()));
  return players.filter((p) => allowedEmails.has(p.email.toLowerCase()));
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
