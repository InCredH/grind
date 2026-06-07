import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function SetRow({ setNumber, weight, reps, done, onWeightChange, onRepsChange, onToggleDone, onRemove }) {
  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Text style={[styles.setLabel, done && styles.setLabelDone]}>
        {setNumber}
      </Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, done && styles.inputDone]}
          value={weight}
          onChangeText={onWeightChange}
          placeholder="—"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          returnKeyType="next"
          selectTextOnFocus
        />
        <Text style={styles.inputUnit}>kg</Text>
      </View>

      <Text style={styles.separator}>×</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.inputReps, done && styles.inputDone]}
          value={reps}
          onChangeText={onRepsChange}
          placeholder="—"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
        />
        <Text style={styles.inputUnit}>reps</Text>
      </View>

      <TouchableOpacity style={[styles.doneBtn, done && styles.doneBtnActive]} onPress={onToggleDone}>
        <Text style={[styles.doneBtnText, done && styles.doneBtnTextActive]}>
          {done ? '✓' : '○'}
        </Text>
      </TouchableOpacity>

      {onRemove && (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeBtnText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  rowDone: {
    backgroundColor: colors.successDim,
  },
  setLabel: {
    width: 22,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  setLabelDone: {
    color: colors.success,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    width: 58,
    textAlign: 'center',
  },
  inputReps: {
    width: 48,
  },
  inputDone: {
    borderColor: colors.success,
    color: colors.success,
  },
  inputUnit: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  doneBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  doneBtnActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  doneBtnText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
    lineHeight: 20,
  },
  doneBtnTextActive: {
    color: '#fff',
  },
  removeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
