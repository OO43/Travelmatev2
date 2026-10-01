import { useState } from 'react';

import { login } from '@/services/authService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useLoginViewModel() {
  const { setSession } = useTravelmateStore();
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
