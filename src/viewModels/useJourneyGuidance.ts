import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import type { Journey } from '@/models/journey';
import { buildJourneyReminders, pendingJourneyReminders, readyJourneyReminders } from '@/services/journeyGuidance';

export function useJourneyGuidance(journey: Journey, confirmed: boolean, vibrate: boolean) {
  const reminders = useMemo(() => buildJourneyReminders(journey), [journey]);
  const [enabled, setEnabled] = useState(false);
  const [now, setNow] = useState(Date.now);
  const delivered = useRef(new Set<string>());

  useFocusEffect(useCallback(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function update() {
      clearTimeout(timer);
      const time = Date.now();
      setNow(time);
      if (AppState.currentState !== 'active') return;

      const pending = pendingJourneyReminders(reminders, time);
      if (confirmed && enabled) {
        const due = readyJourneyReminders(reminders, time, delivered.current);
        for (const reminder of due) delivered.current.add(reminder.id);
        if (due.length && Platform.OS !== 'web') {
          if (vibrate) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          if (Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility('Timetable reminder. ' +
              due.map(reminder => reminder.title + '. ' + reminder.detail).join(' '));
          }
        }
      }
      if (pending.length) {
        const nextChange = Math.min(...pending.map(reminder =>
          time < reminder.opensAt ? reminder.opensAt : reminder.scheduledAt));
        timer = setTimeout(update, Math.max(1, Math.min(60_000, nextChange - time)));
      }
    }

    update();
    const subscription = AppState.addEventListener('change', update);
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [confirmed, enabled, reminders, vibrate]));

  const pending = pendingJourneyReminders(reminders, now);
  return {
    enabled,
    toggle: () => setEnabled(value => !value),
    pending,
    now,
  };
}
