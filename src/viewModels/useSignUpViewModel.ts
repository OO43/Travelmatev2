import { useState } from 'react';

import { signUp } from '@/services/authService';
import type { PassengerProfile } from '@/models/passenger';
import { savePassengerProfile } from '@/services/passengerProfileService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useSignUpViewModel() {
  const { setSession, replaceProfile } = useTravelmateStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Enter your name, email address and password.');
      return false;
    }

    try {
      setIsLoading(true);
      setError('');
      const result = await signUp({ name: name.trim(), email: email.trim(), password });
      if (!result.success) {
        setError(result.message);
        return false;
      }
      const nameParts = result.session.user.name.trim().split(/\s+/);
      const profile: PassengerProfile = {
        passengerId: result.session.user.id,
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' '),
        preferredName: nameParts[0] ?? result.session.user.name,
        phoneNumber: '',
        emailAddress: result.session.user.email,
        emergencyContact: '',
        preferredLanguage: 'English (UK)',
        homeLocation: '',
        communicationMethod: 'combined',
        sharingPreference: 'needed',
        personalisedSuggestions: true,
        enhancedSupervision: false,
        accessibilityNeeds: {
          visualImpairment: false,
          hearingImpairment: false,
          reducedMobility: false,
          wheelchairUser: false,
          cognitiveSupportRequired: false,
          assistanceAnimalSupport: false,
          temporaryAccessibilityNeed: false,
        },
        assistancePreferences: {
          audioGuidance: true,
          vibrationGuidance: true,
          boardingAssistance: false,
          alightingAssistance: false,
          extraBoardingTime: false,
          stopAnnouncements: true,
          largeText: false,
          highContrast: false,
          stepFreeRoutes: false,
          extraTransferTime: false,
          prioritySeating: false,
        },
      };
      const savedProfile = await savePassengerProfile(profile);
      replaceProfile(savedProfile);
      setSession(result.session);
      return true;
    } catch (submitError) {
      setError(submitError instanceof Error
        ? `Your account could not be completed: ${submitError.message}`
        : 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { name, email, password, isLoading, error, setName, setEmail, setPassword, submit };
}
