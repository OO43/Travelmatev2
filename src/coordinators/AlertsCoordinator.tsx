import { router } from 'expo-router';
import { useAlertsViewModel } from '@/viewModels/useAlertsViewModel';
import { AlertsView } from '@/views/AlertsView';
export default function AlertsCoordinator() {
  return <AlertsView {...useAlertsViewModel()} onFeedback={() => router.push('/feedback')} />;
}
