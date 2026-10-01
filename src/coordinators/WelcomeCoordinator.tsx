import { router } from 'expo-router';

import { WelcomeView } from '@/views/WelcomeView';

export default function WelcomeCoordinator() {
  return <WelcomeView onLogin={() => router.push('/login')} />;
}
