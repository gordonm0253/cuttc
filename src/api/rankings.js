import { apiGet, apiPost, apiDelete } from './client';

export const getRankings = () => apiGet('/api/rankings');

export const getRankingsViewers = () => apiGet('/api/rankings/viewers');
export const addRankingsViewer = (email) => apiPost('/api/rankings/viewers', { email });
export const removeRankingsViewer = (id) => apiDelete(`/api/rankings/viewers/${id}`);
