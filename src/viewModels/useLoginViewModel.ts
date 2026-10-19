import { useState } from 'react';

import { login } from '@/services/authService';
import {
  getPassengerProfile,
  PassengerProfileApiError,
  savePassengerProfile,
} from '@/services/passengerProfileService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useLoginViewModel() {
  const { profile, setSession, replaceProfile } = useTravelmateStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!email.trim() || !password.trim()) {
      setError('Enter your email address and password.');
      return false;
    }

    try {
      setIsLoading(true);
      setError('');
      const result = await login({ email: email.trim(), password });
      if (!result.success) {
        setError(result.message);
        return false;
      }
      try {
        const remoteProfile = await getPassengerProfile(result.session.user.id);
        replaceProfile(remoteProfile);
      } catch (profileError) {
        if (profileError instanceof PassengerProfileApiError && profileError.status === 404) {
          const initialProfile = {
            ...profile,
            passengerId: result.session.user.id,
            preferredName: result.session.user.name,
            emailAddress: result.session.user.email,
          };
          replaceProfile(await savePassengerProfile(initialProfile));
        } else {
          // Authentication can continue with the AsyncStorage profile while offline.
          replaceProfile({ ...profile, passengerId: result.session.user.id });
        }
      }
      setSession(result.session);
      return true;
    } catch {
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { email, password, isLoading, error, setEmail, setPassword, submit };
}
