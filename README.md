# Workout Tracker

A mobile-first workout tracker hosted on GitHub Pages.

## Current test build

- Five demo workout days: Upper, Lower, Push, Pull, Legs
- Log weight and reps for each set
- Shows the most recent saved performance for an exercise
- Workout history stays in browser local storage
- JSON export/import backup
- PWA/service-worker support
- No backend and no authentication
- Exercise media currently uses a placeholder until the real routine/media is added

Routine definitions live in `data.js`. Maintenance notes for future ChatGPT changes are in `PROJECT.md`.

## Privacy

The repository and website are public, but workout history is not stored in the repository. It remains in the browser unless explicitly exported by the user.
