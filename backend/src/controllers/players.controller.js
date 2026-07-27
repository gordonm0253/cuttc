import * as playersService from '../services/players.service.js';

export async function listPlayers(req, res, next) {
  try {
    const players = await playersService.listPlayers({ q: req.query.q });
    res.json(players);
  } catch (err) {
    next(err);
  }
}
