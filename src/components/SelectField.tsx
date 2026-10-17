import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText as Text } from './AppText';
import { COLORS, RADIUS, SPACING } from '@/theme';

export function SelectField({ label, value, options, onChange, icon = 'chevron-down', disabled = false, bottomSheet = true }: {
  bottomSheet?: boolean;
  disabled?: boolean;
  icon?: 'chevron-down' | 'calendar-outline' | 'time-outline';
  label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${options.find(o => o.value === value)?.label ?? value}`}
      accessibilityState={{ expanded: open, disabled }} disabled={disabled} onPress={() => setOpen(true)} style={styles.trigger}>
      <Text style={styles.value}>{options.find(o => o.value === value)?.label ?? value}</Text>
      <Ionicons name={icon} size={20} color={COLORS.forest} />
    </Pressable>
    <Modal visible={open} animationType="slide" transparent={bottomSheet} onRequestClose={() => setOpen(false)}>
      <View style={bottomSheet ? styles.overlay : styles.fullScreen}>
      {bottomSheet ? <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button"
        accessibilityLabel={`Close ${label} options`} onPress={() => setOpen(false)} /> : null}
      <SafeAreaView edges={bottomSheet ? ['bottom', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
        accessibilityViewIsModal style={bottomSheet ? styles.dropdown : styles.modal}>
        {bottomSheet ? <View style={styles.handle} /> : null}
        <Text accessibilityRole="header" style={styles.heading}>{label}</Text>
        <ScrollView style={bottomSheet ? styles.sheetOptions : undefined}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio"
          accessibilityState={{ selected: option.value === value }} style={styles.trigger}
          onPress={() => { onChange(option.value); setOpen(false); }}>
          <Text style={styles.value}>{option.label}</Text>
          {option.value === value ? <Ionicons name="checkmark" size={22} color={COLORS.forest} /> : null}
        </Pressable>)}</ScrollView>
      </SafeAreaView>
      </View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  wrap: { gap: 8 }, label: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  trigger: {  borderWidth: 3, borderColor: COLORS.cream, borderRadius: RADIUS.sm, borderBottomColor: COLORS.forestLight, borderRadius: RADIUS.s,
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, minHeight: 15 },
  value: { color: COLORS.ink, fontSize: 16, flex: 1 },
  modal: { flex: 1, padding: SPACING.lg, backgroundColor: COLORS.cream },
  fullScreen: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  dropdown: { backgroundColor: COLORS.cream, borderRadius: RADIUS.md, maxHeight: 400, padding: SPACING.md,  },
  sheet: { padding: SPACING.lg, backgroundColor: 'rgb(255, 254, 254)', borderTopLeftRadius: 28,
    borderTopRightRadius: 28, maxHeight: '80%', },
  sheetOptions: { flexGrow: 0, flexShrink: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.line, alignSelf: 'center' },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.ink, marginVertical: 20 },
});
