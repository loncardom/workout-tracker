window.WORKOUTS = [
  {
    id: "upper",
    name: "Upper",
    description: "Chest, back, shoulders and arms",
    exercises: [
      {
        id: "pec-deck",
        name: "Pec Deck",
        unit: "lb",
        equipment: "Pec deck / chest fly machine",
        targetSets: 2,
        reps: "8–15",
        graphic: "fly",
        primary: ["Chest"],
        secondary: ["Front delts"],
        note: "Prefer a machine that lets the forearms or elbows drive the pads so the wrist stays quiet."
      },
      {
        id: "chest-supported-row",
        name: "Chest-Supported Machine Row",
        unit: "lb",
        equipment: "Chest-supported row machine",
        targetSets: 2,
        reps: "8–12",
        graphic: "row",
        primary: ["Mid back", "Lats"],
        secondary: ["Rear delts", "Biceps"],
        note: "Use a neutral grip if available."
      },
      {
        id: "neutral-pulldown",
        name: "Neutral-Grip Lat Pulldown",
        unit: "lb",
        equipment: "Cable pulldown",
        targetSets: 2,
        reps: "8–12",
        graphic: "pulldown",
        primary: ["Lats"],
        secondary: ["Biceps", "Upper back"],
        note: "Test the neutral handles carefully and stop if the splint or wrist feels pressured."
      },
      {
        id: "lateral-raise-machine",
        name: "Lateral-Raise Machine",
        unit: "lb",
        equipment: "Lateral-raise machine",
        targetSets: 2,
        reps: "10–20",
        graphic: "lateral-raise",
        primary: ["Side delts"],
        secondary: ["Upper traps"],
        note: "A machine with arm or elbow pads minimizes hand involvement."
      },
      {
        id: "triceps-pressdown",
        name: "Triceps Cable Pressdown",
        unit: "lb",
        equipment: "Cable",
        targetSets: 2,
        reps: "10–15",
        graphic: "pushdown",
        primary: ["Triceps"],
        secondary: [],
        note: "Only keep this if the handle and splint combination feels normal."
      }
    ]
  },
  {
    id: "lower",
    name: "Lower",
    description: "Quads, hamstrings, glutes and calves",
    exercises: [
      {
        id: "hack-squat",
        name: "Hack Squat",
        unit: "lb",
        equipment: "Hack squat machine",
        targetSets: 2,
        reps: "6–10",
        graphic: "squat",
        primary: ["Quads", "Glutes"],
        secondary: ["Hamstrings"],
        note: "Keep 1–2 reps in reserve on these heavier sets."
      },
      {
        id: "leg-extension",
        name: "Leg Extension",
        unit: "lb",
        equipment: "Leg extension machine",
        targetSets: 2,
        reps: "10–15",
        graphic: "leg-extension",
        primary: ["Quads"],
        secondary: []
      },
      {
        id: "seated-leg-curl",
        name: "Seated / Lying Leg Curl",
        unit: "lb",
        equipment: "Leg curl machine",
        targetSets: 2,
        reps: "8–15",
        graphic: "leg-curl",
        primary: ["Hamstrings"],
        secondary: ["Calves"]
      },
      {
        id: "hip-thrust-machine",
        name: "Hip-Thrust Machine",
        unit: "lb",
        equipment: "Hip-thrust / glute-drive machine",
        targetSets: 2,
        reps: "8–12",
        graphic: "hip-thrust",
        primary: ["Glutes"],
        secondary: ["Hamstrings"]
      },
      {
        id: "calf-raise",
        name: "Standing / Seated Calf Raise",
        unit: "lb",
        equipment: "Calf raise machine",
        targetSets: 2,
        reps: "10–15",
        graphic: "calf-raise",
        primary: ["Calves"],
        secondary: []
      }
    ]
  },
  {
    id: "push",
    name: "Push",
    description: "Chest, shoulders and triceps",
    exercises: [
      {
        id: "pec-deck",
        name: "Pec Deck",
        unit: "lb",
        equipment: "Pec deck / chest fly machine",
        targetSets: 3,
        reps: "8–15",
        graphic: "fly",
        primary: ["Chest"],
        secondary: ["Front delts"],
        note: "If you later find a neutral-grip chest-press machine that is fully comfortable, it can replace one pec-deck set block."
      },
      {
        id: "lateral-raise-machine",
        name: "Lateral Raise (Machine / Forearm Cuff)",
        unit: "lb",
        equipment: "Lateral-raise machine or cable with forearm cuff",
        targetSets: 3,
        reps: "10–20",
        graphic: "lateral-raise",
        primary: ["Side delts"],
        secondary: ["Upper traps"]
      },
      {
        id: "cuff-front-raise",
        name: "Cable / Cuff Front Raise",
        unit: "lb",
        equipment: "Cable with cuff",
        targetSets: 2,
        reps: "10–15",
        graphic: "front-raise",
        primary: ["Front delts"],
        secondary: ["Upper chest"]
      },
      {
        id: "triceps-pressdown",
        name: "Triceps Pressdown",
        unit: "lb",
        equipment: "Cable",
        targetSets: 2,
        reps: "10–15",
        graphic: "pushdown",
        primary: ["Triceps"],
        secondary: [],
        note: "Skip it if gripping the attachment interferes with the splint."
      }
    ]
  },
  {
    id: "pull",
    name: "Pull",
    description: "Back, rear delts and biceps",
    exercises: [
      {
        id: "neutral-pulldown",
        name: "Neutral-Grip Lat Pulldown",
        unit: "lb",
        equipment: "Cable pulldown",
        targetSets: 3,
        reps: "8–12",
        graphic: "pulldown",
        primary: ["Lats"],
        secondary: ["Biceps", "Upper back"],
        note: "Prefer neutral handles."
      },
      {
        id: "chest-supported-row",
        name: "Chest-Supported Machine Row",
        unit: "lb",
        equipment: "Chest-supported row machine",
        targetSets: 3,
        reps: "8–12",
        graphic: "row",
        primary: ["Mid back", "Lats"],
        secondary: ["Rear delts", "Biceps"],
        note: "Use a neutral grip if possible."
      },
      {
        id: "reverse-pec-deck",
        name: "Reverse Pec Deck",
        unit: "lb",
        equipment: "Reverse pec-deck machine",
        targetSets: 2,
        reps: "10–20",
        graphic: "reverse-fly",
        primary: ["Rear delts"],
        secondary: ["Upper back"]
      },
      {
        id: "forearm-cuff-curl",
        name: "Biceps Curl Using Forearm Cuff",
        unit: "lb",
        equipment: "Cable with forearm cuff",
        targetSets: 2,
        reps: "10–15",
        graphic: "curl",
        primary: ["Biceps"],
        secondary: ["Brachialis"],
        optional: true,
        note: "Optional. If the cuff setup does not work mechanically, skip direct biceps for now; rows and pulldowns still train them."
      }
    ]
  },
  {
    id: "legs",
    name: "Legs",
    description: "Second lower-body exposure",
    exercises: [
      {
        id: "hack-squat",
        name: "Hack Squat",
        unit: "lb",
        equipment: "Hack squat machine",
        targetSets: 2,
        reps: "6–10",
        graphic: "squat",
        primary: ["Quads", "Glutes"],
        secondary: ["Hamstrings"],
        note: "A belt squat is a good substitute if your gym has one."
      },
      {
        id: "leg-extension",
        name: "Leg Extension",
        unit: "lb",
        equipment: "Leg extension machine",
        targetSets: 2,
        reps: "10–15",
        graphic: "leg-extension",
        primary: ["Quads"],
        secondary: []
      },
      {
        id: "lying-leg-curl",
        name: "Leg Curl",
        unit: "lb",
        equipment: "Seated or lying leg curl machine",
        targetSets: 2,
        reps: "8–15",
        graphic: "leg-curl",
        primary: ["Hamstrings"],
        secondary: ["Calves"]
      },
      {
        id: "hip-thrust-machine",
        name: "Hip-Thrust Machine / Back Extension",
        unit: "lb",
        equipment: "Hip-thrust machine or back-extension station",
        targetSets: 2,
        reps: "8–15",
        graphic: "hip-thrust",
        primary: ["Glutes"],
        secondary: ["Hamstrings", "Lower back"]
      },
      {
        id: "calf-raise",
        name: "Calf Raise",
        unit: "lb",
        equipment: "Calf raise machine",
        targetSets: 2,
        reps: "10–15",
        graphic: "calf-raise",
        primary: ["Calves"],
        secondary: []
      }
    ]
  }
];

