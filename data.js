window.WORKOUTS = [
  {
    id: "upper",
    name: "Upper",
    description: "Chest, back, shoulders and arms",
    exercises: [
      { id: "machine-chest-press", name: "Machine Chest Press", unit: "lb", equipment: "Machine", primary: ["Chest"], secondary: ["Front delts", "Triceps"] },
      { id: "lat-pulldown", name: "Lat Pulldown", unit: "lb", equipment: "Cable", primary: ["Lats"], secondary: ["Biceps", "Upper back"] },
      { id: "seated-cable-row", name: "Seated Cable Row", unit: "lb", equipment: "Cable", primary: ["Mid back", "Lats"], secondary: ["Biceps", "Rear delts"] },
      { id: "cable-lateral-raise", name: "Cable Lateral Raise", unit: "lb", equipment: "Cable", primary: ["Side delts"], secondary: ["Upper traps"] }
    ]
  },
  {
    id: "lower",
    name: "Lower",
    description: "Quads, hamstrings, glutes and calves",
    exercises: [
      { id: "leg-press", name: "Leg Press", unit: "lb", equipment: "Machine", primary: ["Quads", "Glutes"], secondary: ["Hamstrings"] },
      { id: "seated-leg-curl", name: "Seated Leg Curl", unit: "lb", equipment: "Machine", primary: ["Hamstrings"], secondary: ["Calves"] },
      { id: "leg-extension", name: "Leg Extension", unit: "lb", equipment: "Machine", primary: ["Quads"], secondary: [] },
      { id: "calf-raise", name: "Calf Raise", unit: "lb", equipment: "Machine", primary: ["Calves"], secondary: [] }
    ]
  },
  {
    id: "push",
    name: "Push",
    description: "Chest, shoulders and triceps",
    exercises: [
      { id: "pec-deck", name: "Pec Deck", unit: "lb", equipment: "Machine", primary: ["Chest"], secondary: ["Front delts"] },
      { id: "machine-shoulder-press", name: "Machine Shoulder Press", unit: "lb", equipment: "Machine", primary: ["Front delts", "Side delts"], secondary: ["Triceps", "Upper chest"] },
      { id: "cable-lateral-raise", name: "Cable Lateral Raise", unit: "lb", equipment: "Cable", primary: ["Side delts"], secondary: ["Upper traps"] },
      { id: "rope-pushdown", name: "Rope Triceps Pushdown", unit: "lb", equipment: "Cable", primary: ["Triceps"], secondary: [] }
    ]
  },
  {
    id: "pull",
    name: "Pull",
    description: "Back, rear delts and biceps",
    exercises: [
      { id: "neutral-pulldown", name: "Neutral-Grip Pulldown", unit: "lb", equipment: "Cable", primary: ["Lats"], secondary: ["Biceps", "Upper back"] },
      { id: "chest-supported-row", name: "Chest-Supported Row", unit: "lb", equipment: "Machine / Dumbbells", primary: ["Mid back", "Lats"], secondary: ["Rear delts", "Biceps"] },
      { id: "reverse-pec-deck", name: "Reverse Pec Deck", unit: "lb", equipment: "Machine", primary: ["Rear delts"], secondary: ["Upper back"] },
      { id: "cable-curl", name: "Cable Curl", unit: "lb", equipment: "Cable", primary: ["Biceps"], secondary: ["Forearms"] }
    ]
  },
  {
    id: "legs",
    name: "Legs",
    description: "A second lower-body day",
    exercises: [
      { id: "hack-squat", name: "Hack Squat", unit: "lb", equipment: "Machine", primary: ["Quads", "Glutes"], secondary: ["Hamstrings"] },
      { id: "romanian-deadlift", name: "Romanian Deadlift", unit: "lb", equipment: "Barbell / Dumbbells", primary: ["Hamstrings", "Glutes"], secondary: ["Lower back", "Forearms"] },
      { id: "lying-leg-curl", name: "Lying Leg Curl", unit: "lb", equipment: "Machine", primary: ["Hamstrings"], secondary: ["Calves"] },
      { id: "calf-raise", name: "Calf Raise", unit: "lb", equipment: "Machine", primary: ["Calves"], secondary: [] }
    ]
  }
];