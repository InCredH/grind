import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { WORKOUT_SCHEDULE } from '../constants/workouts';
import { SUPPLEMENTS, SUPPS_KEY_PREFIX, WEIGHT_LOG_KEY } from '../constants/supplements';
import { DAILY_TARGETS } from '../constants/meals';
import { jsWeekdayToIndex, toISO } from '../utils/dates';

function getTodayISO() {
  return toISO(new Date());
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTodayLong() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function HomeScreen({ navigation }) {
  const todayISO = getTodayISO();
  const dayIndex = jsWeekdayToIndex(new Date().getDay());
  const workout = WORKOUT_SCHEDULE[dayIndex];

  const [suppChecked, setSuppChecked] = useState({});
  const [todayWeight, setTodayWeight] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [suppRaw, weightRaw] = await Promise.all([
        AsyncStorage.getItem(`${SUPPS_KEY_PREFIX}${todayISO}`),
        AsyncStorage.getItem(WEIGHT_LOG_KEY),
      ]);
      setSuppChecked(suppRaw ? JSON.parse(suppRaw) : {});
      if (weightRaw) {
        const log = JSON.parse(weightRaw);
        const entry = log.find(e => e.date === todayISO);
        setTodayWeight(entry ? entry.weight : null);
      }
    } catch { /* ignore */ }
  }, [todayISO]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const suppCount = SUPPLEMENTS.filter(s => suppChecked[s.key]).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, Harsh</Text>
            <Text style={styles.dateText}>{formatTodayLong()}</Text>
          </View>
          <View style={styles.appNameBadge}>
            <Text style={styles.appName}>GRIND</Text>
          </View>
        </View>

        {/* Today's Workout card */}
        <TouchableOpacity
          style={[styles.workoutCard, workout.isRest && styles.workoutCardRest]}
          onPress={() => navigation.navigate('Training')}
          activeOpacity={0.8}
        >
          <View style={styles.workoutCardTop}>
            <View style={[styles.sessionTag, workout.isRest && styles.sessionTagRest]}>
              <Text style={[styles.sessionTagText, workout.isRest && styles.sessionTagTextRest]}>
                {workout.tag}
              </Text>
            </View>
            <Text style={styles.workoutCardArrow}>→</Text>
          </View>
          <Text style={styles.workoutCardName}>{workout.name}</Text>
          <Text style={styles.workoutCardMuscles}>{workout.muscles}</Text>
          {!workout.isRest && (
            <Text style={styles.workoutCardExCount}>
              {workout.exercises.length} exercises
            </Text>
          )}
          {workout.isRest && (
            <Text style={styles.workoutCardExCount}>
              Recovery · mobility · sleep
            </Text>
          )}
        </TouchableOpacity>

        {/* Stats row: Supplements + Weight */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, suppCount === SUPPLEMENTS.length && styles.statCardDone]}
            onPress={() => navigation.navigate('Supps')}
            activeOpacity={0.8}
          >
            <Text style={styles.statCardLabel}>SUPPS TODAY</Text>
            <Text style={[
              styles.statCardValue,
              suppCount === SUPPLEMENTS.length ? { color: colors.success } : {}
            ]}>
              {suppCount}/{SUPPLEMENTS.length}
            </Text>
            <Text style={styles.statCardSub}>
              {suppCount === SUPPLEMENTS.length ? 'All done ✓' : 'Tap to log'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Progress')}
            activeOpacity={0.8}
          >
            <Text style={styles.statCardLabel}>WEIGHT</Text>
            {todayWeight ? (
              <Text style={styles.statCardValue}>{todayWeight} <Text style={styles.statCardUnit}>kg</Text></Text>
            ) : (
              <Text style={[styles.statCardValue, { color: colors.textMuted }]}>—</Text>
            )}
            <Text style={styles.statCardSub}>
              {todayWeight ? 'Logged today' : 'Tap to log'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily macros reference */}
        <View style={styles.macrosCard}>
          <Text style={styles.sectionLabel}>DAILY TARGETS</Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroVal, { color: colors.accent }]}>{DAILY_TARGETS.protein}g</Text>
              <Text style={styles.macroLbl}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroVal, { color: '#60a5fa' }]}>{DAILY_TARGETS.carbs}g</Text>
              <Text style={styles.macroLbl}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroVal, { color: '#facc15' }]}>{DAILY_TARGETS.fat}g</Text>
              <Text style={styles.macroLbl}>Fat</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroVal}>{DAILY_TARGETS.calories}</Text>
              <Text style={styles.macroLbl}>kcal</Text>
            </View>
          </View>
          <View style={styles.deficitRow}>
            <Text style={styles.deficitText}>
              −{DAILY_TARGETS.deficit} kcal deficit from TDEE {DAILY_TARGETS.tdee}
            </Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Training')} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>🏋</Text>
            <Text style={styles.actionLabel}>Log Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Meals')} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>🍽</Text>
            <Text style={styles.actionLabel}>Meal Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Supps')} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.actionLabel}>Supplements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Progress')} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionLabel}>Log Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Hydration reminder */}
        <View style={styles.waterCard}>
          <Text style={styles.waterText}>💧  Drink 3–4L water today</Text>
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
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 20,
  },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '500', marginBottom: 2 },
  dateText: { fontSize: 18, fontWeight: '700', color: colors.text },
  appNameBadge: {
    backgroundColor: colors.accentDim, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.accent,
  },
  appName: { fontSize: 14, fontWeight: '800', color: colors.accent, letterSpacing: 2 },

  // Workout card
  workoutCard: {
    backgroundColor: colors.card, borderRadius: 16, borderWidth: 1,
    borderColor: colors.accent, padding: 20, marginBottom: 12,
  },
  workoutCardRest: { borderColor: colors.cardBorder },
  workoutCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sessionTag: {
    backgroundColor: colors.accentDim, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.accent,
  },
  sessionTagRest: { backgroundColor: colors.surface, borderColor: colors.textMuted },
  sessionTagText: { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1 },
  sessionTagTextRest: { color: colors.textMuted },
  workoutCardArrow: { fontSize: 20, color: colors.accent },
  workoutCardName: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 4 },
  workoutCardMuscles: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 6 },
  workoutCardExCount: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 16,
  },
  statCardDone: { borderColor: colors.success, backgroundColor: '#111a13' },
  statCardLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.8, marginBottom: 8,
  },
  statCardValue: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statCardUnit: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  statCardSub: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },

  // Macros card
  macrosCard: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: colors.cardBorder, padding: 16, marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginBottom: 14,
  },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  macroItem: { alignItems: 'center' },
  macroVal: { fontSize: 18, fontWeight: '800', color: colors.text },
  macroLbl: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 3 },
  macroDivider: { width: 1, height: 28, backgroundColor: colors.cardBorder },
  deficitRow: {
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder,
    alignItems: 'center',
  },
  deficitText: { fontSize: 12, color: colors.accent, fontWeight: '600', letterSpacing: 0.3 },

  // Quick actions
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12,
  },
  actionBtn: {
    width: '47.5%', backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: 16, alignItems: 'center', gap: 8,
  },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.3 },

  waterCard: {
    backgroundColor: 'rgba(96,165,250,0.08)', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)', alignItems: 'center',
  },
  waterText: { fontSize: 13, color: '#60a5fa', fontWeight: '600' },
});
