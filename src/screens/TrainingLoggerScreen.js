import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { DAY_NAMES, WORKOUT_SCHEDULE } from '../constants/workouts';
import {
  getMondayOfWeek,
  toISO,
  formatShort,
  jsWeekdayToIndex,
} from '../utils/dates';
import ExerciseCard from '../components/ExerciseCard';

const STORAGE_PREFIX = 'grind_log_';

function storageKey(mondayISO, dayIndex) {
  return `${STORAGE_PREFIX}${mondayISO}_${dayIndex}`;
}

function buildEmptyLog(workout) {
  if (!workout || workout.isRest) return {};
  const log = {};
  workout.exercises.forEach(ex => {
    log[ex.name] = Array.from({ length: ex.sets }, () => ({
      weight: '',
      reps: '',
      done: false,
    }));
  });
  return log;
}

export default function TrainingLoggerScreen() {
  const today = new Date();
  const todayDayIndex = jsWeekdayToIndex(today.getDay()); // 0=Mon, 6=Sun

  const thisMonday = getMondayOfWeek(today);

  // weekOffset: 0=current week, -1=last week, -2=2 weeks ago, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayDayIndex);
  const [logData, setLogData] = useState({});
  const [prevLogData, setPrevLogData] = useState({});
  const [loading, setLoading] = useState(false);

  const isCurrentWeek = weekOffset === 0;

  const selectedMonday = new Date(thisMonday);
  selectedMonday.setDate(thisMonday.getDate() + weekOffset * 7);
  const selectedMondayISO = toISO(selectedMonday);

  const prevMonday = new Date(selectedMonday);
  prevMonday.setDate(selectedMonday.getDate() - 7);
  const prevMondayISO = toISO(prevMonday);

  // "Jun 2 – Jun 8"
  const weekSunday = new Date(selectedMonday);
  weekSunday.setDate(selectedMonday.getDate() + 6);
  const weekLabel = `${formatShort(selectedMonday)} – ${formatShort(weekSunday)}`;

  const workout = WORKOUT_SCHEDULE[selectedDay];
  const isToday = isCurrentWeek && selectedDay === todayDayIndex;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const key = storageKey(selectedMondayISO, selectedDay);
      const prevKey = storageKey(prevMondayISO, selectedDay);

      const [raw, prevRaw] = await Promise.all([
        AsyncStorage.getItem(key),
        AsyncStorage.getItem(prevKey),
      ]);

      setLogData(raw ? JSON.parse(raw) : buildEmptyLog(workout));
      setPrevLogData(prevRaw ? JSON.parse(prevRaw) : {});
    } catch {
      setLogData(buildEmptyLog(workout));
      setPrevLogData({});
    } finally {
      setLoading(false);
    }
  }, [selectedMondayISO, selectedDay, workout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persist = useCallback(async (data) => {
    try {
      const key = storageKey(selectedMondayISO, selectedDay);
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch { /* ignore */ }
  }, [selectedMondayISO, selectedDay]);

  const updateSet = useCallback((exerciseName, setIndex, field, value) => {
    setLogData(prev => {
      const updated = {
        ...prev,
        [exerciseName]: prev[exerciseName].map((s, i) =>
          i === setIndex ? { ...s, [field]: value } : s
        ),
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const toggleDone = useCallback((exerciseName, setIndex) => {
    setLogData(prev => {
      const updated = {
        ...prev,
        [exerciseName]: prev[exerciseName].map((s, i) =>
          i === setIndex ? { ...s, done: !s.done } : s
        ),
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const addSet = useCallback((exerciseName) => {
    setLogData(prev => {
      const updated = {
        ...prev,
        [exerciseName]: [...(prev[exerciseName] || []), { weight: '', reps: '', done: false }],
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeSet = useCallback((exerciseName, setIndex) => {
    setLogData(prev => {
      const updated = {
        ...prev,
        [exerciseName]: prev[exerciseName].filter((_, i) => i !== setIndex),
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  // Progress counters for header
  const totalExercises = workout?.isRest ? 0 : (workout?.exercises?.length ?? 0);
  const completedExercises = workout?.isRest ? 0 : (workout?.exercises ?? []).filter(ex => {
    const sets = logData[ex.name] || [];
    return sets.length > 0 && sets.every(s => s.done);
  }).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>TRAINING</Text>
            {!workout?.isRest && totalExercises > 0 && (
              <Text style={styles.headerSub}>
                {completedExercises}/{totalExercises} exercises done
              </Text>
            )}
          </View>
          {isToday && !workout?.isRest && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>TODAY</Text>
            </View>
          )}
        </View>

        {/* ── Week Navigator ── */}
        <View style={styles.weekNav}>
          <TouchableOpacity style={styles.arrow} onPress={() => setWeekOffset(o => o - 1)}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.weekCenter}>
            <Text style={styles.weekLabel}>{weekLabel}</Text>
            <Text style={styles.weekSub}>{isCurrentWeek ? 'Current week' : `${Math.abs(weekOffset)}w ago`}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrow, isCurrentWeek && styles.arrowDisabled]}
            onPress={() => !isCurrentWeek && setWeekOffset(o => o + 1)}
            disabled={isCurrentWeek}
          >
            <Text style={[styles.arrowText, isCurrentWeek && styles.arrowTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Day Tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayTabScroll}
          contentContainerStyle={styles.dayTabRow}
        >
          {DAY_NAMES.map((name, i) => {
            const dayWorkout = WORKOUT_SCHEDULE[i];
            const isRestDay = dayWorkout?.isRest;
            const isActiveDay = selectedDay === i;
            const isTodayDay = isCurrentWeek && i === todayDayIndex;

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayTab,
                  isActiveDay && styles.dayTabActive,
                  isRestDay && styles.dayTabRest,
                  isActiveDay && isRestDay && styles.dayTabRestActive,
                ]}
                onPress={() => setSelectedDay(i)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayTabLabel,
                  isActiveDay && styles.dayTabLabelActive,
                  isRestDay && !isActiveDay && styles.dayTabLabelRest,
                ]}>
                  {name.toUpperCase()}
                </Text>
                {isTodayDay && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Workout Content ── */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Workout banner */}
          {workout && (
            <View style={[styles.workoutBanner, workout.isRest && styles.workoutBannerRest]}>
              <View style={styles.workoutBannerLeft}>
                <View style={[styles.tagChip, workout.isRest && styles.tagChipRest]}>
                  <Text style={[styles.tagChipText, workout.isRest && styles.tagChipTextRest]}>
                    {workout.tag}
                  </Text>
                </View>
                <Text style={styles.workoutName}>{workout.name}</Text>
              </View>
              <Text style={styles.workoutMuscles}>{workout.muscles}</Text>
            </View>
          )}

          {/* Rest day card */}
          {workout?.isRest && (
            <View style={styles.restCard}>
              <Text style={styles.restIcon}>🧘</Text>
              <Text style={styles.restTitle}>Rest & Recover</Text>
              {workout.activities.map((a, i) => (
                <View key={i} style={styles.restActivity}>
                  <View style={styles.restDot} />
                  <Text style={styles.restActivityText}>{a}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Exercise cards */}
          {!workout?.isRest && !loading && workout?.exercises?.map(exercise => (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              sets={logData[exercise.name] || []}
              prevSets={prevLogData[exercise.name] || null}
              onUpdateSet={updateSet}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onToggleDone={toggleDone}
            />
          ))}

          {loading && (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {/* Progressive overload reminder */}
          {!workout?.isRest && !loading && (
            <View style={styles.reminderCard}>
              <Text style={styles.reminderText}>
                💡  Hit top of rep range on all sets → add weight next session
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  todayBadge: {
    backgroundColor: colors.accentDim,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  todayBadgeText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Week navigator
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  arrow: { paddingHorizontal: 10, paddingVertical: 6 },
  arrowDisabled: { opacity: 0.2 },
  arrowText: { fontSize: 32, color: colors.accent, fontWeight: '300', lineHeight: 36 },
  arrowTextDisabled: { color: colors.textMuted },
  weekCenter: { flex: 1, alignItems: 'center' },
  weekLabel: { fontSize: 17, fontWeight: '700', color: colors.text },
  weekSub: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },

  // Day tabs
  dayTabScroll: {
    maxHeight: 56,
    marginBottom: 4,
  },
  dayTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    minWidth: 50,
  },
  dayTabActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  dayTabRest: {
    opacity: 0.5,
  },
  dayTabRestActive: {
    opacity: 1,
    backgroundColor: colors.surface,
    borderColor: colors.textMuted,
  },
  dayTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  dayTabLabelActive: {
    color: colors.accent,
  },
  dayTabLabelRest: {
    color: colors.textMuted,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },

  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Workout banner
  workoutBanner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutBannerRest: {
    borderColor: colors.textMuted,
  },
  workoutBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagChip: {
    backgroundColor: colors.accentDim,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tagChipRest: {
    backgroundColor: colors.surface,
    borderColor: colors.textMuted,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1,
  },
  tagChipTextRest: {
    color: colors.textMuted,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  workoutMuscles: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },

  // Rest card
  restCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  restIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  restTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  restActivity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginBottom: 10,
    gap: 10,
  },
  restDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  restActivityText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },

  // Misc
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  reminderCard: {
    backgroundColor: colors.accentDim,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.25)',
    marginTop: 4,
    marginBottom: 12,
  },
  reminderText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
    lineHeight: 18,
    opacity: 0.9,
  },
});
