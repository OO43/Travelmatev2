import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { AppText as Text } from '@/components/AppText';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  const { profile } = useTravelmateStore();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={profile.assistancePreferences.highContrast ? COLORS.ink : COLORS.inkSoft} {...props}
        style={[styles.input, profile.assistancePreferences.largeText && { fontSize: 20 },
          profile.assistancePreferences.highContrast && { borderColor: COLORS.ink, borderWidth: 2 }, props.style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { color: COLORS.ink, fontWeight: '800', fontSize: 13 },
  input: { minHeight: 52, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: SPACING.md, color: COLORS.ink, backgroundColor: COLORS.surface, ...TYPOGRAPHY.button, fontWeight: '400' },
});
