import { useRef, useState } from 'react';
import type { PassengerProfile } from '@/models/passenger';
import { savePassengerProfile } from '@/services/passengerProfileService';
import { useTravelmateStore } from '@/state/TravelmateStore';
export function useAccessibilityViewModel() {
  const { profile, setProfile, replaceProfile } = useTravelmateStore();
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const saveVersion = useRef(0);
  const saveQueue = useRef<Promise<PassengerProfile | void>>(Promise.resolve());

  function persist(nextProfile: PassengerProfile) {
    const version = ++saveVersion.current;
    setProfile(nextProfile);
    setSaved(false);
    setSyncing(true);
    setError('');
    const request = saveQueue.current.then(() => savePassengerProfile(nextProfile));
    saveQueue.current = request.catch(() => undefined);
    void request.then(remoteProfile => {
      if (version === saveVersion.current) {
        replaceProfile(remoteProfile);
        setSaved(true);
        setSyncing(false);
      }
    }).catch(saveError => {
      if (version === saveVersion.current) {
        setError(saveError instanceof Error
          ? `Saved on this device, but could not sync: ${saveError.message}`
          : 'Saved on this device, but could not sync with TravelMate.');
        setSyncing(false);
      }
    });
  }
  function updatePreference(key: keyof PassengerProfile['assistancePreferences'], value: boolean) {
    persist({ ...profile, assistancePreferences: { ...profile.assistancePreferences, [key]: value } });
  }
  function updateConsent<K extends 'sharingPreference' | 'personalisedSuggestions' | 'enhancedSupervision'>(key: K, value: PassengerProfile[K]) {
    persist({ ...profile, [key]: value });
  }
  return { profile, saved, syncing, error, updatePreference, updateConsent };
}

