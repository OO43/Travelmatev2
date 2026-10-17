import { router } from 'expo-router';
import { useJourneysViewModel } from '@/viewModels/useJourneysViewModel';
import { useTravelmateStore } from '@/state/TravelmateStore';
import type { SavedJourney } from '@/models/iteration';
import { JourneysView } from '@/views/JourneysView';
export default function JourneysCoordinator() {
  const viewModel = useJourneysViewModel();
  const { setCurrentJourney } = useTravelmateStore();
  function openJourney(item: SavedJourney) {
    setCurrentJourney(item.journey);
    router.push({ pathname: '/journey-status', params: item.sessionId ? { sessionId: item.sessionId } : {} });
  }
  return <JourneysView {...viewModel} onOpenJourney={openJourney}
    onPlanJourney={(destination = '') => router.push({ pathname: '/journey-planner', params: { mode: 'bus', destination } })}
    onScanTicket={() => router.push('/ticket-scanner')} />;
}

