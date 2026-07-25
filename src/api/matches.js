import { apiGet, apiPost } from './client';

export const getMatches = (page = 1, pageSize = 20) => apiGet(`/api/matches?page=${page}&pageSize=${pageSize}`);
export const createMatch = (match) => apiPost('/api/matches', match);
