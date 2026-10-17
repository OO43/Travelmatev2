import { router } from 'expo-router';
import { AssistanceView } from '@/views/AssistanceView';
export default function AccessibilityCoordinator() {
  return <AssistanceView onSupport={() => router.push('/settings')} onHelp={() => router.push('/help')} />;
}

