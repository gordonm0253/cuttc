import { apiGet, apiPost, apiDelete } from './client';

export const getTournaments = () => apiGet('/api/tournaments');
export const getTournament = (id) => apiGet(`/api/tournaments/${id}`);
export const createTournament = (data) => apiPost('/api/tournaments', data);
export const deleteTournament = (id) => apiDelete(`/api/tournaments/${id}`);
export const reportTournamentMatchResult = (tournamentMatchId, data) =>
    apiPost(`/api/tournaments/matches/${tournamentMatchId}/result`, data);
export const deleteTournamentMatchResult = (tournamentMatchId) =>
    apiDelete(`/api/tournaments/matches/${tournamentMatchId}/result`);
