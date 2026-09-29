# Workout Tracker project notes

This repository is a mobile-first static workout tracker intended for GitHub Pages.

## Architecture

- Static HTML/CSS/JavaScript. No build step.
- `data.js` contains current routine definitions plus equipment and primary/secondary muscle metadata.
- `app.js` contains workout flow, history, local storage, backup/import, live workout statistics, and exercise-detail sheets.
- `posture.js` and `posture.css` add a dedicated read-only Posture routine/page from the home routine list. Posture prescriptions are fixed and are not written to workout history.
- Workout history is stored only in the browser under `workoutTracker.history.v1`.
- An in-progress workout is stored under `workoutTracker.active.v1`.
- No personal workout data should ever be committed to the repository.

## Workout UX

- The active workout is one scrollable list of all exercises.
- Each exercise shows set number, previous result, weight, reps, and a completion check.
- The header shows duration, completed-set volume, and completed set count.
- Tapping an exercise header opens a detail sheet showing equipment, primary/secondary muscles, and the media slot.
- Each logged exercise has target sets/reps, muscle metadata, equipment, and exercise-specific notes.
- Posture appears as the sixth home-screen routine entry, but opens a separate non-logging page with fixed prescriptions and externally sourced exercise images/GIFs. Alternative posture movements may use horizontal swipe carousels.

## Rules for future changes

1. Treat exercise IDs as stable identifiers.
2. When replacing an exercise with a genuinely different movement, use a new ID.
3. Never delete or rewrite historical workout entries because the current routine changed.
4. Keep the UI mobile-first and usable one-handed.
5. Do not add authentication or a backend unless explicitly requested.
6. Keep paths relative so GitHub project Pages works under `/workout-tracker/`.
7. Increment the service-worker cache name after static changes when clients need a forced refresh.
8. Preserve backwards compatibility with existing local workout history.
9. Keep the Posture routine read-only unless the user explicitly asks to make it loggable.

## Current routine source

The five-day routine is the wrist-conscious Upper / Lower / Push / Pull / Legs plan supplied by the user on 2026-09-23. Preserve its programmed set and rep ranges unless the user explicitly asks to change them.

The Posture routine is a separate fixed-prescription page and currently includes chin tucks, wall slides with reach, face pulls or band external rotations, dead bugs, foam-roller thoracic extensions, and prone thoracic extensions.
