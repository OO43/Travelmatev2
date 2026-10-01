import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useProfileViewModel } from '@/viewModels/useProfileViewModel';
import { ProfileView } from '@/views/ProfileView';
import { useTravelmateStore } from '@/state/TravelmateStore';

export default function ProfileCoordinator() {
  const viewModel = useProfileViewModel();
  const { setSession } = useTravelmateStore();
  return <ProfileView {...viewModel} onUpdate={viewModel.update} onToggleAccessibility={viewModel.toggleAccessibility} onSave={() => { viewModel.save(); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }} onLogout={() => { setSession(null); router.replace('/welcome'); }} />;
}
