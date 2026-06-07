import { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { WEIGHT_LOG_KEY } from '../constants/supplements';
import { toISO } from '../utils/dates';

function getTodayISO() {
  return toISO(new Date());
}

function formatDisplayDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ProgressScreen() {
  const [weightInput, setWeightInput] = useState('');
  const [log, setLog] = useState([]); // [{date, weight}] sorted desc
  const inputRef = useRef(null);
  const todayISO = getTodayISO();

  const loadLog = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(WEIGHT_LOG_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setLog(data);
      const todayEntry = data.find(e => e.date === todayISO);
      if (todayEntry) setWeightInput(String(todayEntry.weight));
      else setWeightInput('');
    } catch { /* ignore */ }
  }, [todayISO]);

  useFocusEffect(useCallback(() => { loadLog(); }, [loadLog]));

  const logWeight = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w < 30 || w > 250) {
      Alert.alert('Invalid weight', 'Enter a weight between 30–250 kg');
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(WEIGHT_LOG_KEY);
      let data = raw ? JSON.parse(raw) : [];
      // Replace or add today's entry
      data = data.filter(e => e.date !== todayISO);
      data.push({ date: todayISO, weight: w });
      data.sort((a, b) => b.date.localeCompare(a.date));
      await AsyncStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(data));
      setLog(data);
      inputRef.current?.blur();
    } catch { /* ignore */ }
  };

  const deleteEntry = (date) => {
    Alert.alert('Delete entry', `Remove log for ${formatDisplayDate(date)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const updated = log.filter(e => e.date !== date);
            await AsyncStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(updated));
            setLog(updated);
            if (date === todayISO) setWeightInput('');
          } catch { /* ignore */ }
        },
      },
    ]);
  };

  // Stats
  const todayEntry = log.find(e => e.date === todayISO);
  const lastEntry = log.find(e => e.date !== todayISO);
  const delta = todayEntry && lastEntry ? (todayEntry.weight - lastEntry.weight).toFixed(1) : null;
  const startEntry = log[log.length - 1];
  const totalDelta = todayEntry && startEntry && startEntry.date !== todayISO
    ? (todayEntry.weight - startEntry.weight).toFixed(1)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PROGRESS</Text>
            <Text style={styles.subtitle}>Body weight tracking</Text>
          </View>

          {/* Log today's weight */}
          <View style={styles.logCard}>
            <Text style={styles.logCardTitle}>TODAY'S WEIGHT</Text>
            <Text style={styles.logCardDate}>{formatDisplayDate(todayISO)}</Text>
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.weightInput}
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="81.0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={logWeight}
                selectTextOnFocus
              />
              <Text style={styles.weightUnit}>kg</Text>
              <TouchableOpacity style={styles.logBtn} onPress={logWeight}>
                <Text style={styles.logBtnText}>LOG</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats row */}
          {log.length > 0 && (
            <View style={styles.statsRow}>
              {/* Current */}
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>CURRENT</Text>
                <Text style={styles.statValue}>
                  {(todayEntry || log[0]).weight}
                  <Text style={styles.statUnit}> kg</Text>
                </Text>
              </View>

              {/* Change vs last */}
              {delta !== null && (
                <View style={[styles.statCard, styles.statCardAccent]}>
                  <Text style={styles.statLabel}>VS LAST</Text>
                  <Text style={[
                    styles.statValue,
                    { color: parseFloat(delta) < 0 ? colors.success : parseFloat(delta) > 0 ? colors.danger : colors.text }
                  ]}>
                    {parseFloat(delta) > 0 ? '+' : ''}{delta}
                    <Text style={styles.statUnit}> kg</Text>
                  </Text>
                </View>
              )}

              {/* Total change */}
              {totalDelta !== null && (
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>TOTAL</Text>
                  <Text style={[
                    styles.statValue,
                    { color: parseFloat(totalDelta) < 0 ? colors.success : parseFloat(totalDelta) > 0 ? colors.danger : colors.text }
                  ]}>
                    {parseFloat(totalDelta) > 0 ? '+' : ''}{totalDelta}
                    <Text style={styles.statUnit}> kg</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Weigh-in reminder */}
          <View style={styles.reminderCard}>
            <Text style={styles.reminderText}>
              Weigh yourself every Sunday morning, fasted, after bathroom — same conditions each week for accuracy.
            </Text>
          </View>

          {/* Log entries */}
          {log.length > 0 ? (
            <View style={styles.logSection}>
              <Text style={styles.sectionLabel}>WEIGHT LOG</Text>
              {log.map((entry, i) => {
                const prev = log[i + 1];
                const d = prev ? (entry.weight - prev.weight).toFixed(1) : null;
                const isToday = entry.date === todayISO;

                return (
                  <TouchableOpacity
                    key={entry.date}
                    style={[styles.logEntry, isToday && styles.logEntryToday]}
                    onLongPress={() => deleteEntry(entry.date)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={[styles.logDate, isToday && styles.logDateToday]}>
                        {isToday ? 'Today' : formatDisplayDate(entry.date)}
                      </Text>
                      {isToday && (
                        <Text style={styles.logDateSub}>{formatDisplayDate(entry.date)}</Text>
                      )}
                    </View>

                    <View style={styles.logRight}>
                      {d !== null && (
                        <Text style={[
                          styles.logDelta,
                          { color: parseFloat(d) < 0 ? colors.success : parseFloat(d) > 0 ? colors.danger : colors.textMuted }
                        ]}>
                          {parseFloat(d) > 0 ? '+' : ''}{d} kg
                        </Text>
                      )}
                      <Text style={[styles.logWeight, isToday && styles.logWeightToday]}>
                        {entry.weight} kg
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.longPressHint}>Long press an entry to delete</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No weight logs yet.</Text>
              <Text style={styles.emptySubText}>Log your first weigh-in above.</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 16 },

  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: 1.5 },
  subtitle: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 3 },

  logCard: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: colors.cardBorder, padding: 20, marginBottom: 12,
  },
  logCardTitle: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginBottom: 4,
  },
  logCardDate: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weightInput: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center',
  },
  weightUnit: { fontSize: 18, color: colors.textMuted, fontWeight: '600' },
  logBtn: {
    backgroundColor: colors.accent, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  logBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: 14, alignItems: 'center',
  },
  statCardAccent: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  statLabel: {
    fontSize: 9, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.8, marginBottom: 6,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statUnit: { fontSize: 12, fontWeight: '600', color: colors.textMuted },

  reminderCard: {
    backgroundColor: colors.surface, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 20,
  },
  reminderText: { fontSize: 12, color: colors.textMuted, fontWeight: '500', lineHeight: 18 },

  logSection: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginBottom: 12,
  },
  logEntry: {
    backgroundColor: colors.card, borderRadius: 12, borderWidth: 1,
    borderColor: colors.cardBorder, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  logEntryToday: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  logDate: { fontSize: 15, fontWeight: '600', color: colors.text },
  logDateToday: { color: colors.accent, fontWeight: '700' },
  logDateSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  logRight: { alignItems: 'flex-end', gap: 2 },
  logDelta: { fontSize: 12, fontWeight: '600' },
  logWeight: { fontSize: 20, fontWeight: '800', color: colors.text },
  logWeightToday: { color: colors.accent },
  longPressHint: {
    fontSize: 11, color: colors.textMuted, textAlign: 'center',
    marginTop: 8, fontStyle: 'italic',
  },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
});
