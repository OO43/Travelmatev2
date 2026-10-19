import { router } from 'expo-router';
import { useProfileViewModel } from '@/viewModels/useProfileViewModel';
import { ManageAccountView } from '@/views/ManageAccountView';

export default function ManageAccountCoordinator() {
  const viewModel = useProfileViewModel();
  return <ManageAccountView {...viewModel} onUpdate={viewModel.update}
    onToggleAccessibility={viewModel.toggleAccessibility} onSave={() => { void viewModel.save(); }}
    onBack={() => router.back()} />;
}
