import { Redirect } from 'expo-router';

import { useTravelmateStore } from '@/state/TravelmateStore';

export default function EntryRoute() {
  const { session } = useTravelmateStore();
  return <Redirect href={session ? '/dashboard' : '/welcome'} />;
}
