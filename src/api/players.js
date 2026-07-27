import { apiGet } from './client';

export const getPlayers = (q) => apiGet(`/api/players${q ? `?q=${encodeURIComponent(q)}` : ''}`);
