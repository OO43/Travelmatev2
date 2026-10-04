import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useLoginViewModel } from '@/viewModels/useLoginViewModel';
import { LoginView } from '@/views/LoginView';

export default function LoginCoordinator() {
  const viewModel = useLoginViewModel();
  async function submit() {
    if (!(await viewModel.submit())) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/dashboard');
  }
  
  return (
  <LoginView
    {...viewModel}
    onEmailChange={viewModel.setEmail}
    onPasswordChange={viewModel.setPassword}
    onSubmit={() => void submit()}
    onBack={() => router.back()}
    onSignUp={() => {
      console.log('Opening sign-up');
      router.push('/sign-up');
    }}
  />
)};
