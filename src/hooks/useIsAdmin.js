import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthUserProvider';
import { getMe, setRankingsOptIn as setRankingsOptInApi } from '../api/me';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [rankingsOptIn, setRankingsOptIn] = useState(false);
  const [hasRankingsAccess, setHasRankingsAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setPlayerId(null);
      setRankingsOptIn(false);
      setHasRankingsAccess(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    getMe()
      .then((data) => {
        setIsAdmin(!!data.isAdmin);
        setPlayerId(data.playerId || null);
        setRankingsOptIn(!!data.rankingsOptIn);
        setHasRankingsAccess(!!data.hasRankingsAccess);
      })
      .catch(() => {
        setIsAdmin(false);
        setPlayerId(null);
        setRankingsOptIn(false);
        setHasRankingsAccess(false);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggleRankingsOptIn = useCallback(async (nextValue) => {
    const result = await setRankingsOptInApi(nextValue);
    setRankingsOptIn(!!result.rankingsOptIn);
    return result.rankingsOptIn;
  }, []);

  return { isAdmin, playerId, rankingsOptIn, hasRankingsAccess, toggleRankingsOptIn, loading };
}
