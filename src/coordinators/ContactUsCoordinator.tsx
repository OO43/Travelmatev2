import { router } from 'expo-router';
import { ContactUsView } from '@/views/ContactUsView';
export default function ContactUsCoordinator() {
  return <ContactUsView onBack={() => router.back()} />;
}
