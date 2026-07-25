import { apiGet, apiPut } from './client';

export const getMe = () => apiGet('/api/me');
export const setRankingsOptIn = (rankingsOptIn) => apiPut('/api/me/rankings-opt-in', { rankingsOptIn });
