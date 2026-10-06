(() => {
  const app = document.getElementById("app");
  const pageTitle = document.getElementById("pageTitle");
  const backButton = document.getElementById("backButton");
  const menuButton = document.getElementById("menuButton");
  if (!app || !pageTitle || !backButton || !menuButton) return;

  const FACE_PULL_HISTORY_KEY = "workoutTracker.posture.facePull.history.v1";

  function getFacePullHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(FACE_PULL_HISTORY_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function lastFacePullWeight() {
    return getFacePullHistory()[0]?.weight ?? "";
  }

  function saveFacePullWeight(weight) {
    const history = getFacePullHistory();
    history.unshift({
      weight,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(FACE_PULL_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  }

  const exercises = [
    {
      title: "Chin Tucks",
      purpose: "Forward-head control / deep neck flexors",
      frequency: "Daily",
      prescription: "2 × 8–12",
      detail: "3–5 sec holds",
      instructions: "Glide the head straight backward without looking down. Keep the movement small and your gaze level.",
      media: {
        imageUrl: "https://b2284556.smushcdn.com/2284556/wp-content/uploads/2024/11/chin-tuck-exercise-for-neck-pain-illustration_02.jpg?lossy=2&strip=1&webp=1",
        sourceUrl: "https://dralexjimenez.com/cervical-retraction-an-effective-exercise-for-neck-pain-relief/amp/",
        sourceName: "Dr. Alex Jimenez",
        alt: "Chin tuck exercise demonstration"
      }
    },
    {
      title: "Wall Slides with Reach",
      purpose: "Serratus + lower trap / rounded shoulders",
      frequency: "Daily",
      prescription: "2 × 8–12",
      detail: "Slow, controlled reps",
      instructions: "Keep light pressure into the wall as the arms slide upward. Reach at the top without shrugging or flaring the ribs.",
      media: {
        imageUrl: "https://physiohunt.com/subject/etc/serratus-anterior/Serratus-wall-slide.jpg",
        sourceUrl: "https://physiohunt.com/subject/muscles/serratus-anterior.php",
        sourceName: "PhysioHunt",
        alt: "Serratus anterior wall slide demonstration"
      }
    },
    {
      title: "Active Thoracic Correction / Axial Elongation",
      purpose: "Active kyphosis correction / postural control",
      frequency: "Daily",
      prescription: "2 × 20–30 sec",
      detail: "or 2 × 5 slow breaths",
      instructions: "Stack ribs over pelvis, gently lengthen upward through the crown of the head, and actively reduce the upper/mid-back rounding without arching the lower back or aggressively pulling the shoulders back.",
      media: {
        imageUrl: "https://images.yogajournal.jp/article/38321/eF5s5akutXd4Ald9xi3s4N0RXej4CvpCBLMdTTW2.jpeg",
        sourceUrl: "https://yogajournal.jp/4987/2",
        sourceName: "Yoga Journal Japan",
        alt: "Standing axial elongation demonstration"
      }
    },
    {
      id: "face-pulls",
      title: "Face Pulls",
      purpose: "Preferred scapular-strength exercise for posture / rounded shoulders",
      logWeight: true,
      frequency: "3× / week",
      prescription: "2 × 10–15",
      detail: "Face pull preferred",
      instructions: "Use light-to-moderate resistance and a controlled pull toward the face. Keep the neck relaxed and avoid shrugging. Band external rotation is an optional shoulder-health alternative, not an equivalent posture/kyphosis exercise.",
      alternatives: [
        {
          title: "Band / Cable Face Pull",
          subtitle: "Preferred",
          imageUrl: "./assets/exercises/face-pull.gif",
          sourceUrl: "https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/Face_Pull.json",
          sourceName: "Free Exercise DB",
          alt: "Face pull exercise GIF"
        },
        {
          title: "Band External Rotation",
          subtitle: "Optional shoulder-health alternative",
          imageUrl: "https://sportydoctor.com/wp-content/uploads/2019/08/04-External-Band-Rotation.jpg",
          sourceUrl: "https://sportydoctor.com/exercises-for-shoulder-pain/",
          sourceName: "Sporty Doctor",
          alt: "Band external rotation demonstration"
        }
      ]
    },
    {
      title: "Dead Bug",
      purpose: "Rib/pelvis control and trunk strength",
      frequency: "3× / week",
      prescription: "2 × 6–10 / side",
      detail: "Controlled alternating reps",
      instructions: "Keep the ribs down and your lower back gently controlled against the floor as the opposite arm and leg extend.",
      media: {
        imageUrl: "https://musclewiki.com/_next/image?q=75&url=%2Fapi-next%2Fimages%2Fog-male-Bodyweight-dead-bug-side.jpg&w=3840",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        sourceName: "MuscleWiki",
        alt: "Dead bug exercise demonstration"
      }
    },
    {
      title: "Thoracic Extensions over Foam Roller",
      purpose: "Upper/mid-back mobility",
      frequency: "Daily",
      prescription: "1 × 5–8",
      detail: "Slow reps at 2–3 spots",
      instructions: "Support the head and gently extend over the roller through the upper/mid back. Avoid turning it into a large lower-back arch.",
      media: {
        imageUrl: "./assets/exercises/thoracic-extension.gif",
        sourceUrl: "https://github.com/chronicweirdo/chronicweirdo/blob/gh-pages/calisthenics/thoracic_extension.gif.webp",
        sourceName: "chronicweirdo exercise reference",
        alt: "Thoracic extension over a foam roller GIF"
      }
    },
    {
      title: "Prone Thoracic Extensions",
      purpose: "Thoracic extensor strength / rounded upper back",
      frequency: "~3× / week",
      prescription: "2 × 10–15",
      detail: "Progress once 15 reps are easy",
      instructions: "Lie face-down with your arms alongside you or in a shallow Y. Gently lift your upper chest off the floor while keeping your neck neutral. Try to extend primarily through the upper/mid back rather than cranking your lower back. Progression: once 15 controlled reps are easy, progressively increase difficulty using a longer lever position (arms in Y/overhead), a light plate held at the chest, or another loaded thoracic-extension variation. Do not leave this permanently as an easy bodyweight mobility drill.",
      media: {
        imageUrl: "https://images.easyme.com/20/170/web/springer50.jpg",
        sourceUrl: "https://dinryg.dk/scheuermann",
        sourceName: "Din Ryg",
        alt: "Prone thoracic extension with arms alongside the body"
      }
    }
  ];

  let postureOpen = false;
  let homeNodes = [];
  let previousBackHandler = null;
  let previousTitle = "Workout Tracker";
  let previousScrollY = 0;

  function mediaFrame(media) {
    return `
      <div class="posture-media-frame">
        <img class="posture-photo" src="${media.imageUrl}" alt="${media.alt}" loading="lazy" referrerpolicy="no-referrer">
        <div class="posture-media-fallback">Image unavailable</div>
      </div>
      <a class="posture-source" href="${media.sourceUrl}" target="_blank" rel="noopener noreferrer">Demo source: ${media.sourceName} ↗</a>
    `;
  }

  function exerciseMedia(exercise) {
    if (!exercise.alternatives) {
      return `<div class="posture-media">${mediaFrame(exercise.media)}</div>`;
    }

    return `
      <div class="posture-carousel" aria-label="Exercise alternatives">
        ${exercise.alternatives.map(option => `
          <div class="posture-slide">
            ${mediaFrame(option)}
            <div class="posture-slide-label">
              <strong>${option.title}</strong>
              <span>${option.subtitle}</span>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="posture-swipe-hint">Swipe for optional alternative ↔</div>
    `;
  }

  function posturePageMarkup() {
    return `
      <section class="posture-page" id="posturePage">
        <section class="hero posture-page-hero">
          <h2>Posture</h2>
          <p>Forward head · rounded shoulders · thoracic extension · active kyphosis correction · rib/pelvis control. Face Pulls track weight only; the other posture movements use fixed prescriptions.</p>
        </section>

        <div class="posture-list">
          ${exercises.map(exercise => `
            <article class="posture-card">
              <div class="posture-card-top">
                <div class="posture-card-copy">
                  <h3>${exercise.title}</h3>
                  <p>${exercise.purpose}</p>
                </div>
                <span class="posture-frequency">${exercise.frequency}</span>
              </div>
              ${exerciseMedia(exercise)}
              <div class="posture-prescription">
                <strong>${exercise.prescription}</strong>
                <span>${exercise.detail}</span>
              </div>
              ${exercise.logWeight ? `
                <div class="posture-weight-log" data-face-pull-log>
                  <div class="posture-weight-field">
                    <label for="facePullWeight">WEIGHT (LB)</label>
                    <input
                      id="facePullWeight"
                      type="number"
                      min="0"
                      step="0.5"
                      inputmode="decimal"
                      value="${lastFacePullWeight()}"
                      placeholder="0"
                      aria-label="Face pull weight">
                  </div>
                  <button class="posture-weight-check" type="button" data-face-pull-save aria-label="Save face pull weight">✓</button>
                </div>
                <div class="posture-weight-status" data-face-pull-status>
                  ${lastFacePullWeight() !== "" ? `Last saved: ${lastFacePullWeight()} lb` : "No weight saved yet"}
                </div>
              ` : ""}
              <p class="posture-instructions">${exercise.instructions}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll(".posture-photo").forEach(img => {
      img.addEventListener("error", () => {
        img.classList.add("failed");
        img.closest(".posture-media-frame")?.classList.add("failed");
      });
    });
  }

  function bindFacePullLogging(root) {
    const input = root.querySelector("#facePullWeight");
    const saveButton = root.querySelector("[data-face-pull-save]");
    const status = root.querySelector("[data-face-pull-status]");
    if (!input || !saveButton || !status) return;

    input.addEventListener("input", () => {
      saveButton.classList.remove("saved");
      saveButton.setAttribute("aria-label", "Save face pull weight");
      status.textContent = "Tap ✓ to save";
    });

    saveButton.addEventListener("click", () => {
      const weight = Number(input.value);
      if (!Number.isFinite(weight) || weight < 0 || input.value.trim() === "") {
        status.textContent = "Enter a valid weight first";
        input.focus();
        return;
      }

      saveFacePullWeight(weight);
      saveButton.classList.add("saved");
      saveButton.setAttribute("aria-label", "Face pull weight saved");
      status.textContent = "Saved " + weight + " lb";
    });
  }

  function closePosture() {
    if (!postureOpen) return;
    postureOpen = false;
    document.getElementById("posturePage")?.remove();
    homeNodes.forEach(node => node.classList.remove("posture-home-hidden"));
    pageTitle.textContent = previousTitle;
    backButton.onclick = previousBackHandler;
    backButton.classList.add("hidden");
    menuButton.classList.remove("finish-button");
    menuButton.textContent = "⚙";
    window.scrollTo(0, previousScrollY);
  }

  function openPosture() {
    if (postureOpen) return;
    postureOpen = true;
    previousScrollY = window.scrollY;
    previousTitle = pageTitle.textContent;
    previousBackHandler = backButton.onclick;
    homeNodes = Array.from(app.children);
    homeNodes.forEach(node => node.classList.add("posture-home-hidden"));

    app.insertAdjacentHTML("beforeend", posturePageMarkup());
    const page = document.getElementById("posturePage");
    attachImageFallbacks(page);
    bindFacePullLogging(page);

    pageTitle.textContent = "Posture";
    backButton.classList.remove("hidden");
    backButton.onclick = closePosture;
    menuButton.classList.remove("finish-button");
    menuButton.textContent = "⚙";
    window.scrollTo(0, 0);
  }

  function mountHomeEntry() {
    const button = app.querySelector("[data-posture-routine]");
    if (!button) {
      postureOpen = false;
      return;
    }

    if (button.dataset.postureBound === "true") return;
    button.dataset.postureBound = "true";
    button.onclick = openPosture;
  }

  const observer = new MutationObserver(mountHomeEntry);
  observer.observe(app, { childList: true, subtree: false });
  mountHomeEntry();
})();
