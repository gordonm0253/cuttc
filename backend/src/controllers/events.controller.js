import * as eventsService from '../services/events.service.js';

export async function listEvents(req, res, next) {
  try {
    const upcoming = req.query.upcoming === 'true';
    const events = await eventsService.listEvents({ upcoming });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await eventsService.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    await eventsService.deleteEvent(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
