import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={COLORS.inkSoft} style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { color: COLORS.ink, fontWeight: '800', fontSize: 13 },
  input: { minHeight: 52, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: SPACING.md, color: COLORS.ink, backgroundColor: COLORS.surface, ...TYPOGRAPHY.button, fontWeight: '400' },
});
