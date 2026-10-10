import { useEffect, useState } from 'react';

import type { JourneySession } from '@/models/journeySession';
import { getJourneySession } from '@/services/journeySessionService';

export function useJourneyStatusViewModel(sessionId?: string) {
  const [journeySession, setJourneySession] =
    useState<JourneySession | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sessionId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setJourneySession(null);
    setErrorMessage(null);

    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    async function loadSession() {
      try {
        const session = await getJourneySession(sessionId!);

        if (!cancelled) {
          setJourneySession(session);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load your journey session.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshCount]);

  function retry() {
    setRefreshCount((count) => count + 1);
  }

  return { journeySession, isLoading, errorMessage, retry };
}