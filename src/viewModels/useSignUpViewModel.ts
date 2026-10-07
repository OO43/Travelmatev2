import { useState } from 'react';

import { signUp } from '@/services/authService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useSignUpViewModel() {
  const { setSession } = useTravelmateStore();
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
      setSession(result.session);
      return true;
    } catch {
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { name, email, password, isLoading, error, setName, setEmail, setPassword, submit };
}
