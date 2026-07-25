import prisma from '../lib/prisma.js';

export async function getRankings() {
  const players = await prisma.player.findMany({
    where: { rankingsOptIn: true },
    orderBy: { elo: 'desc' },
    select: {
      id: true,
      displayName: true,
      elo: true,
      _count: {
        select: { matchesWon: true },
      },
      matchesAsA: { select: { id: true } },
      matchesAsB: { select: { id: true } },
    },
  });

  return players.map((player) => {
    const totalMatches = player.matchesAsA.length + player.matchesAsB.length;
    const wins = player._count.matchesWon;
    return {
      id: player.id,
      displayName: player.displayName,
      elo: player.elo,
      wins,
      losses: totalMatches - wins,
    };
  });
}
