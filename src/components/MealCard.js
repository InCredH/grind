import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

function MacroBox({ label, value, color }) {
  return (
    <View style={styles.macroBox}>
      <Text style={[styles.macroVal, { color }]}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export default function MealCard({ meal, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const hasItems = Array.isArray(meal.items) && meal.items.length > 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.75}
      >
        {meal.time ? (
          <View style={styles.timeTag}>
            <Text style={styles.timeText}>{meal.time}</Text>
          </View>
        ) : null}

        <View style={styles.headerCenter}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.macroTag, { color: colors.accent }]}>{meal.protein}g P</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={[styles.macroTag, { color: '#60a5fa' }]}>{meal.carbs}g C</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={[styles.macroTag, { color: '#facc15' }]}>{meal.fat}g F</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={[styles.macroTag, { color: colors.textMuted }]}>{meal.calories} kcal</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.chevron, expanded && styles.chevronOpen]}>›</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.divider} />

          {hasItems && meal.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}

          <View style={styles.macrosGrid}>
            <MacroBox label="Protein" value={`${meal.protein}g`} color={colors.accent} />
            <MacroBox label="Carbs" value={`${meal.carbs}g`} color="#60a5fa" />
            <MacroBox label="Fat" value={`${meal.fat}g`} color="#facc15" />
            <MacroBox label="Calories" value={String(meal.calories)} color={colors.textSecondary} />
          </View>
        </View>
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
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  timeTag: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 66,
    alignItems: 'center',
  },
  timeText: { fontSize: 11, fontWeight: '700', color: colors.accent, letterSpacing: 0.3 },
  headerCenter: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  macroTag: { fontSize: 11, fontWeight: '600' },
  dot: { fontSize: 11, color: colors.textMuted },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconBtn: { padding: 6 },
  editIcon: { fontSize: 16, color: colors.textMuted },
  deleteIcon: { fontSize: 14, color: colors.danger, fontWeight: '700' },
  chevron: {
    fontSize: 22, color: colors.textMuted, marginLeft: 2,
    transform: [{ rotate: '90deg' }],
  },
  chevronOpen: { transform: [{ rotate: '-90deg' }] },

  body: { paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  itemDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 7 },
  itemText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', flex: 1, lineHeight: 20 },
  macrosGrid: {
    flexDirection: 'row', gap: 8, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  macroBox: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 8,
    alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder,
  },
  macroVal: { fontSize: 13, fontWeight: '800' },
  macroLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
});
