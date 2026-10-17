import { router } from 'expo-router';
import { AssistanceView } from '@/views/AssistanceView';
export default function AssistanceCoordinator() {
  return <AssistanceView onBack={() => router.back()} onSupport={() => router.push('/settings')} onHelp={() => router.push('/help')} />;
}
