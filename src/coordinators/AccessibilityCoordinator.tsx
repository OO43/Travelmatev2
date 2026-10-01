import { router } from 'expo-router';

import { useAccessibilityViewModel } from '@/viewModels/useAccessibilityViewModel';
import { AccessibilityView } from '@/views/AccessibilityView';

export default function AccessibilityCoordinator() {
  const viewModel = useAccessibilityViewModel();
  return <AccessibilityView {...viewModel} onEditProfile={() => router.navigate('/profile')} />;
}

