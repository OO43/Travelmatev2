import { router, useLocalSearchParams } from 'expo-router';

import type { TransportMode } from '@/models/journey';
import { useJourneyPlannerViewModel } from '@/viewModels/useJourneyPlannerViewModel';
import { JourneyPlannerView } from '@/views/JourneyPlannerView';

const supportedModes: TransportMode[] = ['bus', 'train', 'flight', 'car'];

export default function JourneyPlannerCoordinator() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: TransportMode = supportedModes.includes(params.mode as TransportMode) ? params.mode as TransportMode : 'bus';
  const viewModel = useJourneyPlannerViewModel(mode);
  return <JourneyPlannerView {...viewModel} onOriginChange={viewModel.setOrigin} onDestinationChange={viewModel.setDestination} onFind={() => void viewModel.findJourney()} onContinue={() => router.push('/journey-status')} onBack={() => router.back()} />;
}
