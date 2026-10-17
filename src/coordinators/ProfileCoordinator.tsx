import { router } from 'expo-router';
import { AccountView } from '@/views/AccountView';
import { useTravelmateStore } from '@/state/TravelmateStore';

export default function ProfileCoordinator() {
  const { profile, setSession } = useTravelmateStore();
  return <AccountView profile={profile}
    onManageAccount={() => router.push('/manage-account')}
    onSettings={() => router.push('/settings')}
    onReferFriend={() => router.push('/refer-friend')}
    onHelp={() => router.push('/help')}
    onLogout={() => { setSession(null); router.replace('/welcome'); }} />;
}
