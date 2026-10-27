import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { AppText as Text } from '@/components/AppText';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-forward',
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  foregroundColor,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'coral';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  foregroundColor?: string;
}) {
  const foreground = foregroundColor ?? (variant === 'secondary' ? COLORS.forest : COLORS.white);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'coral' && styles.coral,
        style,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} /> : <Ionicons name={icon} size={19} color={foreground} />}
      <Text style={[styles.label, { color: foreground }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  secondary: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.forest },
  coral: { backgroundColor: COLORS.coral },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  label: { color: COLORS.white, ...TYPOGRAPHY.button },
  secondaryLabel: { color: COLORS.forest },
});
