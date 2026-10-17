import { useState } from 'react';
import type { PassengerProfile } from '@/models/passenger';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useProfileViewModel() {
  const { profile, setProfile } = useTravelmateStore();
  const [edits, setEdits] = useState<Partial<PassengerProfile>>({});
  const [saved, setSaved] = useState(false);
  const draft = { ...profile, ...edits,
    accessibilityNeeds: { ...profile.accessibilityNeeds, ...edits.accessibilityNeeds } };
  function update<K extends keyof PassengerProfile>(key: K, value: PassengerProfile[K]) {
    setSaved(false);
    setEdits(current => ({ ...current, [key]: value }));
  }
  function toggleAccessibility(key: keyof PassengerProfile['accessibilityNeeds']) {
    update('accessibilityNeeds', { ...draft.accessibilityNeeds, [key]: !draft.accessibilityNeeds[key] });
  }
  function save() { setProfile(draft); setEdits({}); setSaved(true); }
  return { draft, saved, update, toggleAccessibility, save };
}
