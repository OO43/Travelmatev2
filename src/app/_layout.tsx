import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from '@/theme';
import { TravelmateStoreProvider } from '@/state/TravelmateStore';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TravelmateStoreProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.cream } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(protected)" />
        </Stack>
        <StatusBar style="dark" />
      </TravelmateStoreProvider>
    </SafeAreaProvider>
  );
}
