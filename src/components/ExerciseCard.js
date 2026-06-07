import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import SetRow from './SetRow';

export default function ExerciseCard({ exercise, sets, prevSets, onUpdateSet, onAddSet, onRemoveSet, onToggleDone }) {
  const [collapsed, setCollapsed] = useState(false);
  const completedCount = (sets || []).filter(s => s.done).length;
  const totalSets = (sets || []).length;
  const allDone = totalSets > 0 && completedCount === totalSets;

  // Build previous week summary string
  const prevSummary = prevSets && prevSets.length > 0
    ? prevSets.map(s => `${s.weight || '—'}×${s.reps || '—'}`).join('  ')
    : null;

  return (
    <View style={[styles.card, allDone && styles.cardDone]}>
      <TouchableOpacity style={styles.header} onPress={() => setCollapsed(c => !c)} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.target}>
            {exercise.sets}×{exercise.repRange}
          </Text>
        </View>
        <View style={[styles.progressBadge, allDone && styles.progressBadgeDone]}>
          <Text style={[styles.progressText, allDone && styles.progressTextDone]}>
            {completedCount}/{totalSets}
          </Text>
        </View>
        <Text style={[styles.chevron, collapsed && styles.chevronCollapsed]}>›</Text>
      </TouchableOpacity>

      {!collapsed && (
        <>
          {prevSummary ? (
            <View style={styles.prevRow}>
              <Text style={styles.prevLabel}>Last week  </Text>
              <Text style={styles.prevValues}>{prevSummary}</Text>
            </View>
          ) : (
            <View style={styles.prevRow}>
              <Text style={styles.prevLabel}>No previous data</Text>
            </View>
          )}

          <View style={styles.setsDivider} />

          <View style={styles.setsHeader}>
            <Text style={[styles.colLabel, { width: 22 }]}>#</Text>
            <Text style={[styles.colLabel, { marginLeft: 8 }]}>Weight</Text>
            <Text style={[styles.colLabel, { marginLeft: 48 }]}>Reps</Text>
          </View>

          {(sets || []).map((set, index) => (
            <SetRow
              key={index}
              setNumber={index + 1}
              weight={set.weight}
              reps={set.reps}
              done={set.done}
              onWeightChange={(v) => onUpdateSet(exercise.name, index, 'weight', v)}
              onRepsChange={(v) => onUpdateSet(exercise.name, index, 'reps', v)}
              onToggleDone={() => onToggleDone(exercise.name, index)}
              onRemove={totalSets > 1 ? () => onRemoveSet(exercise.name, index) : null}
            />
          ))}

          <TouchableOpacity style={styles.addSetBtn} onPress={() => onAddSet(exercise.name)}>
            <Text style={styles.addSetText}>+ Add Set</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardDone: {
    borderColor: colors.success,
    backgroundColor: '#111a13',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  target: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  progressBadge: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  progressBadgeDone: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  progressTextDone: {
    color: colors.success,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    transform: [{ rotate: '90deg' }],
    marginLeft: 2,
  },
  chevronCollapsed: {
    transform: [{ rotate: '0deg' }],
  },
  prevRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
    flexWrap: 'wrap',
  },
  prevLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  prevValues: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  setsDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  colLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addSetBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addSetText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
