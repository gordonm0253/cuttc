import { apiGet } from './client';

export const getPlayers = () => apiGet('/api/players');
