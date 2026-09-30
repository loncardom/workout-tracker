(() => {
  const push = window.WORKOUTS?.find(routine => routine.id === "push");
  if (push) {
    const exerciseId = "incline-dumbbell-bench-press";

    if (!push.exercises.some(exercise => exercise.id === exerciseId)) {
      push.exercises.splice(1, 0, {
        id: exerciseId,
        name: "Incline Dumbbell Bench Press",
        unit: "lb",
        equipment: "Incline bench + dumbbells",
        targetSets: 2,
        reps: "8–12",
        primary: ["Upper chest"],
        secondary: ["Front delts", "Triceps"],
        note: "Use a low incline around 30°. Keep the wrists neutral and only use it if the wrist feels comfortable."
      });
    }

    window.EXERCISE_MEDIA ||= {};
    window.EXERCISE_MEDIA[exerciseId] = {
      imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Dumbbells-dumbbell-incline-bench-press-side.jpg&w=3840",
      sourceUrl: "https://staging.musclewiki.com/exercise/dumbbell-incline-bench-press",
      sourceName: "MuscleWiki",
      caption: "Dumbbell incline bench press"
    };
  }

  const legPressId = "leg-press";
  window.EXERCISE_VARIANTS ||= {};
  window.EXERCISE_VARIANTS[legPressId] = {
    id: legPressId,
    name: "Leg Press",
    unit: "lb",
    equipment: "Leg press machine",
    targetSets: 2,
    reps: "6–10",
    graphic: "squat",
    primary: ["Quads", "Glutes"],
    secondary: ["Hamstrings"],
    note: "Use this when the hack squat is occupied. Keep your hips and lower back against the pad and use a controlled depth."
  };

  for (const routineId of ["lower", "legs"]) {
    const routine = window.WORKOUTS?.find(item => item.id === routineId);
    const hackSquat = routine?.exercises.find(exercise => exercise.id === "hack-squat");
    if (!hackSquat) continue;
    hackSquat.alternativeIds ||= [];
    if (!hackSquat.alternativeIds.includes(legPressId)) hackSquat.alternativeIds.push(legPressId);
  }

  window.EXERCISE_MEDIA ||= {};
  window.EXERCISE_MEDIA["hack-squat"] = {
    imageUrl: "./assets/exercises/hack-squat.gif",
    sourceUrl: "https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/Hack_Squat.json",
    sourceName: "Free Exercise DB",
    caption: "Hack squat machine"
  };

  window.EXERCISE_MEDIA[legPressId] = {
    imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Machine-machine-leg-press-side.jpg&w=3840",
    sourceUrl: "https://musclewiki.com/exercise/machine-leg-press",
    sourceName: "MuscleWiki",
    caption: "Machine leg press"
  };
})();
