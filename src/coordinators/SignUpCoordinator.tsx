import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useSignUpViewModel } from '@/viewModels/useSignUpViewModel';
import { SignUpView } from '@/views/SignUpView';

export default function SignUpCoordinator() {
    console.log('SignUpCoordinator rendered');

  const viewModel = useSignUpViewModel();
  async function submit() {
    if (!(await viewModel.submit())) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/dashboard');
  }
  return <SignUpView {...viewModel} onNameChange={viewModel.setName} onEmailChange={viewModel.setEmail} onPasswordChange={viewModel.setPassword} onSubmit={() => void submit()} onBack={() => router.back()} />;
}