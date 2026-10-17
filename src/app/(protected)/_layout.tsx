import { Redirect, Stack } from 'expo-router';

import { COLORS } from '@/theme';
import { useTravelmateStore } from '@/state/TravelmateStore';

export default function ProtectedLayout() {
  const { session } = useTravelmateStore();
  if (!session) return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.cream } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="journey-planner" />
      <Stack.Screen name="journey-status" />
      <Stack.Screen name="assistance" />
      <Stack.Screen name="manage-account" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="refer-friend" />
      <Stack.Screen name="help" />
      <Stack.Screen name="contact-us" />
      <Stack.Screen name="ticket-scanner" options={{ presentation: 'modal' }}/>
      <Stack.Screen name="feedback" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