window.EXERCISE_MEDIA = {
  "pec-deck": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-machine-bent-arm-pec-fly-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/pt-br/exercise/machine-bent-arm-pec-fly",
    sourceName: "MuscleWiki",
    caption: "Machine bent-arm pec fly / pec deck"
  },
  "chest-supported-row": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-machine-chest-supported-t-bar-row-front.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/de-de/exercise/machine-chest-supported-t-bar-row",
    sourceName: "MuscleWiki",
    caption: "Chest-supported machine row"
  },
  "neutral-pulldown": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-neutral-pulldown-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/hi-in/exercise/neutral-pulldown",
    sourceName: "MuscleWiki",
    caption: "Neutral-grip pulldown"
  },
  "lateral-raise-machine": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-machine-standing-lateral-raise-front.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/de-de/exercise/machine-standing-lateral-raise",
    sourceName: "MuscleWiki",
    caption: "Machine lateral raise"
  },
  "triceps-pressdown": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Cables-cable-push-down-front.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/cable-rope-pushdown",
    sourceName: "MuscleWiki",
    caption: "Cable triceps pushdown"
  },
  "hack-squat": {
    imageUrl: "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/04/hack-squat-machine.gif?resize=600%2C600&ssl=1",
    sourceUrl: "https://www.strengthlog.com/hack-squat-machine/",
    sourceName: "StrengthLog",
    caption: "Hack squat machine"
  },
  "leg-extension": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-machine-leg-extension-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/machine-leg-extension?model=m",
    sourceName: "MuscleWiki",
    caption: "Machine leg extension"
  },
  "seated-leg-curl": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-seated-leg-curl-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/seated-leg-curl",
    sourceName: "MuscleWiki",
    caption: "Seated leg curl"
  },
  "lying-leg-curl": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-seated-leg-curl-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/seated-leg-curl",
    sourceName: "MuscleWiki",
    caption: "Leg curl movement reference"
  },
  "hip-thrust-machine": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-machine-hip-thrust-front.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/machine-hip-thrust",
    sourceName: "MuscleWiki",
    caption: "Machine hip thrust"
  },
  "calf-raise": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-machine-standing-calf-raises-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercises/calves",
    sourceName: "MuscleWiki",
    caption: "Machine standing calf raise"
  },
  "cuff-front-raise": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-plate-front-raise-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/plate-front-raise",
    sourceName: "MuscleWiki",
    caption: "Front-raise movement reference"
  },
  "reverse-pec-deck": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-machine-reverse-fly-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/fa-ir/exercise/machine-reverse-fly",
    sourceName: "MuscleWiki",
    caption: "Machine reverse fly / reverse pec deck"
  },
  "forearm-cuff-curl": {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Cables-cable-bilateral-high-cable-curl-front.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/cable-bilateral-high-cable-curl",
    sourceName: "MuscleWiki",
    caption: "Cable curl movement reference; use your forearm cuff instead of gripping"
  }
};
