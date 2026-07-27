import * as matchesService from '../services/matches.service.js';

export async function listMatches(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
    const result = await matchesService.listMatches({ page, pageSize });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createMatch(req, res, next) {
  try {
    const { playedAt, playerA, playerB, sets } = req.body;
    const match = await matchesService.createMatch({ playedAt, playerA, playerB, sets });
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
}

export async function deleteMatch(req, res, next) {
  try {
    await matchesService.deleteMatch(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
