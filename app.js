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
      const plannedSets = ex.targetSets || def.targetSets || 3;
      const sets = existing.length
        ? existing.map(s => ({
            weight: s.weight ?? "",
            reps: s.reps ?? "",
            completed: s.completed ?? true
          }))
        : Array.from({ length: plannedSets }, () => emptySet());

      return {
        exerciseId: ex.exerciseId,
        name: ex.name || def.name || "Exercise",
        unit: ex.unit || def.unit || "lb",
        equipment: ex.equipment || def.equipment || "",
        targetSets: ex.targetSets || def.targetSets || plannedSets,
        reps: ex.reps || def.reps || "",
        graphic: ex.graphic || def.graphic || "generic",
        note: ex.note || def.note || "",
        optional: ex.optional ?? def.optional ?? false,
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
    return minutes ? minutes + ":" + String(rest).padStart(2, "0") : rest + "s";
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

  function exerciseGraphic(ex, compact = false) {
    const type = ex.graphic || "generic";
    const poses = {
      "fly": '<path class="limb arms" d="M80 48 L44 55 M80 48 L116 55"/><path class="limb forearms" d="M44 55 L32 72 M116 55 L128 72"/>',
      "reverse-fly": '<path class="limb arms" d="M80 48 L43 43 M80 48 L117 43"/><path class="limb forearms" d="M43 43 L27 40 M117 43 L133 40"/>',
      "row": '<path class="limb arms" d="M78 50 L104 58 M82 50 L108 64"/><path class="equipment" d="M109 61 L151 61"/>',
      "pulldown": '<path class="limb arms" d="M78 48 L57 24 M82 48 L103 24"/><path class="equipment" d="M47 20 L113 20 M80 20 L80 5"/>',
      "lateral-raise": '<path class="limb arms" d="M80 49 L43 48 M80 49 L117 48"/>',
      "front-raise": '<path class="limb arms" d="M78 51 L52 36 M82 51 L108 36"/>',
      "pushdown": '<path class="limb arms" d="M76 48 L66 67 M84 48 L94 67"/><path class="equipment" d="M80 6 L80 64 M65 67 L95 67"/>',
      "curl": '<path class="limb arms" d="M76 48 L62 65 M84 48 L98 65"/><path class="limb forearms" d="M62 65 L70 47 M98 65 L90 47"/>',
      "squat": '<path class="limb legs" d="M72 84 L57 101 L45 94 M88 84 L103 101 L115 94"/><path class="equipment" d="M44 38 L116 38"/>',
      "leg-extension": '<path class="limb legs" d="M74 83 L66 103 M86 83 L115 87"/><path class="equipment" d="M48 78 L108 78 M52 82 L52 108"/>',
      "leg-curl": '<path class="limb legs" d="M73 83 L58 91 L70 104 M87 83 L102 91 L90 104"/><path class="equipment" d="M45 77 L115 77"/>',
      "hip-thrust": '<path class="torso-line" d="M48 70 L100 70"/><circle class="head" cx="38" cy="66" r="8"/><path class="limb legs" d="M98 70 L111 90 L122 88 M98 70 L90 91 L78 91"/><path class="equipment" d="M42 78 L112 78"/>',
      "calf-raise": '<path class="limb legs" d="M72 82 L70 105 L61 105 M88 82 L90 105 L99 105"/><path class="equipment" d="M46 108 L114 108"/>',
      "generic": '<path class="limb arms" d="M80 49 L58 67 M80 49 L102 67"/>'
    };

    const hideStandardTorso = type === "hip-thrust";
    return \`
      <svg class="exercise-svg graphic-\${esc(type)} \${compact ? "compact" : ""}" viewBox="0 0 160 120" role="img" aria-label="\${esc(ex.name)} exercise graphic">
        <g class="machine-frame">
          <path d="M18 108 H142"/>
          <path d="M25 108 V14"/>
        </g>
        <g class="figure motion">
          \${hideStandardTorso ? "" : '<circle class="head" cx="80" cy="28" r="9"/><path class="torso-line" d="M80 38 L80 82"/><path class="limb legs" d="M80 82 L68 106 M80 82 L92 106"/>'}
          \${poses[type] || poses.generic}
        </g>
      </svg>
    \`;
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
                <span>${routine.exercises.length} exercises · ${routine.exercises.reduce((sum, ex) => sum + (ex.targetSets || 0), 0)} planned sets · ${esc(routine.description)}</span>
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
        const rowCount = ex.targetSets || 3;

        return {
          exerciseId: ex.id,
          name: ex.name,
          unit: ex.unit,
          equipment: ex.equipment,
          targetSets: ex.targetSets,
          reps: ex.reps,
          graphic: ex.graphic,
          note: ex.note || "",
          optional: Boolean(ex.optional),
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
          <span class="exercise-thumb" aria-hidden="true">${exerciseGraphic(ex, true)}</span>
          <span class="exercise-heading-copy">
            <strong>${esc(ex.name)}${ex.optional ? ' <span class="optional-tag">Optional</span>' : ""}</strong>
            <small>${esc(ex.targetSets || ex.sets.length)} × ${esc(ex.reps || "reps")} · ${esc((ex.primary || []).join(" · "))}</small>
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
              ? previous.weight + " × " + previous.reps
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

        <div class="exercise-animation">
          ${exerciseGraphic(ex)}
          <span>Animated movement guide</span>
        </div>

        <div class="prescription">
          <strong>${esc(ex.targetSets || ex.sets.length)} sets × ${esc(ex.reps || "reps")}</strong>
          ${ex.optional ? '<span>Optional movement</span>' : ""}
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

        ${ex.note ? `<p class="detail-note">${esc(ex.note)}</p>` : ""}
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
          ? history.length + " saved workout" + (history.length === 1 ? "" : "s") + " on this device."
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
                  ? ex.sets.map(s => esc(s.weight) + " " + esc(ex.unit) + " × " + esc(s.reps)).join(" · ")
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