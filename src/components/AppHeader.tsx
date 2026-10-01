import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export function AppHeader({ title, subtitle, onBack, onProfile }: { title: string; subtitle?: string; onBack?: () => void; onProfile?: () => void }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable accessibilityLabel="Go back" onPress={onBack} style={styles.roundButton}>
          <Ionicons name="arrow-back" size={21} color={COLORS.ink} />
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onProfile ? (
        <Pressable accessibilityLabel="Open passenger profile" onPress={onProfile} style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.forest} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.cream, flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  title: { color: COLORS.ink, ...TYPOGRAPHY.screenTitle },
  subtitle: { color: COLORS.inkSoft, ...TYPOGRAPHY.bodySmall, marginTop: 2 },
  roundButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.forestSoft },
});
