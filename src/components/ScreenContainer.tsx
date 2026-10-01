import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '@/theme';

export function ScreenContainer({ children, header }: PropsWithChildren<{ header?: ReactNode }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {header}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.cream },
  content: { flexGrow: 1, paddingBottom: 48 },
  inner: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, gap: SPACING.lg },
});
