import prisma from '../lib/prisma.js';
import { STARTING_ELO } from '../lib/elo.js';

const SEARCH_RESULT_LIMIT = 8;

export async function listPlayers({ q } = {}) {
  const query = q?.trim();

  const [viewers, players] = await Promise.all([
    prisma.rankingsViewer.findMany({ select: { email: true } }),
    prisma.player.findMany({
      where: query
        ? {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true, email: true, elo: true },
      take: query ? SEARCH_RESULT_LIMIT * 4 : undefined,
    }),
  ]);

  const allowedEmails = new Set(viewers.map((v) => v.email.toLowerCase()));
  const filtered = players.filter((p) => allowedEmails.has(p.email.toLowerCase()));
  return query ? filtered.slice(0, SEARCH_RESULT_LIMIT) : filtered;
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
