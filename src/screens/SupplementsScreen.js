import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { SUPPLEMENTS, SUPPS_KEY_PREFIX } from '../constants/supplements';
import { toISO } from '../utils/dates';

function getTodayISO() {
  return toISO(new Date());
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISO(d));
  }
  return days;
}

function dayLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
}

export default function SupplementsScreen() {
  const todayISO = getTodayISO();
  const [checked, setChecked] = useState({});
  const [history, setHistory] = useState({});

  const loadData = useCallback(async () => {
    try {
      const last7 = getLast7Days();
      const keys = last7.map(d => `${SUPPS_KEY_PREFIX}${d}`);
      const results = await AsyncStorage.multiGet(keys);
      const hist = {};
      results.forEach(([key, val]) => {
        const date = key.replace(SUPPS_KEY_PREFIX, '');
        hist[date] = val ? JSON.parse(val) : {};
      });
      setHistory(hist);
      setChecked(hist[todayISO] || {});
    } catch { /* ignore */ }
  }, [todayISO]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const toggle = async (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    const updated = { ...history, [todayISO]: next };
    setHistory(updated);
    try {
      await AsyncStorage.setItem(`${SUPPS_KEY_PREFIX}${todayISO}`, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const todayCount = SUPPLEMENTS.filter(s => checked[s.key]).length;
  const allDone = todayCount === SUPPLEMENTS.length;
  const last7 = getLast7Days();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SUPPLEMENTS</Text>
          <View style={[styles.countBadge, allDone && styles.countBadgeDone]}>
            <Text style={[styles.countText, allDone && styles.countTextDone]}>
              {todayCount}/{SUPPLEMENTS.length} today
            </Text>
          </View>
        </View>

        {/* Supplement cards */}
        <View style={styles.section}>
          {SUPPLEMENTS.map((supp) => {
            const done = !!checked[supp.key];
            return (
              <TouchableOpacity
                key={supp.key}
                style={[styles.suppCard, done && styles.suppCardDone]}
                onPress={() => toggle(supp.key)}
                activeOpacity={0.7}
              >
                <View style={styles.suppLeft}>
                  <Text style={[styles.suppName, done && styles.suppNameDone]}>{supp.name}</Text>
                  <Text style={styles.suppDose}>{supp.dose}</Text>
                  <Text style={styles.suppTiming}>{supp.timing}</Text>
                </View>
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  <Text style={[styles.checkmark, done && styles.checkmarkDone]}>
                    {done ? '✓' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 7-day history */}
        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>7-DAY COMPLIANCE</Text>
          <View style={styles.historyGrid}>
            {last7.map((date) => {
              const dayData = history[date] || {};
              const count = SUPPLEMENTS.filter(s => dayData[s.key]).length;
              const isToday = date === todayISO;
              const ratio = count / SUPPLEMENTS.length;

              let dotStyle = styles.histDotEmpty;
              if (ratio === 1) dotStyle = styles.histDotFull;
              else if (ratio > 0) dotStyle = styles.histDotPartial;

              return (
                <View key={date} style={styles.histDay}>
                  <Text style={[styles.histDayLabel, isToday && styles.histDayLabelToday]}>
                    {dayLabel(date)}
                  </Text>
                  <View style={[styles.histDot, dotStyle, isToday && styles.histDotToday]}>
                    {ratio === 1 && <Text style={styles.histDotCheck}>✓</Text>}
                    {ratio > 0 && ratio < 1 && <Text style={styles.histDotNum}>{count}</Text>}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>All 4</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.cardBorder }]} />
              <Text style={styles.legendText}>None</Text>
            </View>
          </View>
        </View>

        {/* Reminder note */}
        <View style={styles.reminderCard}>
          <Text style={styles.reminderText}>
            Consistency matters more than timing. Take them daily without exception.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title: {
    fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: 1.5,
  },
  countBadge: {
    backgroundColor: colors.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  countBadgeDone: { backgroundColor: colors.successDim, borderColor: colors.success },
  countText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  countTextDone: { color: colors.success },

  section: { marginBottom: 24 },

  suppCard: {
    backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.cardBorder,
    padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  suppCardDone: { borderColor: colors.success, backgroundColor: '#111a13' },
  suppLeft: { flex: 1 },
  suppName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  suppNameDone: { color: colors.success },
  suppDose: { fontSize: 13, fontWeight: '600', color: colors.accent, marginBottom: 2 },
  suppTiming: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  checkbox: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { fontSize: 18, color: colors.textMuted, fontWeight: '700' },
  checkmarkDone: { color: '#fff' },

  historySection: {
    backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: 16, marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginBottom: 16,
  },
  historyGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  histDay: { alignItems: 'center', gap: 6 },
  histDayLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  histDayLabelToday: { color: colors.accent },
  histDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  histDotEmpty: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  histDotPartial: { backgroundColor: 'rgba(249,115,22,0.2)', borderWidth: 1, borderColor: colors.accent },
  histDotFull: { backgroundColor: colors.success },
  histDotToday: { borderWidth: 2, borderColor: colors.accent },
  histDotCheck: { fontSize: 14, color: '#fff', fontWeight: '800' },
  histDotNum: { fontSize: 12, color: colors.accent, fontWeight: '800' },

  legend: { flexDirection: 'row', gap: 16, marginTop: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },

  reminderCard: {
    backgroundColor: colors.accentDim, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
  },
  reminderText: { fontSize: 12, color: colors.accent, fontWeight: '500', lineHeight: 18 },
});
