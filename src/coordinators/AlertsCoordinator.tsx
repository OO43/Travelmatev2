import { router } from 'expo-router';

import { useAlertsViewModel } from '@/viewModels/useAlertsViewModel';
import { AlertsView } from '@/views/AlertsView';

export default function AlertsCoordinator() {
  const viewModel = useAlertsViewModel();
  return <AlertsView {...viewModel} onOpenJourney={() => router.push('/journey-status')} onEditPreferences={() => router.navigate('/profile')} />;
}
