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
  let savedActive = active?.startedAt ? active : null;

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
    if (window.EXERCISE_VARIANTS?.[exerciseId]) return window.EXERCISE_VARIANTS[exerciseId];
    for (const routine of window.WORKOUTS || []) {
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
    return lastExercisePerformance(exerciseId)?.sets?.[setIndex] || null;
  }

  function activeExerciseFromDefinition(def, source = null) {
    const previous = lastExercisePerformance(def.id);
    const existing = Array.isArray(source?.sets) ? source.sets : [];
    const plannedSets = source?.targetSets || def.targetSets || 3;
    const sets = existing.length
      ? existing.map(set => ({
          weight: set.weight ?? "",
          reps: set.reps ?? "",
          completed: set.completed ?? true
        }))
      : Array.from({ length: plannedSets }, (_, i) => emptySet(previous?.sets?.[i]));

    return {
      exerciseId: source?.exerciseId || def.id,
      name: source?.name || def.name || "Exercise",
      unit: source?.unit || def.unit || "lb",
      equipment: source?.equipment || def.equipment || "",
      targetSets: source?.targetSets || def.targetSets || plannedSets,
      reps: source?.reps || def.reps || "",
      graphic: source?.graphic || def.graphic || "generic",
      note: source?.note || def.note || "",
      optional: source?.optional ?? def.optional ?? false,
      primary: source?.primary || def.primary || [source?.target].filter(Boolean),
      secondary: source?.secondary || def.secondary || [],
      sets
    };
  }

  function buildExerciseSlot(def, source = null) {
    const alternativeIds = Array.isArray(def.alternativeIds) ? def.alternativeIds : [];
    if (!alternativeIds.length && !source?.variants) {
      return activeExerciseFromDefinition(def, source);
    }

    const sourceVariants = Array.isArray(source?.variants) ? source.variants : [];
    const ids = [def.id, ...alternativeIds];
    const variants = ids.map((id, index) => {
      const variantDef = findDefinition(id) || (index === 0 ? def : null) || {};
      const saved = sourceVariants.find(item => item.exerciseId === id) || (index === 0 && !source?.variants ? source : null);
      return activeExerciseFromDefinition(variantDef, saved);
    });

    const requested = Number(source?.selectedVariant);
    const selectedVariant = Number.isInteger(requested) && requested >= 0 && requested < variants.length ? requested : 0;

    return {
      exerciseId: def.id,
      selectedVariant,
      variants
    };
  }

  function hydrateActive(session) {
    if (!session?.exercises) return session;
    session.exercises = session.exercises.map(slot => {
      const def = findDefinition(slot.exerciseId) || {};
      return buildExerciseSlot(def, slot);
    });
    return session;
  }

  function selectedExercise(slot) {
    if (!slot?.variants?.length) return slot;
    const index = Math.min(Math.max(Number(slot.selectedVariant) || 0, 0), slot.variants.length - 1);
    return slot.variants[index];
  }

  function exerciseAt(slotIndex, variantIndex = -1) {
    const slot = active?.exercises?.[slotIndex];
    if (!slot) return null;
    if (variantIndex >= 0 && slot.variants?.[variantIndex]) return slot.variants[variantIndex];
    return selectedExercise(slot);
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
    document.querySelector(".topbar")?.classList.toggle("workout-topbar", finish);
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

  function exerciseMedia(exerciseId) {
    return window.EXERCISE_MEDIA?.[exerciseId] || null;
  }

  function muscleWikiVideoUrl(media) {
    const imageUrl = media?.imageUrl;
    if (!imageUrl || !/musclewiki\.com/i.test(imageUrl)) return null;

    try {
      const parsed = new URL(imageUrl, window.location.href);
      let candidate = parsed.searchParams.get("url") || parsed.pathname;
      candidate = decodeURIComponent(candidate);
      const filename = candidate.split("/").pop() || "";
      if (!/^og-/i.test(filename)) return null;

      const videoFilename = filename
        .replace(/^og-/i, "")
        .replace(/\.(?:jpg|jpeg|png|webp|gif)$/i, ".mp4");

      return "https://media.musclewiki.com/media/uploads/videos/branded/" + videoFilename;
    } catch {
      return null;
    }
  }

  function exerciseImage(ex, compact = false) {
    const media = exerciseMedia(ex.exerciseId);
    if (!media?.imageUrl) {
      return `<span class="photo-fallback">${esc(ex.name.slice(0, 1))}</span>`;
    }

    if (!compact) {
      const videoUrl = muscleWikiVideoUrl(media);
      if (videoUrl) {
        return `
          <video
            class="exercise-demo-video"
            src="${esc(videoUrl)}"
            poster="${esc(media.imageUrl)}"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-label="${esc(media.caption || ex.name)} animated exercise demonstration">
          </video>
        `;
      }
    }

    return `
      <img
        class="exercise-photo ${compact ? "compact" : ""}"
        src="${esc(media.imageUrl)}"
        alt="${esc(media.caption || ex.name)}"
        loading="lazy"
        referrerpolicy="no-referrer"
      >
    `;
  }

  let modalScrollY = 0;

  function lockModalScroll() {
    if (document.body.classList.contains("detail-modal-open")) return;
    modalScrollY = window.scrollY;
    document.body.style.top = `-${modalScrollY}px`;
    document.body.classList.add("detail-modal-open");
  }

  function unlockModalScroll() {
    if (!document.body.classList.contains("detail-modal-open")) return;
    document.body.classList.remove("detail-modal-open");
    document.body.style.top = "";
    window.scrollTo(0, modalScrollY);
  }

  function placeCaretAtEnd(input) {
    if (!input) return;
    requestAnimationFrame(() => {
      try {
        const end = input.value.length;
        input.setSelectionRange(end, end);
      } catch {}
    });
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

      ${savedActive?.startedAt ? `
        <div class="resume-card">
          <div>
            <span class="mini-label">IN PROGRESS</span>
            <h3>${esc(savedActive.routineName)}</h3>
          </div>
          <div class="resume-actions">
            <button class="text-button" id="discardWorkout">Discard</button>
            <button class="pill-button" id="resumeWorkout">Resume</button>
          </div>
        </div>
      ` : ""}

      <div class="routine-list">
        ${window.WORKOUTS.filter(routine => !routine.specialty).map((routine, index) => {
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

      <section class="specialty-section">
        <div class="specialty-heading">
          <h3>Specialty</h3>
          <span>Outside the weekly 1–5 split</span>
        </div>
        <div class="specialty-list">
          <button class="routine-row specialty-row" data-posture-routine>
            <span class="routine-index specialty-icon">P</span>
            <span class="routine-main">
              <strong>Posture</strong>
              <span>Posture, mobility and face-pull tracking</span>
            </span>
            <span class="chevron">›</span>
          </button>
          <button class="routine-row specialty-row" data-routine="abs">
            <span class="routine-index specialty-icon">A</span>
            <span class="routine-main">
              <strong>Abs</strong>
              <span>2 exercise slots · weighted sets · choose one variation per slot</span>
              ${lastRoutineSession("abs") ? `<small>Last: ${formatDate(lastRoutineSession("abs").completedAt)}</small>` : ""}
            </span>
            <span class="chevron">›</span>
          </button>
          <button class="routine-row specialty-row" data-routine="rack">
            <span class="routine-index specialty-icon">R</span>
            <span class="routine-main">
              <strong>Rack</strong>
              <span>6 movements · sets, weight and reps · fully trackable</span>
              ${lastRoutineSession("rack") ? `<small>Last: ${formatDate(lastRoutineSession("rack").completedAt)}</small>` : ""}
            </span>
            <span class="chevron">›</span>
          </button>
        </div>
      </section>

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

    document.getElementById("resumeWorkout")?.addEventListener("click", () => {
      if (!savedActive) return;
      active = savedActive;
      renderWorkout();
    });
    document.getElementById("discardWorkout")?.addEventListener("click", () => {
      if (confirm("Discard the workout in progress?")) {
        if (active?.id === savedActive?.id) active = null;
        savedActive = null;
        localStorage.removeItem(ACTIVE_KEY);
        renderHome();
      }
    });
    document.getElementById("openHistory")?.addEventListener("click", renderHistory);
  }

  function startWorkout(routineId) {
    const routine = window.WORKOUTS.find(item => item.id === routineId);
    if (!routine) return;

    active = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      routineId: routine.id,
      routineName: routine.name,
      startedAt: null,
      exercises: routine.exercises.map(def => buildExerciseSlot(def))
    };

    renderWorkout();
  }

  function ensureWorkoutStarted() {
    if (!active) return false;
    if (active.startedAt) return true;

    if (savedActive?.startedAt && savedActive.id !== active.id) {
      const replace = confirm(
        "Hold on — " + savedActive.routineName + " is already in progress. Starting " +
        active.routineName + " will replace it. Continue?"
      );
      if (!replace) return false;
    }

    active.startedAt = new Date().toISOString();
    savedActive = active;
    save(ACTIVE_KEY, active);
    flash("Workout started");
    return true;
  }

  function workoutElapsedMs() {
    if (!active?.startedAt) return 0;
    return Date.now() - new Date(active.startedAt).getTime();
  }

  function workoutTotals() {
    let setCount = 0;
    let volume = 0;

    for (const slot of active?.exercises || []) {
      const ex = selectedExercise(slot);
      for (const set of ex?.sets || []) {
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

  function updateTotalsDisplay() {
    const totals = workoutTotals();
    const volume = document.getElementById("volumeStat");
    const sets = document.getElementById("setsStat");
    if (volume) volume.textContent = Math.round(totals.volume).toLocaleString() + " lb";
    if (sets) sets.textContent = totals.setCount;
  }

  function setVariant(slotIndex, variantIndex, carousel = null) {
    const slot = active?.exercises?.[slotIndex];
    if (!slot?.variants?.[variantIndex] || slot.selectedVariant === variantIndex) return;
    slot.selectedVariant = variantIndex;
    if (active.startedAt) save(ACTIVE_KEY, active);
    updateTotalsDisplay();

    const root = carousel || document.querySelector(`[data-variant-carousel="${slotIndex}"]`);
    if (root) {
      root.querySelectorAll(".exercise-variant-slide").forEach((slide, index) => {
        slide.classList.toggle("selected", index === variantIndex);
        const badge = slide.querySelector(".variant-status");
        if (badge) badge.textContent = index === variantIndex ? "Selected" : "Alternative";
      });
      const dots = root.parentElement?.querySelectorAll(".variant-dot");
      dots?.forEach((dot, index) => dot.classList.toggle("active", index === variantIndex));
    }
  }

  function bindVariantCarousels() {
    document.querySelectorAll("[data-variant-carousel]").forEach(carousel => {
      const slotIndex = Number(carousel.dataset.variantCarousel);
      const slot = active.exercises[slotIndex];
      const selected = Number(slot.selectedVariant) || 0;
      requestAnimationFrame(() => {
        carousel.scrollLeft = selected * carousel.clientWidth;
      });

      let timer = null;
      carousel.addEventListener("scroll", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const width = carousel.clientWidth || 1;
          const index = Math.max(0, Math.min(slot.variants.length - 1, Math.round(carousel.scrollLeft / width)));
          setVariant(slotIndex, index, carousel);
        }, 120);
      }, { passive: true });
    });
  }

  function renderWorkout() {
    if (!active) return renderHome();

    stopStatsTimer();
    view = "workout";
    setChrome("Log Workout", true, true);
    backButton.onclick = () => {
      if (active && !active.startedAt) active = null;
      renderHome();
    };
    menuButton.onclick = finishWorkout;

    const totals = workoutTotals();

    app.innerHTML = `
      <section class="workout-summary">
        <div>
          <span>Duration</span>
          <strong id="durationStat">${formatDuration(workoutElapsedMs())}</strong>
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
        ${active.exercises.map((slot, slotIndex) => exerciseCard(slot, slotIndex)).join("")}
      </div>
    `;

    statsTimer = setInterval(() => {
      const el = document.getElementById("durationStat");
      if (el && active) el.textContent = formatDuration(workoutElapsedMs());
    }, 1000);

    document.querySelectorAll("[data-exercise-detail]").forEach(btn => {
      btn.onclick = () => {
        const [slotIndex, variantIndex] = btn.dataset.exerciseDetail.split(":").map(Number);
        openExerciseDetail(slotIndex, variantIndex);
      };
    });

    document.querySelectorAll("[data-set-input]").forEach(input => {
      input.addEventListener("focus", () => placeCaretAtEnd(input));
      input.addEventListener("pointerup", event => {
        event.preventDefault();
        placeCaretAtEnd(input);
      });
      input.addEventListener("click", () => placeCaretAtEnd(input));

      input.addEventListener("input", () => {
        const [slotIndex, variantIndex, setIndex, field] = input.dataset.setInput.split(":");
        const ex = exerciseAt(Number(slotIndex), Number(variantIndex));
        const set = ex?.sets?.[Number(setIndex)];
        if (!set) return;

        const previousValue = set[field];
        if (!ensureWorkoutStarted()) {
          input.value = previousValue;
          return;
        }

        set[field] = input.value;
        save(ACTIVE_KEY, active);
      });
    });

    document.querySelectorAll("[data-complete-set]").forEach(btn => {
      btn.onclick = () => {
        const [slotIndex, variantIndex, setIndex] = btn.dataset.completeSet.split(":").map(Number);
        const ex = exerciseAt(slotIndex, variantIndex);
        const set = ex?.sets?.[setIndex];
        if (!set) return;

        if (!set.completed) {
          const weight = Number(set.weight);
          const reps = Number(set.reps);
          if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 1) {
            flash("Enter weight and reps first");
            return;
          }
        }

        if (!ensureWorkoutStarted()) return;
        set.completed = !set.completed;
        save(ACTIVE_KEY, active);
        renderWorkout();
      };
    });

    document.querySelectorAll("[data-add-set]").forEach(btn => {
      btn.onclick = () => {
        const [slotIndex, variantIndex] = btn.dataset.addSet.split(":").map(Number);
        const ex = exerciseAt(slotIndex, variantIndex);
        if (!ex) return;
        const last = ex.sets.at(-1) || {};
        ex.sets.push(emptySet({ weight: last.weight, reps: last.reps }));
        if (active.startedAt) save(ACTIVE_KEY, active);
        renderWorkout();
      };
    });

    bindVariantCarousels();
  }

  function exerciseCard(slot, slotIndex) {
    if (!slot.variants?.length) {
      return `<article class="exercise-card">${exerciseCardBody(slot, slotIndex, -1)}</article>`;
    }

    const selected = Number(slot.selectedVariant) || 0;
    return `
      <article class="exercise-card alternative-exercise-card">
        <div class="variant-header">
          <div>
            <span class="mini-label">CHOOSE ONE</span>
            <strong>${slot.variants.map(ex => esc(ex.name)).join(" / ")}</strong>
          </div>
          <span>Swipe to switch</span>
        </div>
        <div class="exercise-variant-carousel" data-variant-carousel="${slotIndex}">
          ${slot.variants.map((ex, variantIndex) => `
            <section class="exercise-variant-slide ${variantIndex === selected ? "selected" : ""}">
              <div class="variant-status">${variantIndex === selected ? "Selected" : "Alternative"}</div>
              ${exerciseCardBody(ex, slotIndex, variantIndex)}
            </section>
          `).join("")}
        </div>
        <div class="variant-footer">
          <span>Each alternative keeps separate previous weights, reps, and set history.</span>
          <div class="variant-dots" aria-hidden="true">
            ${slot.variants.map((_, index) => `<span class="variant-dot ${index === selected ? "active" : ""}"></span>`).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function exerciseCardBody(ex, slotIndex, variantIndex) {
    return `
      <button class="exercise-heading" data-exercise-detail="${slotIndex}:${variantIndex}">
        <span class="exercise-thumb" aria-hidden="true">${exerciseImage(ex, true)}</span>
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
          const previousText = previous ? previous.weight + " × " + previous.reps : "—";
          return `
            <div class="set-entry ${set.completed ? "complete" : ""}">
              <span class="set-badge">${setIndex + 1}</span>
              <span class="previous-value">${esc(previousText)}</span>
              <input
                aria-label="Weight for ${esc(ex.name)} set ${setIndex + 1}"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                value="${esc(set.weight)}"
                data-set-input="${slotIndex}:${variantIndex}:${setIndex}:weight">
              <input
                aria-label="Reps for ${esc(ex.name)} set ${setIndex + 1}"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                value="${esc(set.reps)}"
                data-set-input="${slotIndex}:${variantIndex}:${setIndex}:reps">
              <button class="check-button" data-complete-set="${slotIndex}:${variantIndex}:${setIndex}" aria-label="Mark set complete">✓</button>
            </div>
          `;
        }).join("")}
      </div>

      <button class="add-set-button" data-add-set="${slotIndex}:${variantIndex}">＋ Add Set</button>
    `;
  }

  function openExerciseDetail(slotIndex, variantIndex = -1) {
    const ex = exerciseAt(slotIndex, variantIndex);
    if (!ex) return;
    const existingOverlay = document.querySelector(".detail-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
      unlockModalScroll();
    }

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

        <div class="exercise-photo-panel">
          ${exerciseImage(ex)}
          ${exerciseMedia(ex.exerciseId)?.sourceUrl ? `
            <a class="image-source" href="${esc(exerciseMedia(ex.exerciseId).sourceUrl)}" target="_blank" rel="noopener noreferrer">
              Demo source: ${esc(exerciseMedia(ex.exerciseId).sourceName || "exercise reference")} ↗
            </a>
          ` : ""}
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
    lockModalScroll();

    const closeDetail = () => {
      overlay.remove();
      unlockModalScroll();
    };

    overlay.querySelector(".close-detail").onclick = closeDetail;
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeDetail();
    });
    overlay.addEventListener("touchmove", event => {
      if (event.target === overlay) event.preventDefault();
    }, { passive: false });
  }

  function finishWorkout() {
    if (!active) return;

    if (!active.startedAt) {
      active = null;
      renderHome();
      return;
    }

    const totals = workoutTotals();
    if (!totals.setCount && !confirm("No sets are marked complete. Finish this workout anyway?")) return;

    const history = getHistory();
    history.unshift({
      id: active.id,
      routineId: active.routineId,
      routineName: active.routineName,
      startedAt: active.startedAt,
      completedAt: new Date().toISOString(),
      exercises: active.exercises.map(slot => {
        const ex = selectedExercise(slot);
        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          unit: ex.unit,
          sets: ex.sets
            .filter(set => set.completed)
            .map(set => ({ weight: Number(set.weight), reps: Number(set.reps) }))
        };
      })
    });

    save(HISTORY_KEY, history);
    active = null;
    savedActive = null;
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
                  ? ex.sets.map(set => esc(set.weight) + " " + esc(ex.unit) + " × " + esc(set.reps)).join(" · ")
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
