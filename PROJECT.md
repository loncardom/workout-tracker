# Workout Tracker project notes

This repository is a mobile-first static workout tracker intended for GitHub Pages.

## Architecture

- Static HTML/CSS/JavaScript. No build step.
- `data.js` contains the current routine definitions.
- `app.js` contains workout flow, history, local storage, and backup/import logic.
- Workout history is stored only in the browser under `workoutTracker.history.v1`.
- An in-progress workout is stored under `workoutTracker.active.v1`.
- No personal workout data should ever be committed to the repository.

## Rules for future changes

1. Treat exercise IDs as stable identifiers.
2. When replacing an exercise with a genuinely different movement, use a new ID.
3. Never delete or rewrite historical workout entries because the current routine changed.
4. Keep the UI mobile-first and usable one-handed.
5. Do not add authentication or a backend unless explicitly requested.
6. Keep paths relative so GitHub project Pages works under `/workout-tracker/`.
7. Increment the service-worker cache name after static changes when clients need a forced refresh.

## Exercise media

The first test build intentionally uses an animated placeholder. Real GIFs or short exercise clips can later be placed in `assets/exercises/` and referenced from `data.js`.
