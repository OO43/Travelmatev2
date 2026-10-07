import { router, useLocalSearchParams } from 'expo-router';

import type { TransportMode } from '@/models/journey';
import { useJourneyPlannerViewModel } from '@/viewModels/useJourneyPlannerViewModel';
import { JourneyPlannerView } from '@/views/JourneyPlannerView';

const supportedModes: TransportMode[] = ['bus', 'train', 'flight', 'car'];

export default function JourneyPlannerCoordinator() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: TransportMode = supportedModes.includes(params.mode as TransportMode) ? params.mode as TransportMode : 'bus';
  const viewModel = useJourneyPlannerViewModel(mode);

async function handleContinue() {
    const journeySession = await viewModel.confirmJourney();

    if (!journeySession) {
      return;
    }

    router.push({
      pathname: '/journey-status',
      params: {
        sessionId: journeySession.session_id,
      },
    });
  }

  return <JourneyPlannerView {...viewModel} 
  onOriginChange={viewModel.setOrigin} 
  onDestinationChange={viewModel.setDestination} 
  onFind={() => void viewModel.findJourney()} 
  onContinue={handleContinue} 
  onBack={() => router.back()} />;
}
