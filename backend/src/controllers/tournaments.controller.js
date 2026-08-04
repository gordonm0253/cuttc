import * as tournamentsService from '../services/tournaments.service.js';

export async function listTournaments(req, res, next) {
  try {
    res.json(await tournamentsService.listTournaments());
  } catch (err) {
    next(err);
  }
}

export async function getTournament(req, res, next) {
  try {
    res.json(await tournamentsService.getTournament(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function createTournament(req, res, next) {
  try {
    const tournament = await tournamentsService.createTournament({
      ...req.body,
      createdByEmail: req.firebaseUser.email,
    });
    res.status(201).json(tournament);
  } catch (err) {
    next(err);
  }
}

export async function deleteTournament(req, res, next) {
  try {
    await tournamentsService.deleteTournament(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function reportTournamentMatchResult(req, res, next) {
  try {
    const tournament = await tournamentsService.reportTournamentMatchResult(req.params.tournamentMatchId, req.body);
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}

export async function deleteTournamentMatchResult(req, res, next) {
  try {
    await tournamentsService.deleteTournamentMatchResult(req.params.tournamentMatchId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
