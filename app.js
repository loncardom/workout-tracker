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
  let statsTimer = null;
  let active = hydrateActive(load(ACTIVE_KEY, null));

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
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

  function findDefinition(exerciseId) {
    for (const routine of window.WORKOUTS) {
      const found = routine.exercises.find(ex => ex.id === exerciseId);
      if (found) return found;
    }
    return null;
  }

  function emptySet(source = {}) {
    return {
      weight: source.weight ?? "",
      reps: source.reps ?? "",
      completed: Boolean(source.completed)
    };
  }

  function hydrateActive(session) {
    if (!session?.exercises) return session;

    session.exercises = session.exercises.map(ex => {
      const def = findDefinition(ex.exerciseId) || {};
      const existing = Array.isArray(ex.sets) ? ex.sets : [];
      const sets = existing.length
        ? existing.map(s => ({
            weight: s.weight ?? "",
            reps: s.reps ?? "",
            completed: s.completed ?? true
          }))
        : [emptySet(), emptySet(), emptySet()];

      return {
        exerciseId: ex.exerciseId,
        name: ex.name || def.name || "Exercise",
        unit: ex.unit || def.unit || "lb",
        equipment: ex.equipment || def.equipment || "",
        primary: ex.primary || def.primary || [ex.target].filter(Boolean),
        secondary: ex.secondary || def.secondary || [],
        sets
      };
    });

    return session;
  }

  function flash(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(flash.timer);
    flash.timer = setTimeout(() => toast.classList.remove("show"), 1700);
  }

  function stopStatsTimer() {
    if (statsTimer) clearInterval(statsTimer);
    statsTimer = null;
  }

  function setChrome(title, canBack = false, finish = false) {
    pageTitle.textContent = title;
    backButton.classList.toggle("hidden", !canBack);
    menuButton.classList.toggle("finish-button", finish);
    menuButton.textContent = finish ? "Finish" : "⚙";
    menuButton.setAttribute("aria-label", finish ? "Finish workout" : "Open settings");
  }

  function formatDate(iso) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short", day: "numeric", year: "numeric"
    }).format(new Date(iso));
  }

  function formatDuration(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return minutes ? ${minutes} + ":" + String(rest).padStart(2, "0") : ${rest} + "s";
  }

  function lastRoutineSession(routineId) {
    return getHistory().find(item => item.routineId === routineId);
  }

  function lastExercisePerformance(exerciseId) {
    for (const session of getHistory()) {
      const found = session.exercises?.find(ex => ex.exerciseId === exerciseId && ex.sets?.length);
      if (found) return found;
    }
    return null;
  }

  function previousSet(exerciseId, setIndex) {
    const previous = lastExercisePerformance(exerciseId);
    return previous?.sets?.[setIndex] || null;
  }

  function renderHome() {
    stopStatsTimer();
    view = "home";
    setChrome("Workout Tracker", false, false);
    backButton.onclick = renderHome;
    menuButton.onclick = renderSettings;
    const history = getHistory();

    app.innerHTML = `
      <section class="hero home-hero">
        <h2>Workouts</h2>
        <p>Choose a routine. Your workout history stays on this device.</p>
      </section>

      ${active ? `
        <div class="resume-card">
          <div>
            <span class="mini-label">IN PROGRESS</span>
            <h3>${esc(active.routineName)}</h3>
          </div>
          <div class="resume-actions">
            <button class="text-button" id="discardWorkout">Discard</button>
            <button class="pill-button" id="resumeWorkout">Resume</button>
          </div>
        </div>
      ` : ""}

      <div class="routine-list">
        ${window.WORKOUTS.map((routine, index) => {
          const last = lastRoutineSession(routine.id);
          return `
            <button class="routine-row" data-routine="${esc(routine.id)}">
              <span class="routine-index">${index + 1}</span>
              <span class="routine-main">
                <strong>${esc(routine.name)}</strong>
                <span>${routine.exercises.length} exercises · ${esc(routine.description)}</span>
                ${last ? `<small>Last: ${formatDate(last.completedAt)}</small>` : ""}
              </span>
              <span class="chevron">›</span>
            </button>
          `;
        }).join("")}
      </div>

      ${history.length ? `
        <button class="history-link" id="openHistory">
          <span>Workout history</span>
          <span>${history.length} saved ›</span>
        </button>
      ` : ""}
    `;

    document.querySelectorAll("[data-routine]").forEach(btn => {
      btn.onclick = () => startWorkout(btn.dataset.routine);
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
      exercises: routine.exercises.map(ex => {
        const previous = lastExercisePerformance(ex.id);
        const rowCount = Math.max(3, previous?.sets?.length || 0);

        return {
          exerciseId: ex.id,
          name: ex.name,
          unit: ex.unit,
          equipment: ex.equipment,
          primary: ex.primary,
          secondary: ex.secondary,
          sets: Array.from({ length: rowCount }, (_, i) => emptySet(previous?.sets?.[i]))
        };
      })
    };

    save(ACTIVE_KEY, active);
    renderWorkout();
  }

  function workoutTotals() {
    let setCount = 0;
    let volume = 0;

    for (const ex of active.exercises) {
      for (const set of ex.sets) {
        if (!set.completed) continue;
        const weight = Number(set.weight);
        const reps = Number(set.reps);
        if (Number.isFinite(weight) && Number.isFinite(reps)) {
          volume += weight * reps;
          setCount += 1;
        }
      }
    }

    return { setCount, volume };
  }

  function renderWorkout() {
    if (!active) return renderHome();

    stopStatsTimer();
    view = "workout";
    setChrome("Log Workout", true, true);
    backButton.onclick = renderHome;
    menuButton.onclick = finishWorkout;

    const totals = workoutTotals();

    app.innerHTML = `
      <section class="workout-summary">
        <div>
          <span>Duration</span>
          <strong id="durationStat">${formatDuration(Date.now() - new Date(active.startedAt).getTime())}</strong>
        </div>
        <div>
          <span>Volume</span>
          <strong id="volumeStat">${Math.round(totals.volume).toLocaleString()} lb</strong>
        </div>
        <div>
          <span>Sets</span>
          <strong id="setsStat">${totals.setCount}</strong>
        </div>
      </section>

      <div class="exercise-list">
        ${active.exercises.map((ex, exerciseIndex) => exerciseCard(ex, exerciseIndex)).join("")}
      </div>
    `;

    statsTimer = setInterval(() => {
      const el = document.getElementById("durationStat");
      if (el && active) el.textContent = formatDuration(Date.now() - new Date(active.startedAt).getTime());
    }, 1000);

    document.querySelectorAll("[data-exercise-detail]").forEach(btn => {
      btn.onclick = () => openExerciseDetail(Number(btn.dataset.exerciseDetail));
    });

    document.querySelectorAll("[data-set-input]").forEach(input => {
      input.addEventListener("input", () => {
        const [exerciseIndex, setIndex, field] = input.dataset.setInput.split(":");
        const set = active.exercises[Number(exerciseIndex)].sets[Number(setIndex)];
        set[field] = input.value;
        save(ACTIVE_KEY, active);
      });
    });

    document.querySelectorAll("[data-complete-set]").forEach(btn => {
      btn.onclick = () => {
        const [exerciseIndex, setIndex] = btn.dataset.completeSet.split(":").map(Number);
        const set = active.exercises[exerciseIndex].sets[setIndex];

        if (!set.completed) {
          const weight = Number(set.weight);
          const reps = Number(set.reps);
          if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 1) {
            flash("Enter weight and reps first");
            return;
          }
        }

        set.completed = !set.completed;
        save(ACTIVE_KEY, active);
        renderWorkout();
      };
    });

    document.querySelectorAll("[data-add-set]").forEach(btn => {
      btn.onclick = () => {
        const exerciseIndex = Number(btn.dataset.addSet);
        const ex = active.exercises[exerciseIndex];
        const last = ex.sets.at(-1) || {};
        ex.sets.push(emptySet({ weight: last.weight, reps: last.reps }));
        save(ACTIVE_KEY, active);
        renderWorkout();
      };
    });
  }

  function exerciseCard(ex, exerciseIndex) {
    return `
      <article class="exercise-card">
        <button class="exercise-heading" data-exercise-detail="${exerciseIndex}">
          <span class="exercise-thumb" aria-hidden="true">↕</span>
          <span class="exercise-heading-copy">
            <strong>${esc(ex.name)}</strong>
            <small>${esc((ex.primary || []).join(" · "))} · tap for details</small>
          </span>
          <span class="info-dot">i</span>
        </button>

        <div class="set-table">
          <div class="set-table-head">
            <span>SET</span>
            <span>PREVIOUS</span>
            <span>${esc(ex.unit.toUpperCase())}</span>
            <span>REPS</span>
            <span>✓</span>
          </div>

          ${ex.sets.map((set, setIndex) => {
            const previous = previousSet(ex.exerciseId, setIndex);
            const previousText = previous
              ? ${previous.weight} + " × " + ${previous.reps}
              : "—";

            return `
              <div class="set-entry ${set.completed ? "complete" : ""}">
                <span class="set-badge">${setIndex + 1}</span>
                <span class="previous-value">${esc(previousText)}</span>
                <input
                  aria-label="Weight for set ${setIndex + 1}"
                  inputmode="decimal"
                  type="number"
                  min="0"
                  step="0.5"
                  value="${esc(set.weight)}"
                  data-set-input="${exerciseIndex}:${setIndex}:weight">
                <input
                  aria-label="Reps for set ${setIndex + 1}"
                  inputmode="numeric"
                  type="number"
                  min="1"
                  step="1"
                  value="${esc(set.reps)}"
                  data-set-input="${exerciseIndex}:${setIndex}:reps">
                <button class="check-button" data-complete-set="${exerciseIndex}:${setIndex}" aria-label="Mark set complete">✓</button>
              </div>
            `;
          }).join("")}
        </div>

        <button class="add-set-button" data-add-set="${exerciseIndex}">＋ Add Set</button>
      </article>
    `;
  }

  function openExerciseDetail(exerciseIndex) {
    const ex = active.exercises[exerciseIndex];
    document.querySelector(".detail-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "detail-overlay";
    overlay.innerHTML = `
      <section class="detail-sheet" role="dialog" aria-modal="true" aria-label="${esc(ex.name)} details">
        <div class="detail-handle"></div>
        <div class="detail-top">
          <div>
            <span class="mini-label">EXERCISE</span>
            <h2>${esc(ex.name)}</h2>
            <p>${esc(ex.equipment || "Gym equipment")}</p>
          </div>
          <button class="close-detail" aria-label="Close">×</button>
        </div>

        <div class="exercise-animation" aria-label="Exercise animation placeholder">
          <div class="animated-lifter">
            <span class="head"></span>
            <span class="torso"></span>
            <span class="bar"></span>
          </div>
          <span>Animation / GIF goes here</span>
        </div>

        <div class="muscle-section">
          <span class="muscle-label">PRIMARY</span>
          <div class="chips">
            ${(ex.primary || []).map(muscle => `<span class="chip primary-chip">${esc(muscle)}</span>`).join("")}
          </div>
        </div>

        ${ex.secondary?.length ? `
          <div class="muscle-section">
            <span class="muscle-label">SECONDARY</span>
            <div class="chips">
              ${ex.secondary.map(muscle => `<span class="chip">${esc(muscle)}</span>`).join("")}
            </div>
          </div>
        ` : ""}

        <p class="detail-note">The layout is ready for a real exercise GIF. The first test build still uses a placeholder so we can finalize the routine before adding media assets.</p>
      </section>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector(".close-detail").onclick = () => overlay.remove();
    overlay.addEventListener("click", event => {
      if (event.target === overlay) overlay.remove();
    });
  }

  function finishWorkout() {
    if (!active) return;

    const totals = workoutTotals();
    if (!totals.setCount && !confirm("No sets are marked complete. Finish this workout anyway?")) return;

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
          .filter(set => set.completed)
          .map(set => ({ weight: Number(set.weight), reps: Number(set.reps) }))
      }))
    });

    save(HISTORY_KEY, history);
    active = null;
    localStorage.removeItem(ACTIVE_KEY);
    stopStatsTimer();
    flash("Workout saved");
    renderHistory();
  }

  function renderHistory() {
    stopStatsTimer();
    view = "history";
    setChrome("History", true, false);
    backButton.onclick = renderHome;
    menuButton.onclick = renderSettings;
    const history = getHistory();

    app.innerHTML = `
      <section class="hero">
        <h2>Workout history</h2>
        <p>${history.length
          ? ${history.length} + " saved workout" + (history.length === 1 ? "" : "s") + " on this device."
          : "No workouts saved yet."}</p>
      </section>
      <div class="history-stack">
        ${history.map(session => `
          <article class="history-card">
            <div class="history-top">
              <h3>${esc(session.routineName)}</h3>
              <span>${formatDate(session.completedAt)}</span>
            </div>
            ${session.exercises.map(ex => `
              <div class="exercise-summary">
                <strong>${esc(ex.name)}</strong>
                <span>${ex.sets?.length
                  ? ex.sets.map(s => ${esc(s.weight)} + " " + ${esc(ex.unit)} + " × " + ${esc(s.reps)}).join(" · ")
                  : "No completed sets"}</span>
              </div>
            `).join("")}
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderSettings() {
    stopStatsTimer();
    view = "settings";
    setChrome("Settings", true, false);
    backButton.onclick = renderHome;
    menuButton.onclick = renderSettings;
    const count = getHistory().length;

    app.innerHTML = `
      <section class="hero">
        <h2>Data & backup</h2>
        <p>Your history is stored in this browser. Nothing is uploaded to GitHub.</p>
      </section>

      <div class="settings-card">
        <h3>Backup</h3>
        <p>${count} saved workout${count === 1 ? "" : "s"}.</p>
        <button class="button primary" id="exportData">Export JSON backup</button>
        <button class="button secondary" id="importData">Import JSON backup</button>
      </div>

      <div class="settings-card danger-card">
        <button class="button danger" id="clearHistory">Clear workout history</button>
      </div>
    `;

    document.getElementById("exportData").onclick = () => {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        history: getHistory()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "workout-tracker-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(url);
    };

    document.getElementById("importData").onclick = () => importFile.click();
    document.getElementById("clearHistory").onclick = () => {
      if (confirm("Permanently clear all workout history on this device?")) {
        localStorage.removeItem(HISTORY_KEY);
        flash("History cleared");
        renderSettings();
      }
    };
  }

  importFile.onchange = async () => {
    const file = importFile.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      if (!data || data.version !== 1 || !Array.isArray(data.history)) throw new Error("Bad backup");

      if (confirm("Import " + data.history.length + " workouts and replace the history currently on this device?")) {
        save(HISTORY_KEY, data.history);
        flash("Backup imported");
        renderSettings();
      }
    } catch {
      alert("That file is not a valid Workout Tracker backup.");
    } finally {
      importFile.value = "";
    }
  };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  renderHome();
})();