import * as rankingsService from '../services/rankings.service.js';

export async function getRankings(req, res, next) {
  try {
    const rankings = await rankingsService.getRankings();
    res.json(rankings);
  } catch (err) {
    next(err);
  }
}
