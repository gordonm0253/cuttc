import * as rankingsViewersService from '../services/rankingsViewers.service.js';

export async function listViewers(req, res, next) {
  try {
    const viewers = await rankingsViewersService.listViewers();
    res.json(viewers);
  } catch (err) {
    next(err);
  }
}

export async function addViewer(req, res, next) {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      const err = new Error('email is required');
      err.status = 400;
      throw err;
    }
    const viewer = await rankingsViewersService.addViewer(email.trim());
    res.status(201).json(viewer);
  } catch (err) {
    next(err);
  }
}

export async function removeViewer(req, res, next) {
  try {
    await rankingsViewersService.removeViewer(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
