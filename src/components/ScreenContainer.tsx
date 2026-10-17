import type { PropsWithChildren, ReactNode } from 'react';
import { useSegments } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '@/theme';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function ScreenContainer({ children, header, backgroundColor }: PropsWithChildren<{ header?: ReactNode; backgroundColor?: string }>) {
  const { profile } = useTravelmateStore();
  const segments = useSegments();
  const isTabScreen = segments.some(segment => segment === '(tabs)');
  return (
    <SafeAreaView style={[styles.safeArea, backgroundColor ? { backgroundColor } : {}, profile.assistancePreferences.highContrast && { backgroundColor: COLORS.white }]} edges={isTabScreen ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}>
      {header}
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 48 },
  inner: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, gap: SPACING.lg },
});
