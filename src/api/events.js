import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const getEvents = (upcoming = false) => apiGet(`/api/events${upcoming ? '?upcoming=true' : ''}`);
export const createEvent = (event) => apiPost('/api/events', event);
export const updateEvent = (id, event) => apiPut(`/api/events/${id}`, event);
export const deleteEvent = (id) => apiDelete(`/api/events/${id}`);
