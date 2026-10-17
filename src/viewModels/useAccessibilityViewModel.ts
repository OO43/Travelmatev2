import { useState } from 'react';
import type { PassengerProfile } from '@/models/passenger';
import { useTravelmateStore } from '@/state/TravelmateStore';
export function useAccessibilityViewModel() {
  const { profile, setProfile } = useTravelmateStore();
  const [saved, setSaved] = useState(false);
  function updatePreference(key: keyof PassengerProfile['assistancePreferences'], value: boolean) {
    setProfile({ ...profile, assistancePreferences: { ...profile.assistancePreferences, [key]: value } });
    setSaved(true);
  }
  function updateConsent<K extends 'sharingPreference' | 'personalisedSuggestions' | 'enhancedSupervision'>(key: K, value: PassengerProfile[K]) {
    setProfile({ ...profile, [key]: value }); setSaved(true);
  }
  return { profile, saved, updatePreference, updateConsent };
}

