import { useEffect, useState } from 'react';

import type { JourneySession } from '@/models/journeySession';
import { getJourneySession } from '@/services/journeySessionService';

type SessionResult = {
  sessionId: string;
  attempt: number;
  session: JourneySession | null;
  errorMessage: string | null;
};

export function useJourneyStatusViewModel(sessionId?: string) {
  const [result, setResult] = useState<SessionResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;
    const requestedSessionId = sessionId;

    async function loadSession() {
      try {
        const session = await getJourneySession(requestedSessionId);

        if (!cancelled) {
          setResult({
            sessionId: requestedSessionId,
            attempt,
            session,
            errorMessage: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            sessionId: requestedSessionId,
            attempt,
            session: null,
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Unable to load your journey session.',
          });
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, attempt]);

  const currentResult =
    sessionId &&
    result?.sessionId === sessionId &&
    result.attempt === attempt
      ? result
      : null;

  function retry() {
    setAttempt((value) => value + 1);
  }

  return {
    journeySession: currentResult?.session ?? null,
    isLoading: Boolean(sessionId) && currentResult === null,
    errorMessage: currentResult?.errorMessage ?? null,
    retry,
  };
}