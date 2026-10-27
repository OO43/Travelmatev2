import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Journey } from '@/models/journey';
import type { LiveUpdates, LiveUpdatesRequest } from '@/models/liveUpdates';
import { getLiveUpdates, liveRequestForJourney, mergeLiveUpdates } from '@/services/liveUpdatesService';

type Result = { key: string; data: LiveUpdates | null; error: string | null; refreshing: boolean };
export function useJourneyLiveUpdates(journey: Journey) {
  const request = liveRequestForJourney(journey);
  const requestJson = request ? JSON.stringify(request) : null;
  const key = journey.id + ':' + requestJson;
  const [result, setResult] = useState<Result | null>(null);
  const [now, setNow] = useState(Date.now);
  const runner = useRef<(() => void) | null>(null);

  useFocusEffect(useCallback(() => {
    if (!requestJson) return;
    let active = true; let controller: AbortController | null = null;
    async function load() {
      if (!active || controller || AppState.currentState !== 'active') return;
      const aborter = new AbortController(); controller = aborter;
      setNow(Date.now());
      setResult(current => ({ key, data: current?.key === key ? current.data : null,
        error: current?.key === key ? current.error : null, refreshing: true }));
      try {
        const data = await getLiveUpdates(JSON.parse(requestJson!) as LiveUpdatesRequest, aborter.signal);
        if (!active || aborter.signal.aborted) return;
        setResult(current => ({ key, data: mergeLiveUpdates(current?.key === key ? current.data : null, data), error: null, refreshing: false }));
      } catch (error) {
        if (!active || aborter.signal.aborted) return;
        setResult(current => ({ key, data: current?.key === key ? current.data : null,
          error: error instanceof Error ? error.message : 'Live updates are unavailable.', refreshing: false }));
      } finally {
        if (controller === aborter) {
          controller = null;
          if (active) { setNow(Date.now()); setResult(current => current?.key === key ? { ...current, refreshing: false } : current); }
        }
      }
    }
    runner.current = () => { void load(); };
    const initial = setTimeout(() => { void load(); }, 0);
    const poll = setInterval(() => { void load(); }, 60000);
    const clock = setInterval(() => { if (AppState.currentState === 'active') setNow(Date.now()); }, 15000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') { setNow(Date.now()); void load(); }
      else { controller?.abort(); controller = null; setNow(Date.now()); setResult(current => current?.key === key ? { ...current, refreshing: false } : current); }
    });
    return () => { active = false; runner.current = null; controller?.abort();
      clearTimeout(initial); clearInterval(poll); clearInterval(clock); subscription.remove(); };
  }, [requestJson, key]));

  const current = result?.key === key ? result : null;
  return { enabled: Boolean(request), data: current?.data ?? null, error: current?.error ?? null,
    isRefreshing: current?.refreshing ?? Boolean(request), now, refresh: () => runner.current?.() };
}
