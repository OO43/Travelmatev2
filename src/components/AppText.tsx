import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTravelmateStore } from '@/state/TravelmateStore';
import { COLORS } from '@/theme';

export function AppText({ style, ...props }: TextProps) {
  const { profile } = useTravelmateStore();
  const flat = StyleSheet.flatten(style) ?? {};
  const scale = profile.assistancePreferences.largeText ? 1.25 : 1;
  const contrast = profile.assistancePreferences.highContrast && flat.color === COLORS.inkSoft;
  return <Text {...props} style={[style, {
    fontSize: (flat.fontSize ?? 14) * scale,
    ...(flat.lineHeight ? { lineHeight: flat.lineHeight * scale } : {}),
    ...(contrast ? { color: COLORS.ink } : {}),
  }]} />;
}
