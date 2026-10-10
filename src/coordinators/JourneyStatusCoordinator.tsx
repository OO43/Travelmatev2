import { router, useLocalSearchParams } from 'expo-router';

import { useTravelmateStore } from '@/state/TravelmateStore';
import { useJourneyStatusViewModel } from '@/viewModels/useJourneyStatusViewModel';
import { JourneyStatusView } from '@/views/JourneyStatusView';

export default function JourneyStatusCoordinator() {
  const params = useLocalSearchParams<{
    sessionId?: string | string[];
  }>();

  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;

  const { currentJourney } = useTravelmateStore();
  const viewModel = useJourneyStatusViewModel(sessionId);

  return (
    <JourneyStatusView
      journey={currentJourney}
      journeySession={viewModel.journeySession}
      isLoading={viewModel.isLoading}
      errorMessage={viewModel.errorMessage}
      hasSessionId={Boolean(sessionId)}
      onRetry={viewModel.retry}
      onBack={() => router.back()}
      onFeedback={() => router.push('/feedback')}
      onPlanAnother={() =>
        router.replace({
          pathname: '/journey-planner',
          params: { mode: 'bus' },
        })
      }
    />
  );
}