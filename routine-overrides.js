(() => {
  const push = window.WORKOUTS?.find(routine => routine.id === "push");
  if (!push) return;

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
})();
