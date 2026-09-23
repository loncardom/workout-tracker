(() => {
  const HISTORY_KEY = "workoutTracker.history.v1";
  const ACTIVE_KEY = "workoutTracker.active.v1";
  const app = document.getElementById("app");
  const pageTitle = document.getElementById("pageTitle");
  const backButton = document.getElementById("backButton");
  const menuButton = document.getElementById("menuButton");
  const importFile = document.getElementById("importFile");
  const toast = document.getElementById("toast");

  let view = "home";
  let active = load(ACTIVE_KEY, null);

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getHistory() {
    return load(HISTORY_KEY, []);
  }

  function flash(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(flash.timer);
    flash.timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function setChrome(title, canBack = false) {
    pageTitle.textContent = title;
    backButton.classList.toggle("hidden", !canBack);
  }

  function formatDate(iso) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short", day: "numeric", year: "numeric"
    }).format(new Date(iso));
  }

  function lastRoutineSession(routineId) {
    return getHistory().find(item => item.routineId === routineId);
  }

  function lastExercisePerformance(exerciseId) {
    for (const session of getHistory()) {
      const found = session.exercises.find(ex => ex.exerciseId === exerciseId && ex.sets.length);
      if (found) return found;
    }
    return null;
  }

  function renderHome() {
    view = "home";
    setChrome("Workout Tracker", false);
    const history = getHistory();

    app.innerHTML = `
      <section class="hero">
        <h2>Pick a workout</h2>
        <p>Your workout history stays only in this browser unless you export it.</p>
      </section>

      ${active ? `
        <div class="card">
          <h3>Workout in progress</h3>
          <p class="muted">${esc(active.routineName)} · exercise ${active.exerciseIndex + 1} of ${active.exercises.length}</p>
          <div class="actions">
            <button class="button primary" id="resumeWorkout">Resume workout</button>
            <button class="button danger" id="discardWorkout">Discard workout</button>
          </div>
        </div>
      ` : ""}

      <div class="section-title">5-day routine</div>
      <div class="stack">
        ${window.WORKOUTS.map(routine => {
          const last = lastRoutineSession(routine.id);
          return `
            <button class="routine-card" data-routine="${esc(routine.id)}">
              <div>
                <h3>${esc(routine.name)}</h3>
                <p>${esc(routine.description)} · ${routine.exercises.length} exercises${last ? ` · last ${formatDate(last.completedAt)}` : ""}</p>
              </div>
              <span class="chevron">›</span>
            </button>
          `;
        }).join("")}
      </div>

      ${history.length ? `
        <div class="section-title">Recent</div>
        <button class="card routine-card" id="openHistory">
          <div>
            <h3>${esc(history[0].routineName)}</h3>
            <p>${formatDate(history[0].completedAt)} · ${history[0].exercises.length} exercises</p>
          </div>
          <span class="chevron">›</span>
        </button>
      ` : ""}
    `;

    document.querySelectorAll("[data-routine]").forEach(btn => {
      btn.addEventListener("click", () => startWorkout(btn.dataset.routine));
    });

    document.getElementById("resumeWorkout")?.addEventListener("click", renderWorkout);
    document.getElementById("discardWorkout")?.addEventListener("click", () => {
      if (confirm("Discard the workout in progress?")) {
        active = null;
        localStorage.removeItem(ACTIVE_KEY);
        renderHome();
      }
    });
    document.getElementById("openHistory")?.addEventListener("click", renderHistory);
  }

  function startWorkout(routineId) {
    const routine = window.WORKOUTS.find(item => item.id === routineId);
    if (!routine) return;
    if (active && !confirm("Replace the workout currently in progress?")) return;

    active = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      routineId: routine.id,
      routineName: routine.name,
      startedAt: new Date().toISOString(),
      exerciseIndex: 0,
      exercises: routine.exercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        target: ex.target,
        unit: ex.unit,
        sets: []
      }))
    };

    save(ACTIVE_KEY, active);
    renderWorkout();
  }

  function renderWorkout() {
    if (!active) return renderHome();

    view = "workout";
    setChrome(active.routineName, true);

    const index = active.exerciseIndex;
    const ex = active.exercises[index];
    const previous = lastExercisePerformance(ex.exerciseId);

    app.innerHTML = `
      <section class="workout-head">
        <div class="progress">
          ${active.exercises.map((_, i) => `<span class="${i <= index ? "done" : ""}"></span>`).join("")}
        </div>
        <h2 class="exercise-title">${esc(ex.name)}</h2>
        <div class="exercise-meta">${esc(ex.target)} · Exercise ${index + 1} of ${active.exercises.length}</div>
      </section>

      <div class="demo" aria-label="Exercise media placeholder"></div>

      <div class="previous">
        <strong>LAST TIME</strong>
        ${previous
          ? previous.sets.map(s => `${esc(s.weight)} ${esc(ex.unit)} × ${esc(s.reps)}`).join(" · ")
          : "No previous sets recorded."}
      </div>

      <div class="section-title">Today</div>
      <div class="set-list">
        ${ex.sets.length
          ? ex.sets.map((s, i) => `
              <div class="set-row">
                <span class="set-num">SET ${i + 1}</span>
                <span class="set-value">${esc(s.weight)} ${esc(ex.unit)} × ${esc(s.reps)}</span>
                <button class="remove-set" data-remove-set="${i}" aria-label="Remove set">×</button>
              </div>
            `).join("")
          : `<div class="note">No sets added yet.</div>`}
      </div>

      <div class="input-grid">
        <div class="field">
          <label for="weightInput">WEIGHT (${esc(ex.unit)})</label>
          <input id="weightInput" inputmode="decimal" type="number" min="0" step="0.5" placeholder="0">
        </div>
        <div class="field">
          <label for="repsInput">REPS</label>
          <input id="repsInput" inputmode="numeric" type="number" min="1" step="1" placeholder="0">
        </div>
      </div>

      <div class="actions">
        <button class="button secondary" id="addSet">Add set</button>
        <button class="button primary" id="nextExercise">
          ${index === active.exercises.length - 1 ? "Finish workout" : "Next exercise"}
        </button>
      </div>
    `;

    const weightInput = document.getElementById("weightInput");
    const repsInput = document.getElementById("repsInput");
    const reference = ex.sets.at(-1) || previous?.sets?.[0];

    if (reference) {
      weightInput.value = reference.weight ?? "";
      repsInput.value = reference.reps ?? "";
    }

    function addSet() {
      const weight = Number(weightInput.value);
      const reps = Number(repsInput.value);

      if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 1) {
        flash("Enter a valid weight and reps");
        return;
      }

      ex.sets.push({ weight, reps });
      save(ACTIVE_KEY, active);
      renderWorkout();
    }

    document.getElementById("addSet").addEventListener("click", addSet);
    repsInput.addEventListener("keydown", event => {
      if (event.key === "Enter") addSet();
    });

    document.querySelectorAll("[data-remove-set]").forEach(btn => {
      btn.addEventListener("click", () => {
        ex.sets.splice(Number(btn.dataset.removeSet), 1);
        save(ACTIVE_KEY, active);
        renderWorkout();
      });
    });

    document.getElementById("nextExercise").addEventListener("click", () => {
      if (index === active.exercises.length - 1) {
        finishWorkout();
      } else {
        active.exerciseIndex += 1;
        save(ACTIVE_KEY, active);
        renderWorkout();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function finishWorkout() {
    const history = getHistory();

    history.unshift({
      id: active.id,
      routineId: active.routineId,
      routineName: active.routineName,
      startedAt: active.startedAt,
      completedAt: new Date().toISOString(),
      exercises: active.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        unit: ex.unit,
        sets: ex.sets
      }))
    });

    save(HISTORY_KEY, history);
    active = null;
    localStorage.removeItem(ACTIVE_KEY);
    flash("Workout saved");
    renderHistory();
  }

  function renderHistory() {
    view = "history";
    setChrome("History", true);
    const history = getHistory();

    app.innerHTML = `
      <section class="hero">
        <h2>Workout history</h2>
        <p>${history.length
          ? `${history.length} saved workout${history.length === 1 ? "" : "s"} on this device.`
          : "No workouts saved yet."}</p>
      </section>
      <div class="stack">
        ${history.map(session => `
          <article class="card history-item">
            <div class="history-top">
              <h3>${esc(session.routineName)}</h3>
              <span class="history-date">${formatDate(session.completedAt)}</span>
            </div>
            ${session.exercises.map(ex => `
              <div class="exercise-summary">
                <strong>${esc(ex.name)}</strong><br>
                ${ex.sets.length
                  ? ex.sets.map(s => `${esc(s.weight)} ${esc(ex.unit)} × ${esc(s.reps)}`).join(" · ")
                  : "No sets recorded"}
              </div>
            `).join("")}
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderSettings() {
    view = "settings";
    setChrome("Settings", true);
    const count = getHistory().length;

    app.innerHTML = `
      <section class="hero">
        <h2>Data & backup</h2>
        <p>Your history is stored in this browser's local storage. Nothing is sent to GitHub.</p>
      </section>

      <div class="card setting-row">
        <h3>Backup</h3>
        <p class="muted">${count} saved workout${count === 1 ? "" : "s"}.</p>
        <button class="button primary" id="exportData">Export JSON backup</button>
        <button class="button secondary" id="importData">Import JSON backup</button>
      </div>

      <div class="section-title">Danger zone</div>
      <div class="card setting-row">
        <button class="button danger" id="clearHistory">Clear workout history</button>
      </div>

      <p class="note">Deleting browser data, using private browsing, or changing devices can remove local history. Export a backup occasionally.</p>
    `;

    document.getElementById("exportData").addEventListener("click", () => {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        history: getHistory()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workout-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("importData").addEventListener("click", () => importFile.click());

    document.getElementById("clearHistory").addEventListener("click", () => {
      if (confirm("Permanently clear all workout history on this device?")) {
        localStorage.removeItem(HISTORY_KEY);
        flash("History cleared");
        renderSettings();
      }
    });
  }

  importFile.addEventListener("change", async () => {
    const file = importFile.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      if (!data || data.version !== 1 || !Array.isArray(data.history)) {
        throw new Error("Bad backup");
      }

      if (confirm(`Import ${data.history.length} workouts and replace the history currently on this device?`)) {
        save(HISTORY_KEY, data.history);
        flash("Backup imported");
        renderSettings();
      }
    } catch {
      alert("That file is not a valid Workout Tracker backup.");
    } finally {
      importFile.value = "";
    }
  });

  backButton.addEventListener("click", renderHome);
  menuButton.addEventListener("click", renderSettings);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  renderHome();
})();