// Day index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_FULL_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WORKOUT_SCHEDULE = {
  0: {
    name: 'Push A',
    tag: 'PUSH',
    muscles: 'Chest · Shoulders · Triceps',
    isRest: false,
    exercises: [
      { name: 'Flat Barbell Bench Press', sets: 4, repRange: '6–8' },
      { name: 'Incline Dumbbell Press', sets: 3, repRange: '8–10' },
      { name: 'Overhead Press (Barbell)', sets: 4, repRange: '6–8' },
      { name: 'Lateral Raises', sets: 3, repRange: '12–15' },
      { name: 'Cable Chest Fly', sets: 3, repRange: '12–15' },
      { name: 'Tricep Pushdown (Rope)', sets: 3, repRange: '10–12' },
    ],
  },
  1: {
    name: 'Pull A',
    tag: 'PULL',
    muscles: 'Back · Biceps · Rear Delts',
    isRest: false,
    exercises: [
      { name: 'Deadlift', sets: 4, repRange: '4–6' },
      { name: 'Barbell Row', sets: 4, repRange: '6–8' },
      { name: 'Lat Pulldown (Wide Grip)', sets: 3, repRange: '8–10' },
      { name: 'Face Pulls', sets: 3, repRange: '15–20' },
      { name: 'Incline Dumbbell Curl', sets: 3, repRange: '10–12' },
      { name: 'Hammer Curl', sets: 2, repRange: '12' },
    ],
  },
  2: {
    name: 'Legs',
    tag: 'LEGS',
    muscles: 'Quads · Hamstrings · Glutes · Calves',
    isRest: false,
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, repRange: '6–8' },
      { name: 'Romanian Deadlift', sets: 3, repRange: '8–10' },
      { name: 'Leg Press', sets: 3, repRange: '10–12' },
      { name: 'Leg Curl (Machine)', sets: 3, repRange: '10–12' },
      { name: 'Walking Lunges', sets: 3, repRange: '10/leg' },
      { name: 'Standing Calf Raise', sets: 4, repRange: '15–20' },
    ],
  },
  3: {
    name: 'Rest',
    tag: 'REST',
    muscles: 'Recovery',
    isRest: true,
    activities: [
      '30 min brisk walk or 20 min low-intensity cycling',
      'Mobility & stretching',
      'Prioritise 7–9 hrs sleep',
    ],
  },
  4: {
    name: 'Push B',
    tag: 'PUSH',
    muscles: 'Chest · Shoulders · Triceps',
    isRest: false,
    exercises: [
      { name: 'Incline Barbell Bench Press', sets: 4, repRange: '6–8' },
      { name: 'Flat Dumbbell Press', sets: 3, repRange: '8–10' },
      { name: 'Arnold Press', sets: 3, repRange: '10–12' },
      { name: 'Cable Lateral Raise', sets: 3, repRange: '12–15' },
      { name: 'Overhead Tricep Extension', sets: 3, repRange: '10–12' },
      { name: 'Dips (Weighted)', sets: 3, repRange: '8–10' },
    ],
  },
  5: {
    name: 'Pull B',
    tag: 'PULL',
    muscles: 'Back · Biceps · Rear Delts',
    isRest: false,
    exercises: [
      { name: 'Pull-Ups / Weighted Pull-Ups', sets: 4, repRange: '6–8' },
      { name: 'Seated Cable Row', sets: 4, repRange: '8–10' },
      { name: 'Single-Arm DB Row', sets: 3, repRange: '10/arm' },
      { name: 'Reverse Fly (Machine/Cable)', sets: 3, repRange: '15' },
      { name: 'EZ Bar Curl', sets: 3, repRange: '8–10' },
      { name: 'Cable Curl', sets: 2, repRange: '12–15' },
    ],
  },
  6: {
    name: 'Rest',
    tag: 'REST',
    muscles: 'Recovery',
    isRest: true,
    activities: [
      'Full rest day',
      'Light stretching or yoga',
      'Prioritise sleep & recovery',
    ],
  },
};
