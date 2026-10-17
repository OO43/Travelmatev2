import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';

import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export function AppHeader({ title, subtitle, onBack, onProfile, onAlerts, unreadCount = 0 }: { title: string; subtitle?: string; onBack?: () => void; onProfile?: () => void; onAlerts?: () => void; unreadCount?: number }) {
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
      {onAlerts ? <Pressable accessibilityRole="button" accessibilityLabel={`Open alerts, ${unreadCount} unread`} onPress={onAlerts} style={styles.avatar}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.forest} />
        {unreadCount ? <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View> : null}
      </Pressable> : null}
      {onProfile ? (
        <Pressable accessibilityLabel="Open account" onPress={onProfile} style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.forest} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: -4, right: -4, borderRadius: 10, backgroundColor: COLORS.error, minWidth: 20, padding: 3, alignItems: 'center' },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.cream, flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  title: { color: COLORS.ink, ...TYPOGRAPHY.screenTitle },
  subtitle: { color: COLORS.inkSoft, ...TYPOGRAPHY.bodySmall, marginTop: 2 },
  roundButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.forestSoft },
});
