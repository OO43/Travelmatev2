import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { useTravelmateStore } from '@/state/TravelmateStore';

import type { TransportMode } from '@/models/journey';
import { useJourneyPlannerViewModel } from '@/viewModels/useJourneyPlannerViewModel';
import { JourneyPlannerView } from '@/views/JourneyPlannerView';

const supportedModes: TransportMode[] = ['bus', 'train', 'flight', 'car'];

export default function JourneyPlannerCoordinator() {
  const params = useLocalSearchParams<{ mode?: string; destination?: string }>();
  const mode: TransportMode = supportedModes.includes(params.mode as TransportMode) ? params.mode as TransportMode : 'bus';
  const viewModel = useJourneyPlannerViewModel(mode, params.destination);
  const { profile } = useTravelmateStore();

async function performConfirmation() {
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

  function handleContinue() {
    if (profile.sharingPreference === 'needed' && viewModel.result?.useAccessibilityPreferences) {
      Alert.alert('Share support needs for this journey?',
        'Your selected support categories and consent settings will be saved by the journey-session API.',
        [{ text: 'Cancel', style: 'cancel' },
          { text: 'Confirm journey', onPress: () => { void performConfirmation(); } }]);
    } else void performConfirmation();
  }

  return <JourneyPlannerView {...viewModel} 
  onOriginChange={viewModel.setOrigin} 
  onDestinationChange={viewModel.setDestination} 
  onFind={() => void viewModel.findJourney()} 
  onContinue={handleContinue} 
  onDateChange={viewModel.setDepartureDate}
  onTimeChange={viewModel.setDepartureTime}
  onPreferencesChange={viewModel.setUseAccessibilityPreferences}
  onSelectRoute={viewModel.selectJourney}
  onModeChange={viewModel.setMode}
  onBack={() => router.back()} />;
}
