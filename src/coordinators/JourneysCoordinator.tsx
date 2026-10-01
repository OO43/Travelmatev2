import { router } from 'expo-router';

import { useJourneysViewModel } from '@/viewModels/useJourneysViewModel';
import { JourneysView } from '@/views/JourneysView';

export default function JourneysCoordinator() {
  const viewModel = useJourneysViewModel();
  return (
    <JourneysView
      {...viewModel}
      onPlanJourney={() => router.push({ pathname: '/journey-planner', params: { mode: 'bus' } })}
      onOpenJourney={() => router.push('/journey-status')}
      onScanTicket={() => router.push('/ticket-scanner')}
    />
  );
}

