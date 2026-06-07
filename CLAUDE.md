# GRIND — Fitness App

## About the User
- Name: Harsh
- 81kg bodyweight, 178cm
- 3 years of lifting experience
- Goal: Body recomposition (lose fat, build muscle simultaneously)
- Based in Pune, India
- Has access to a full gym (barbells, cables, machines — everything)

---

## Diet Plan

### Daily Targets
- Calories: ~2,370 kcal (deficit of ~230 from TDEE of 2,600)
- Protein: ~152g
- Carbs: ~180g
- Fat: ~75g

### Meal Schedule
| Time | Meal | Key Items | Protein | Calories |
|------|------|-----------|---------|----------|
| 7:00 AM | Breakfast | 6 eggs, 2 wheat bread slices, 1.5 tbsp PB | 48g | 734 |
| 10:30 AM | Mid-Morning | 1 scoop whey, 1 banana | 25g | 235 |
| 1:00 PM | Lunch | 150g chicken/fish, 1 cup rice, sabzi/dal | 44g | 475 |
| 4:00 PM | Evening Snack | 200g Greek yogurt, 20g almonds | 16g | 255 |
| 7:30 PM | Dinner | 1 scoop whey, 2 chapati, dal/sabzi | 35g | 425 |

### Notes
- Alternate chicken and fish daily at lunch (Rohu, Surmai, Bangda)
- On rest days: reduce rice to half a cup
- Drink 3-4L water daily

---

## Supplement Stack
| Supplement | Dose | Timing |
|-----------|------|--------|
| Creatine | 5g | Any time, daily |
| Magnesium Glycinate | 300-400mg | 30-60 min before bed |
| Omega-3 | 2-3g EPA+DHA | With a meal, daily |
| Vitamin D3 | 2000-4000 IU | Morning, with food |

---

## Training Split — PPL x2 (5 days/week)

### Schedule
| Day | Session | Muscle Groups |
|-----|---------|---------------|
| Monday | Push A | Chest, Shoulders, Triceps |
| Tuesday | Pull A | Back, Biceps, Rear Delts |
| Wednesday | Legs | Quads, Hamstrings, Glutes, Calves |
| Thursday | Rest | Active recovery / cardio |
| Friday | Push B | Chest, Shoulders, Triceps (variation) |
| Saturday | Pull B | Back, Biceps, Rear Delts (variation) |
| Sunday | Rest | Full recovery |

### Exercise List

#### Monday — Push A
1. Flat Barbell Bench Press — 4×6–8
2. Incline Dumbbell Press — 3×8–10
3. Overhead Press (Barbell) — 4×6–8
4. Lateral Raises — 3×12–15
5. Cable Chest Fly — 3×12–15
6. Tricep Pushdown (rope) — 3×10–12

#### Tuesday — Pull A
1. Deadlift — 4×4–6
2. Barbell Row — 4×6–8
3. Lat Pulldown (wide grip) — 3×8–10
4. Face Pulls — 3×15–20
5. Incline Dumbbell Curl — 3×10–12
6. Hammer Curl — 2×12

#### Wednesday — Legs
1. Barbell Back Squat — 4×6–8
2. Romanian Deadlift — 3×8–10
3. Leg Press — 3×10–12
4. Leg Curl (machine) — 3×10–12
5. Walking Lunges — 3×10 each leg
6. Standing Calf Raise — 4×15–20

#### Thursday — Rest / Active Recovery
- 30 min brisk walk or 20 min low intensity cycling
- Mobility / stretching
- Prioritise sleep

#### Friday — Push B (variation day)
1. Incline Barbell Bench Press — 4×6–8
2. Flat Dumbbell Press — 3×8–10
3. Arnold Press — 3×10–12
4. Cable Lateral Raise — 3×12–15
5. Overhead Tricep Extension — 3×10–12
6. Dips (weighted if possible) — 3×8–10

#### Saturday — Pull B (variation day)
1. Pull-Ups / Weighted Pull-Ups — 4×6–8
2. Seated Cable Row — 4×8–10
3. Single-arm DB Row — 3×10 each
4. Reverse Fly (machine/cable) — 3×15
5. EZ Bar Curl — 3×8–10
6. Cable Curl — 2×12–15

#### Sunday — Full Rest

### Progressive Overload Rules
- Hit top of rep range on ALL sets → add weight next session
- Miss reps → keep same weight until all sets are clean
- Log every session without exception
- Rest 2-3 min between heavy compounds, 60-90s on isolation

---

## App Requirements

### Screens
1. **Home** — today's workout, macro summary, deficit tracker, supplement status, quick actions
2. **Training Logger** — 4-week tracker, week tabs, day tabs, per-exercise weight/reps/notes input, previous week comparison
3. **Meal Plan** — expandable meals with macro breakdown, daily totals
4. **Supplements** — tap to check off each supplement, 7-day compliance history
5. **Progress** — weight log with delta tracking, weekly weigh-in reminders

### Design Preferences
- Dark theme, minimal, clean
- Mobile-first (Android, Expo Go)
- Bold typography for numbers and headings
- Orange as primary accent color (#f97316)
- Data persists locally (AsyncStorage)

### Tech Stack
- Expo (React Native)
- React Navigation (bottom tabs)
- AsyncStorage for persistence
- expo-notifications for supplement reminders

### Development Notes
- Build one screen at a time, get feedback before moving on
- Harsh will test on real Android device via Expo Go
- Harsh will give specific UI feedback — implement changes immediately
- Keep components modular so individual screens are easy to edit
- Start with: Training Logger screen (most complex, most used)