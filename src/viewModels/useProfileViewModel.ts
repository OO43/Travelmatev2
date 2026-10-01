import { useState } from 'react';

import type { PassengerProfile } from '@/models/passenger';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useProfileViewModel() {
  const { profile, setProfile } = useTravelmateStore();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof PassengerProfile>(key: K, value: PassengerProfile[K]) {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleAccessibility(key: keyof PassengerProfile['accessibilityNeeds']) {
    setSaved(false);
    setDraft((current) => ({
      ...current,
      accessibilityNeeds: { ...current.accessibilityNeeds, [key]: !current.accessibilityNeeds[key] },
    }));
  }

  function save() {
    setProfile(draft);
    setSaved(true);
  }

  return { draft, saved, update, toggleAccessibility, save };
}
