import { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  AccessibilityInfo, Keyboard, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { COLORS } from '@/theme';

type Step = 'date' | 'time';
type Props = {
  date: string; time: string; disabled?: boolean;
  onDateChange: (value: string) => void; onTimeChange: (value: string) => void;
};

const fullDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const monthTitle = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const weekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const asDate = (value: string) => new Date(value + 'T12:00:00Z');
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
function shiftMonth(value: string, count: number) {
  const date = asDate(value);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + count);
  return dateKey(date);
}
function addDays(value: string, count: number) {
  const date = asDate(value);
  date.setUTCDate(date.getUTCDate() + count);
  return dateKey(date);
}
function monthCells(month: string) {
  const start = (asDate(month).getUTCDay() + 6) % 7;
  const count = asDate(addDays(shiftMonth(month, 1), -1)).getUTCDate();
  return Array.from({ length: Math.ceil((start + count) / 7) * 7 }, (_, i) =>
    i < start || i >= start + count ? null : addDays(month, i - start));
}

const TIME_ROW_HEIGHT = 52;
const VISIBLE_TIME_ROWS = 4;

function TimeColumn({ label, limit, value, onChange }: {
  label: string; limit: number; value: string; onChange: (value: string) => void;
}) {
  const selected = value === '' ? -1 : Number(value);
  const [initialOffset] = useState(() =>
    Math.max(0, Math.min(limit - VISIBLE_TIME_ROWS, selected - 1)) * TIME_ROW_HEIGHT);
  return <View style={styles.grow}>
    <Text style={styles.label}>{label}</Text>
    <ScrollView style={styles.timeOptions} contentOffset={{ x: 0, y: initialOffset }}
      nestedScrollEnabled keyboardShouldPersistTaps="handled">
      {Array.from({ length: limit }, (_, index) => {
        const option = String(index).padStart(2, '0');
        const active = index === selected;
        return <Pressable key={option} accessibilityRole="radio"
          accessibilityLabel={label + ': ' + option}
          accessibilityState={{ checked: active }}
          onPress={() => onChange(option)} style={[styles.timeOption, active && styles.selected]}>
          <Text style={[styles.day, active && styles.selectedText]}>{option}</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

export function JourneyDeparturePicker({ date, time, disabled = false, onDateChange, onTimeChange }: Props) {
  const [firstDate] = useState(date);
  const lastDate = addDays(firstDate, 89);
  const [step, setStep] = useState<Step | null>(null);
  const [month, setMonth] = useState(() => shiftMonth(date, 0));
  const [draftDate, setDraftDate] = useState(date);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [error, setError] = useState('');
  const [timeMode, setTimeMode] = useState<'scroll' | 'type'>('scroll');
  const heading = useRef<View>(null);

  function focusHeading() {
    if (Platform.OS !== 'web' && heading.current) {
      AccessibilityInfo.sendAccessibilityEvent(heading.current, 'focus');
    }
  }

  useEffect(() => {
    if (!step || Platform.OS === 'web') return;
    const frame = requestAnimationFrame(() => {
      if (heading.current) AccessibilityInfo.sendAccessibilityEvent(heading.current, 'focus');
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);

  function open(next: Step) {
    const [h, m] = time.split(':');
    setTimeMode('scroll');
    setDraftDate(date);
    setMonth(shiftMonth(date, 0));
    setHour(h ?? '');
    setMinute(m ?? '');
    setError('');
    setStep(next);
  }

  function showCalendar() {
    Keyboard.dismiss();
    setMonth(shiftMonth(draftDate, 0));
    setStep('date');
  }

  function close() {
    Keyboard.dismiss();
    setStep(null);
  }

  function save() {
    if (!/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute) || Number(hour) > 23 || Number(minute) > 59) {
      setError('Enter an hour from 0 to 23 and minutes from 0 to 59.');
      return;
    }
    const nextTime = hour.padStart(2, '0') + ':' + minute.padStart(2, '0');
    if (draftDate !== date) onDateChange(draftDate);
    if (nextTime !== time) onTimeChange(nextTime);
    close();
  }

  const selectedDate = fullDate.format(asDate(draftDate));
  const canGoBack = month > shiftMonth(firstDate, 0);
  const canGoForward = month < shiftMonth(lastDate, 0);

  return <>
    <Text style={styles.label}>Date</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Departure date: ${fullDate.format(asDate(date))}`}
      accessibilityState={{ disabled, expanded: step === 'date' }} disabled={disabled} onPress={() => open('date')} style={styles.field}>
      <Text style={styles.value}>{fullDate.format(asDate(date))}</Text>
      <Ionicons name="calendar-outline" size={22} color={COLORS.forest} />
    </Pressable>
    <Text style={styles.label}>Leave at</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Leave at ${time}`}
      accessibilityState={{ disabled, expanded: step === 'time' }} disabled={disabled} onPress={() => open('time')} style={styles.field}>
      <Text style={styles.value}>{time}</Text><Ionicons name="time-outline" size={22} color={COLORS.forest} />
    </Pressable>
    <Modal visible={step !== null} animationType="slide" transparent onShow={focusHeading}
      onRequestClose={step === 'time' ? showCalendar : close}>
      <SafeAreaProvider>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView accessibilityViewIsModal style={styles.sheet} edges={['bottom', 'left', 'right']}>
            <View style={styles.header}>
              <View key={step} ref={heading} accessible accessibilityRole="header" style={styles.grow}>
                <Text style={styles.heading}>{step === 'date' ? 'Choose a date' : 'Choose when to leave'}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={close} style={styles.action}>
                <Text style={styles.link}>Cancel</Text>
              </Pressable>
            </View>
            {step === 'time' && <Pressable accessibilityRole="button"
              accessibilityLabel={`${selectedDate}. Change departure date`}
              onPress={showCalendar} style={[styles.field, styles.changeDate]}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.forest} />
              <View style={styles.grow}><Text style={styles.value}>{selectedDate}</Text>
                <Text style={styles.link}>Change date</Text></View>
            </Pressable>}
            <ScrollView key={step} style={styles.scroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {step === 'date' ? <>
                <View style={styles.monthHeader}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Previous month"
                    accessibilityState={{ disabled: !canGoBack }} disabled={!canGoBack}
                    onPress={() => setMonth(shiftMonth(month, -1))} style={[styles.action, !canGoBack && styles.inactive]}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.forest} />
                  </Pressable>
                  <Text accessibilityLiveRegion="polite" style={styles.month}>{monthTitle.format(asDate(month))}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Next month"
                    accessibilityState={{ disabled: !canGoForward }} disabled={!canGoForward}
                    onPress={() => setMonth(shiftMonth(month, 1))} style={[styles.action, !canGoForward && styles.inactive]}>
                    <Ionicons name="chevron-forward" size={22} color={COLORS.forest} />
                  </Pressable>
                </View>
                <View style={styles.grid} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                  {weekdayLabels.map(label => <Text key={label} style={styles.weekday}>{label}</Text>)}
                </View>
                <View style={styles.grid}>{monthCells(month).map((day, index) => {
                  if (!day) return <View key={`blank-${index}`} style={styles.cell} />;
                  const selected = day === draftDate;
                  const unavailable = day < firstDate || day > lastDate;
                  return <Pressable key={day} accessibilityRole="button" accessibilityLabel={fullDate.format(asDate(day))}
                    accessibilityState={{ selected, disabled: unavailable }} disabled={unavailable}
                    onPress={() => { setDraftDate(day); setStep('time'); }}
                    style={[styles.cell, selected && styles.selected, unavailable && styles.inactive]}>
                    <Text style={[styles.day, selected && styles.selectedText]}>{asDate(day).getUTCDate()}</Text>
                  </Pressable>;
                })}</View>
              </> : <View style={styles.timeBody}>
                <Text style={styles.label}>Departure time · UK time, 24-hour clock</Text>
                <Text accessibilityLiveRegion="polite" style={styles.value}>
                  Selected time: {/^[0-9]{1,2}$/.test(hour) && Number(hour) <= 23 && /^[0-9]{1,2}$/.test(minute) && Number(minute) <= 59
                    ? hour.padStart(2, '0') + ':' + minute.padStart(2, '0') : 'Incomplete'}
                </Text>
                <Pressable accessibilityRole="button" style={styles.modeButton} onPress={() => {
                  Keyboard.dismiss();
                  setTimeMode(timeMode === 'scroll' ? 'type' : 'scroll');
                }}>
                  <Text style={styles.link}>{timeMode === 'scroll' ? 'Type time instead' : 'Scroll to pick time'}</Text>
                </Pressable>
                {timeMode === 'scroll' ? <>
                  <Text style={styles.label}>Scroll, then tap an hour and minute.</Text>
                  <View style={styles.timeRow}>
                    <TimeColumn label="Hour" limit={24} value={hour}
                      onChange={value => { setHour(value); setError(''); }} />
                    <TimeColumn label="Minutes" limit={60} value={minute}
                      onChange={value => { setMinute(value); setError(''); }} />
                  </View>
                </> : <View style={styles.timeRow}>
                  <View style={styles.grow}><Text style={styles.label}>Hour</Text>
                    <TextInput accessibilityLabel="Departure hour, 0 to 23" inputMode="numeric" maxLength={2}
                      value={hour} onChangeText={value => { setHour(value.replace(/\D/g, '')); setError(''); }} style={styles.input} /></View>
                  <View style={styles.grow}><Text style={styles.label}>Minutes</Text>
                    <TextInput accessibilityLabel="Departure minutes, 0 to 59" inputMode="numeric" maxLength={2}
                      value={minute} onChangeText={value => { setMinute(value.replace(/\D/g, '')); setError(''); }} style={styles.input} /></View>
                </View>}
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                <PrimaryButton label="Done" icon="checkmark" onPress={save} />
              </View>}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  label: { color: COLORS.ink, fontWeight: '700', fontSize: 14 },
  field: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12 },
  value: { flexShrink: 1, flexGrow: 1, color: COLORS.ink, fontSize: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', paddingTop: 12, paddingBottom: 12, paddingHorizontal: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 10 },
  heading: { fontSize: 21, fontWeight: '800', color: COLORS.ink },
  action: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  link: { color: COLORS.forest, fontWeight: '700', fontSize: 14 },
  changeDate: { marginHorizontal: 10, marginTop: 8 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  month: { flex: 1, textAlign: 'center', color: COLORS.ink, fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', color: COLORS.inkSoft, paddingVertical: 6 },
  cell: { width: '14.2857%', minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  selected: { backgroundColor: COLORS.forest },
  day: { color: COLORS.ink, fontSize: 16, fontWeight: '600' },
  selectedText: { color: COLORS.white, fontWeight: '800' },
  inactive: { opacity: 0.45 },
  timeBody: { margin: 10, gap: 12 },
  timeRow: { flexDirection: 'row', gap: 12 },
  modeButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  timeOptions: { height: VISIBLE_TIME_ROWS * TIME_ROW_HEIGHT, marginTop: 6,
    borderColor: COLORS.line, borderWidth: 1, borderRadius: 10 },
  timeOption: { height: TIME_ROW_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  input: { minHeight: 48, padding: 10, marginTop: 6, borderColor: COLORS.line,
    borderWidth: 1, borderRadius: 10, color: COLORS.ink, fontSize: 18 },
  error: { color: COLORS.error },
});
