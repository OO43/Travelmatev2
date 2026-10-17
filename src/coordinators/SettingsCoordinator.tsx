import { router } from 'expo-router';
import { AccessibilityView } from '@/views/AccessibilityView';
import { useAccessibilityViewModel } from '@/viewModels/useAccessibilityViewModel';

export default function SettingsCoordinator() {
  return <AccessibilityView {...useAccessibilityViewModel()} title="Settings" onBack={() => router.back()} />;
}
