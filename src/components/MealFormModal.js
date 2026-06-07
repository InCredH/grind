import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Switch, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { colors } from '../constants/colors';

export default function MealFormModal({ visible, meal, onSave, onClose }) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [calories, setCalories] = useState('');
  const [autoCalc, setAutoCalc] = useState(true);

  useEffect(() => {
    if (!visible) return;
    if (meal) {
      setName(meal.name || '');
      setTime(meal.time || '');
      setItemsText(Array.isArray(meal.items) ? meal.items.join('\n') : (meal.items || ''));
      setProtein(meal.protein != null ? String(meal.protein) : '');
      setCarbs(meal.carbs != null ? String(meal.carbs) : '');
      setFat(meal.fat != null ? String(meal.fat) : '');
      setCalories(meal.calories != null ? String(meal.calories) : '');
    } else {
      setName(''); setTime(''); setItemsText('');
      setProtein(''); setCarbs(''); setFat(''); setCalories('');
    }
    setAutoCalc(true);
  }, [meal, visible]);

  const p = parseFloat(protein) || 0;
  const c = parseFloat(carbs) || 0;
  const f = parseFloat(fat) || 0;
  const calcCal = Math.round(p * 4 + c * 4 + f * 9);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a meal name.');
      return;
    }
    const items = itemsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    onSave({
      id: meal?.id || String(Date.now()),
      name: name.trim(),
      time: time.trim(),
      items,
      protein: p,
      carbs: c,
      fat: f,
      calories: autoCalc ? calcCal : (parseFloat(calories) || 0),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Title */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>{meal ? 'Edit Meal' : 'New Meal'}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Name */}
              <Text style={styles.label}>MEAL NAME *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Breakfast"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
              />

              {/* Time */}
              <Text style={styles.label}>TIME</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="e.g. 7:00 AM"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
              />

              {/* Items */}
              <Text style={styles.label}>ITEMS  <Text style={styles.labelHint}>(one per line)</Text></Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={itemsText}
                onChangeText={setItemsText}
                placeholder={'6 eggs\n2 wheat bread slices\n1.5 tbsp peanut butter'}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />

              {/* Macros row */}
              <Text style={styles.label}>MACROS</Text>
              <View style={styles.macroRow}>
                <View style={styles.macroField}>
                  <TextInput
                    style={[styles.input, styles.macroInput, { borderColor: colors.accent + '66' }]}
                    value={protein}
                    onChangeText={setProtein}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.macroUnit, { color: colors.accent }]}>g protein</Text>
                </View>
                <View style={styles.macroField}>
                  <TextInput
                    style={[styles.input, styles.macroInput, { borderColor: '#60a5fa66' }]}
                    value={carbs}
                    onChangeText={setCarbs}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.macroUnit, { color: '#60a5fa' }]}>g carbs</Text>
                </View>
                <View style={styles.macroField}>
                  <TextInput
                    style={[styles.input, styles.macroInput, { borderColor: '#facc1566' }]}
                    value={fat}
                    onChangeText={setFat}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.macroUnit, { color: '#facc15' }]}>g fat</Text>
                </View>
              </View>

              {/* Calories */}
              <Text style={styles.label}>CALORIES</Text>
              <View style={styles.caloriesRow}>
                <View style={{ flex: 1 }}>
                  {autoCalc ? (
                    <View style={[styles.input, styles.caloriesAuto]}>
                      <Text style={styles.caloriesAutoText}>{calcCal} kcal</Text>
                      <Text style={styles.caloriesAutoHint}>auto-calculated</Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={calories}
                      onChangeText={setCalories}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                    />
                  )}
                </View>
                <View style={styles.autoToggle}>
                  <Text style={styles.autoLabel}>Auto</Text>
                  <Switch
                    value={autoCalc}
                    onValueChange={setAutoCalc}
                    trackColor={{ false: colors.cardBorder, true: 'rgba(249,115,22,0.4)' }}
                    thumbColor={autoCalc ? colors.accent : colors.textMuted}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAVE MEAL</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingTop: 10, maxHeight: '92%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.cardBorder,
    alignSelf: 'center', marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: 0.5 },
  closeText: { fontSize: 20, color: colors.textMuted, fontWeight: '600' },

  form: { paddingHorizontal: 20, paddingBottom: 48 },

  label: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginTop: 20, marginBottom: 8,
  },
  labelHint: { fontSize: 10, color: colors.textMuted, fontWeight: '400', letterSpacing: 0 },

  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: colors.text, fontWeight: '500',
  },
  textArea: { height: 96, paddingTop: 12, textAlignVertical: 'top' },

  macroRow: { flexDirection: 'row', gap: 8 },
  macroField: { flex: 1, alignItems: 'center', gap: 6 },
  macroInput: { width: '100%', textAlign: 'center', paddingHorizontal: 8 },
  macroUnit: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  caloriesRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  caloriesAuto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caloriesAutoText: { fontSize: 16, color: colors.accent, fontWeight: '800' },
  caloriesAutoHint: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  autoToggle: { alignItems: 'center', gap: 4 },
  autoLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  saveBtn: {
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 28,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
