import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/theme';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>) {
  const { profile } = useTravelmateStore();
  return <View style={[styles.card, style, profile.assistancePreferences.highContrast && { borderColor: COLORS.ink, borderWidth: 2 }]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
});
