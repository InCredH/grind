import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { MEALS, DAILY_TARGETS } from '../constants/meals';
import { toISO } from '../utils/dates';
import MealCard from '../components/MealCard';
import MealFormModal from '../components/MealFormModal';

const DEFAULTS_KEY = 'grind_meal_defaults';
const dayKey = iso => `grind_meals_${iso}`;

function getTodayISO() { return toISO(new Date()); }

function formatDateLabel(isoDate) {
  const today = getTodayISO();
  const d = new Date(isoDate + 'T00:00:00');
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  if (isoDate === today) return 'Today';
  if (isoDate === toISO(yd)) return 'Yesterday';
  if (isoDate === toISO(tm)) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function shiftDate(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function sumMacros(meals) {
  return meals.reduce(
    (acc, m) => ({
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      calories: acc.calories + (m.calories || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );
}

// ── Weekly calories bar graph ────────────────────────────────────────────────

const CHART_H = 88; // px — height of the bar area

function WeeklyGraph({ defaultMeals, selectedDate, onDayPress, refreshTrigger }) {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    if (!defaultMeals.length) return;
    const load = async () => {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = toISO(d);
        const raw = await AsyncStorage.getItem(dayKey(iso));
        const meals = raw ? JSON.parse(raw) : defaultMeals;
        const { calories, protein } = sumMacros(meals);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
        result.push({ date: iso, calories, protein, isCustom: !!raw, dayName });
      }
      setBars(result);
    };
    load();
  }, [defaultMeals, refreshTrigger]);

  if (!bars.length) return null;

  // Scale: top of chart = target × 1.25 so there's headroom above the target line
  const chartMax = DAILY_TARGETS.calories * 1.25;
  const targetLineBottom = Math.round((DAILY_TARGETS.calories / chartMax) * CHART_H);

  return (
    <View style={gStyles.card}>
      <View style={gStyles.titleRow}>
        <Text style={gStyles.title}>7-DAY CALORIES</Text>
      </View>

      {/* Chart */}
      <View style={[gStyles.chartArea, { height: CHART_H + 2 }]}>
        {/* Dashed target line */}
        <View style={[gStyles.targetLine, { bottom: targetLineBottom }]} />

        {/* Bars */}
        <View style={gStyles.barsRow}>
          {bars.map(bar => {
            const isToday = bar.date === getTodayISO();
            const isSelected = bar.date === selectedDate;
            const barH = Math.max(Math.round((bar.calories / chartMax) * CHART_H), 3);
            const overTarget = bar.calories > DAILY_TARGETS.calories;
            const barColor = !bar.isCustom
              ? colors.cardBorder
              : overTarget
                ? colors.danger
                : colors.accent;

            return (
              <TouchableOpacity
                key={bar.date}
                style={gStyles.barCol}
                onPress={() => onDayPress(bar.date)}
                activeOpacity={0.7}
              >
                {/* Calorie number above bar */}
                <Text style={[
                  gStyles.calNum,
                  bar.isCustom ? { color: overTarget ? colors.danger : colors.accent } : { color: 'transparent' },
                ]}>
                  {bar.calories}
                </Text>

                {/* Bar + selected ring */}
                <View style={gStyles.barWrapper}>
                  <View style={[
                    gStyles.bar,
                    { height: barH, backgroundColor: barColor },
                    isSelected && gStyles.barSelected,
                    isToday && !isSelected && gStyles.barToday,
                  ]} />
                </View>

                {/* Day label */}
                <Text style={[
                  gStyles.dayLabel,
                  isToday && gStyles.dayLabelToday,
                  isSelected && gStyles.dayLabelSelected,
                ]}>
                  {bar.dayName}
                </Text>

                {/* Protein dot */}
                <Text style={[gStyles.proteinNum, !bar.isCustom && { color: 'transparent' }]}>
                  {bar.protein}P
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={gStyles.legend}>
        <View style={gStyles.legendItem}>
          <View style={[gStyles.legendSwatch, { backgroundColor: colors.accent }]} />
          <Text style={gStyles.legendText}>Logged</Text>
        </View>
        <View style={gStyles.legendItem}>
          <View style={[gStyles.legendSwatch, { backgroundColor: colors.danger }]} />
          <Text style={gStyles.legendText}>Over target</Text>
        </View>
        <View style={gStyles.legendItem}>
          <View style={[gStyles.legendSwatch, { backgroundColor: colors.cardBorder }]} />
          <Text style={gStyles.legendText}>Default</Text>
        </View>
        <View style={gStyles.legendItem}>
          <View style={gStyles.targetSwatch} />
          <Text style={gStyles.legendText}>Target</Text>
        </View>
      </View>
    </View>
  );
}

const gStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: colors.cardBorder, padding: 16, marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1 },
  targetLabel: { fontSize: 11, color: colors.accent, fontWeight: '600' },

  chartArea: { position: 'relative', marginBottom: 8 },
  targetLine: {
    position: 'absolute', left: 0, right: 0, height: 0,
    borderTopWidth: 1, borderColor: colors.accent, borderStyle: 'dashed',
  },

  barsRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: '100%', paddingBottom: 0,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  calNum: { fontSize: 8, fontWeight: '700', marginBottom: 3, letterSpacing: 0 },
  barWrapper: { width: '65%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '100%', borderRadius: 4,
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
  barSelected: {
    borderWidth: 2, borderColor: colors.text, borderRadius: 4,
  },
  barToday: {
    borderWidth: 1.5, borderColor: colors.accent, borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10, fontWeight: '600', color: colors.textMuted,
    marginTop: 5,
  },
  dayLabelToday: { color: colors.accent },
  dayLabelSelected: { color: colors.text, fontWeight: '800' },
  proteinNum: {
    fontSize: 8, color: colors.textMuted, fontWeight: '600', marginTop: 1,
  },

  legend: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 8, height: 8, borderRadius: 2 },
  targetSwatch: {
    width: 12, height: 0, borderTopWidth: 1.5,
    borderColor: colors.accent, borderStyle: 'dashed',
  },
  legendText: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
});

// ── Main screen ──────────────────────────────────────────────────────────────

export default function MealPlanScreen() {
  const [activeTab, setActiveTab] = useState('today');
  const [currentDate, setCurrentDate] = useState(getTodayISO());
  const [defaultMeals, setDefaultMeals] = useState([]);
  const [dayMeals, setDayMeals] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [graphRefresh, setGraphRefresh] = useState(0);

  const isOnToday = currentDate === getTodayISO();

  const loadDefaults = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(DEFAULTS_KEY);
      if (raw) {
        setDefaultMeals(JSON.parse(raw));
      } else {
        const seeded = MEALS.map(m => ({ ...m }));
        await AsyncStorage.setItem(DEFAULTS_KEY, JSON.stringify(seeded));
        setDefaultMeals(seeded);
      }
    } catch { /* ignore */ }
  }, []);

  useFocusEffect(useCallback(() => { loadDefaults(); }, [loadDefaults]));

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(dayKey(currentDate));
        setDayMeals(raw ? JSON.parse(raw) : null);
      } catch { setDayMeals(null); }
    };
    load();
  }, [currentDate]);

  const todayDisplay = dayMeals ?? defaultMeals;
  const isUsingDefaults = activeTab === 'today' && dayMeals === null;
  const displayMeals = activeTab === 'defaults' ? defaultMeals : todayDisplay;

  const persistDay = async meals => {
    setDayMeals(meals);
    setGraphRefresh(n => n + 1);
    await AsyncStorage.setItem(dayKey(currentDate), JSON.stringify(meals));
  };

  const persistDefaults = async meals => {
    setDefaultMeals(meals);
    setGraphRefresh(n => n + 1);
    await AsyncStorage.setItem(DEFAULTS_KEY, JSON.stringify(meals));
  };

  const handleFormSave = async mealData => {
    setFormVisible(false);
    const base = activeTab === 'defaults' ? defaultMeals : todayDisplay;
    const updated = editingMeal
      ? base.map(m => m.id === editingMeal.id ? mealData : m)
      : [...base, mealData];
    if (activeTab === 'defaults') await persistDefaults(updated);
    else await persistDay(updated);
    setEditingMeal(null);
  };

  const handleDelete = meal => {
    Alert.alert('Delete meal', `Remove "${meal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const base = activeTab === 'defaults' ? defaultMeals : todayDisplay;
          const updated = base.filter(m => m.id !== meal.id);
          if (activeTab === 'defaults') await persistDefaults(updated);
          else await persistDay(updated);
        },
      },
    ]);
  };

  const handleResetToDefaults = () => {
    Alert.alert('Reset day', 'Revert this day to the default meal plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem(dayKey(currentDate));
          setDayMeals(null);
          setGraphRefresh(n => n + 1);
        },
      },
    ]);
  };

  const totals = sumMacros(displayMeals);
  const calDiff = totals.calories - DAILY_TARGETS.calories;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Tab switcher ── */}
      <View style={styles.tabRow}>
        {['today', 'defaults'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'today' ? 'TODAY' : 'DEFAULTS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Date navigator (TODAY tab) ── */}
      {activeTab === 'today' && (
        <View style={styles.dateNav}>
          <TouchableOpacity style={styles.arrow} onPress={() => setCurrentDate(d => shiftDate(d, -1))}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Text style={styles.dateLabel}>{formatDateLabel(currentDate)}</Text>
            {isUsingDefaults
              ? <Text style={styles.dateSub}>using default plan</Text>
              : <Text style={[styles.dateSub, { color: colors.accent }]}>customised</Text>
            }
          </View>

          {/* Forward arrow disabled on today */}
          <TouchableOpacity
            style={[styles.arrow, isOnToday && styles.arrowDisabled]}
            onPress={() => !isOnToday && setCurrentDate(d => shiftDate(d, 1))}
            disabled={isOnToday}
          >
            <Text style={[styles.arrowText, isOnToday && styles.arrowTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Defaults tab subheading ── */}
      {activeTab === 'defaults' && (
        <View style={styles.defaultsNote}>
          <Text style={styles.defaultsNoteText}>
            Edit the base meals applied to every day. Days you've customised keep their own data.
          </Text>
        </View>
      )}

      {/* ── Meal list ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Totals card ── */}
        {displayMeals.length > 0 && (
          <View style={styles.totalsCard}>
            <Text style={styles.totalsHeading}>DAILY TOTALS</Text>
            <View style={styles.totalsRow}>
              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: colors.accent }]}>{totals.protein}g</Text>
                <Text style={styles.totalLabel}>Protein</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: '#60a5fa' }]}>{totals.carbs}g</Text>
                <Text style={styles.totalLabel}>Carbs</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: '#facc15' }]}>{totals.fat}g</Text>
                <Text style={styles.totalLabel}>Fat</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalValue}>{totals.calories}</Text>
                <Text style={styles.totalLabel}>kcal</Text>
              </View>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetText}>
                Target: {DAILY_TARGETS.protein}g P · {DAILY_TARGETS.calories} kcal
              </Text>
              <Text style={[
                styles.targetDiff,
                { color: calDiff <= 0 ? colors.success : colors.danger },
              ]}>
                {calDiff === 0 ? 'On target' : `${calDiff > 0 ? '+' : ''}${calDiff} kcal`}
              </Text>
            </View>
          </View>
        )}

        {displayMeals.map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            onEdit={() => { setEditingMeal(meal); setFormVisible(true); }}
            onDelete={() => handleDelete(meal)}
          />
        ))}

        {displayMeals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals added yet.</Text>
            <Text style={styles.emptySubText}>Tap + to add your first meal.</Text>
          </View>
        )}

        

        {/* ── Weekly graph (TODAY tab only) ── */}
        {activeTab === 'today' && (
          <WeeklyGraph
            defaultMeals={defaultMeals}
            selectedDate={currentDate}
            onDayPress={setCurrentDate}
            refreshTrigger={graphRefresh}
          />
        )}

        {/* Reset button */}
        {activeTab === 'today' && !isUsingDefaults && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetToDefaults}>
            <Text style={styles.resetBtnText}>Reset this day to defaults</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setEditingMeal(null); setFormVisible(true); }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <MealFormModal
        visible={formVisible}
        meal={editingMeal}
        onSave={handleFormSave}
        onClose={() => { setFormVisible(false); setEditingMeal(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  tabRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingTop: 16, marginBottom: 10,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8 },
  tabTextActive: { color: colors.accent },

  dateNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, marginBottom: 10,
  },
  arrow: { paddingHorizontal: 10, paddingVertical: 6 },
  arrowDisabled: { opacity: 0.2 },
  arrowText: { fontSize: 32, color: colors.accent, fontWeight: '300', lineHeight: 36 },
  arrowTextDisabled: { color: colors.textMuted },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
  dateSub: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },

  defaultsNote: { paddingHorizontal: 16, marginBottom: 12 },
  defaultsNoteText: { fontSize: 12, color: colors.textMuted, fontWeight: '500', lineHeight: 18 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: colors.textMuted, marginTop: 8 },

  totalsCard: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: colors.cardBorder, padding: 16, marginTop: 4, marginBottom: 30,
  },
  totalsHeading: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginBottom: 14,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  totalLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 3 },
  targetRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  targetText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  targetDiff: { fontSize: 12, fontWeight: '700' },

  resetBtn: { alignItems: 'center', paddingVertical: 14 },
  resetBtnText: {
    fontSize: 13, color: colors.danger, fontWeight: '600', textDecorationLine: 'underline',
  },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 10,
  },
  fabText: { fontSize: 30, color: '#fff', fontWeight: '300', lineHeight: 34 },
});
