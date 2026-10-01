import { router } from 'expo-router';

import { useTravelmateStore } from '@/state/TravelmateStore';
import { JourneyStatusView } from '@/views/JourneyStatusView';

export default function JourneyStatusCoordinator() {
  const { currentJourney } = useTravelmateStore();
  return <JourneyStatusView journey={currentJourney} onBack={() => router.back()} onFeedback={() => router.push('/feedback')} onPlanAnother={() => router.replace({ pathname: '/journey-planner', params: { mode: 'bus' } })} />;
}
