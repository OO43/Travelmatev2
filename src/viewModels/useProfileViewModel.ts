import { useEffect, useRef, useState } from 'react';
import type { PassengerProfile } from '@/models/passenger';
import {
  getPassengerProfile,
  PassengerProfileApiError,
  savePassengerProfile,
} from '@/services/passengerProfileService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useProfileViewModel() {
  const { profile, setProfile, replaceProfile } = useTravelmateStore();
  const [edits, setEdits] = useState<Partial<PassengerProfile>>({});
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const replaceProfileRef = useRef(replaceProfile);
  useEffect(() => { replaceProfileRef.current = replaceProfile; }, [replaceProfile]);
  const draft = { ...profile, ...edits,
    accessibilityNeeds: { ...profile.accessibilityNeeds, ...edits.accessibilityNeeds } };

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const remoteProfile = await getPassengerProfile(profile.passengerId);
        if (!cancelled) {
          replaceProfileRef.current(remoteProfile);
          setStatusMessage('Profile loaded from TravelMate.');
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof PassengerProfileApiError && loadError.status === 404) {
            setStatusMessage('No server profile exists yet. Save to create it.');
          } else {
            setError('Using the profile saved on this device. The server profile could not be loaded.');
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void loadProfile();
    return () => { cancelled = true; };
  }, [profile.passengerId]);

  function update<K extends keyof PassengerProfile>(key: K, value: PassengerProfile[K]) {
    setSaved(false);
    setError('');
    setStatusMessage('');
    setEdits(current => ({ ...current, [key]: value }));
  }
  function toggleAccessibility(key: keyof PassengerProfile['accessibilityNeeds']) {
    update('accessibilityNeeds', { ...draft.accessibilityNeeds, [key]: !draft.accessibilityNeeds[key] });
  }
  async function save() {
    if (isSaving) return false;
    setIsSaving(true);
    setSaved(false);
    setError('');
    setProfile(draft);
    try {
      const remoteProfile = await savePassengerProfile(draft);
      replaceProfile(remoteProfile);
      setEdits({});
      setSaved(true);
      setStatusMessage('');
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error
        ? `Saved on this device, but could not sync: ${saveError.message}`
        : 'Saved on this device, but could not sync with TravelMate.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }
  return { draft, saved, isLoading, isSaving, error, statusMessage,
    update, toggleAccessibility, save };
}
