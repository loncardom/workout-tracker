(() => {
  const app = document.getElementById("app");
  if (!app) return;

  const figure = {
    chinTuck: `
      <svg class="posture-figure" viewBox="0 0 320 180" role="img" aria-label="Side-view chin tuck illustration">
        <line class="guide" x1="210" y1="32" x2="210" y2="150" stroke-dasharray="7 9" />
        <circle class="head" cx="190" cy="62" r="27" />
        <path class="body" d="M177 91 C173 111 171 128 169 153" />
        <path class="limb" d="M170 112 C142 119 129 136 117 154" />
        <path class="arrow" d="M238 62 H214 M221 54 L213 62 L221 70" />
        <text x="226" y="88">head straight back</text>
      </svg>`,
    wallSlide: `
      <svg class="posture-figure" viewBox="0 0 320 180" role="img" aria-label="Wall slide with reach illustration">
        <line class="wall" x1="78" y1="22" x2="78" y2="158" />
        <circle class="head" cx="145" cy="53" r="22" />
        <path class="body" d="M145 78 L145 139" />
        <path class="limb" d="M145 88 L112 59 L96 34" />
        <path class="limb" d="M145 88 L178 59 L194 34" />
        <path class="limb" d="M145 138 L124 160 M145 138 L166 160" />
        <path class="arrow" d="M104 74 L98 46 M92 54 L98 45 L105 52" />
        <path class="arrow" d="M186 74 L192 46 M185 52 L192 45 L198 54" />
        <text x="209" y="88">slide + reach up</text>
      </svg>`,
    facePull: `
      <svg class="posture-figure" viewBox="0 0 320 180" role="img" aria-label="Band face pull illustration">
        <circle class="head" cx="215" cy="55" r="22" />
        <path class="body" d="M215 79 L215 145" />
        <path class="limb" d="M213 91 L177 84 L150 65" />
        <path class="limb" d="M217 91 L250 84 L270 66" />
        <path class="band" d="M48 65 L150 65 M48 65 L270 66" />
        <circle cx="47" cy="65" r="8" fill="#348df5" />
        <path class="arrow" d="M157 45 L188 57 M179 48 L189 57 L177 62" />
        <text x="93" y="151">pull toward face, elbows high</text>
      </svg>`,
    externalRotation: `
      <svg class="posture-figure" viewBox="0 0 320 180" role="img" aria-label="Band external rotation illustration">
        <circle class="head" cx="160" cy="46" r="22" />
        <path class="body" d="M160 70 L160 145" />
        <path class="limb" d="M160 88 L131 100 L131 133" />
        <path class="limb" d="M160 88 L189 100 L214 124" />
        <path class="band" d="M98 132 L131 132" />
        <path class="arrow" d="M191 126 C206 112 224 108 241 112 M232 104 L242 112 L232 119" />
        <text x="69" y="158">elbow stays near side; rotate outward</text>
      </svg>`,
    deadBug: `
      <svg class="posture-figure" viewBox="0 0 320 180" role="img" aria-label="Dead bug exercise illustration">
        <line class="floor" x1="38" y1="145" x2="286" y2="145" />
        <circle class="head" cx="93" cy="124" r="19" />
        <path class="body" d="M112 126 C145 123 169 126 193 135" />
        <path class="limb" d="M133 124 L119 79 L107 47" />
        <path class="limb" d="M147 124 L172 86 L184 52" />
        <path class="limb" d="M190 135 L214 99 L232 70" />
        <path class="limb" d="M192 135 L238 141 L276 141" />
        <path class="arrow" d="M235 86 L258 111 M256 99 L259 112 L246 109" />
        <text x="111" y="165">keep ribs down and low back controlled</text>
      </svg>`,
    thoracicExtension: `
      <svg class="posture-figure" viewBox="0 0 320 180" role="img" aria-label="Thoracic extension over foam roller illustration">
        <line class="floor" x1="34" y1="151" x2="286" y2="151" />
        <rect class="roller" x="145" y="126" width="58" height="25" rx="12" />
        <circle class="head" cx="100" cy="87" r="20" />
        <path class="body" d="M119 98 C146 102 161 112 176 132" />
        <path class="limb" d="M115 98 L88 69 L66 68" />
        <path class="limb" d="M176 132 L222 140 L263 140" />
        <path class="arrow" d="M131 73 C151 57 176 56 197 67 M187 58 L198 67 L188 75" />
        <text x="129" y="39">extend upper back, not low back</text>
      </svg>`
  };

  const items = [
    {
      title: "Chin Tucks",
      purpose: "Forward-head control / deep neck flexors",
      frequency: "Daily",
      prescription: "2 × 8–12",
      detail: "3–5 sec holds",
      media: figure.chinTuck
    },
    {
      title: "Wall Slides with Reach",
      purpose: "Serratus + lower trap / rounded shoulders",
      frequency: "Daily",
      prescription: "2 × 8–12",
      detail: "Slow, controlled reps",
      media: figure.wallSlide
    },
    {
      title: "Scapular Strength",
      purpose: "Choose either option; both target shoulder/scapular control",
      frequency: "3× / week",
      prescription: "2 × 10–15",
      detail: "Choose one option",
      alternatives: [
        { title: "Band Face Pull", subtitle: "Option 1", media: figure.facePull },
        { title: "Band External Rotation", subtitle: "Option 2", media: figure.externalRotation }
      ]
    },
    {
      title: "Dead Bug",
      purpose: "Rib/pelvis control and trunk strength",
      frequency: "3× / week",
      prescription: "2 × 6–10 / side",
      detail: "Slight posterior pelvic tilt",
      media: figure.deadBug
    },
    {
      title: "Thoracic Extensions",
      purpose: "Upper-back mobility",
      frequency: "Daily",
      prescription: "1 × 5–8",
      detail: "Slow reps over foam roller",
      media: figure.thoracicExtension
    }
  ];

  function renderMedia(item) {
    if (!item.alternatives) {
      return `<div class="posture-media">${item.media}</div>`;
    }

    return `
      <div class="posture-carousel" aria-label="Exercise alternatives">
        ${item.alternatives.map(option => `
          <div class="posture-slide">
            ${option.media}
            <div class="posture-slide-label">
              <strong>${option.title}</strong>
              <span>${option.subtitle}</span>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="posture-swipe-hint">Swipe for alternative ↔</div>
    `;
  }

  function postureMarkup() {
    return `
      <section class="posture-section" aria-labelledby="postureTitle">
        <div class="posture-heading">
          <h2 id="postureTitle">Posture</h2>
          <p>Forward head · rounded shoulders · rib/pelvis control. Fixed routine — no set logging.</p>
        </div>
        <div class="posture-list">
          ${items.map(item => `
            <article class="posture-card">
              <div class="posture-card-top">
                <div class="posture-card-copy">
                  <h3>${item.title}</h3>
                  <p>${item.purpose}</p>
                </div>
                <span class="posture-frequency">${item.frequency}</span>
              </div>
              ${renderMedia(item)}
              <div class="posture-prescription">
                <strong>${item.prescription}</strong>
                <span>${item.detail}</span>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function mount() {
    const isHome = app.querySelector(".home-hero") && app.querySelector(".routine-list");
    const existing = app.querySelector(".posture-section");

    if (!isHome) {
      existing?.remove();
      return;
    }

    if (existing) return;
    app.insertAdjacentHTML("beforeend", postureMarkup());
  }

  const observer = new MutationObserver(mount);
  observer.observe(app, { childList: true, subtree: false });
  mount();
})();
