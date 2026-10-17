import { router } from 'expo-router';
import { HelpView } from '@/views/HelpView';
export default function HelpCoordinator() {
  return <HelpView onBack={() => router.back()} onContact={() => router.push('/contact-us')} />;
}
