/* ==========================================================================
   OUR LITTLE UNIVERSE — Cinematic Script (Vanilla JavaScript)
   Zero frameworks, zero build dependencies. Works directly via index.html.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. STORY DATA (Exact Approved Copy)
     ------------------------------------------------------------------------ */
  const PROMISES = [
    '"I promise to keep choosing you, not just on the easy days, but also when life gets complicated."',
    '"I\'ll always try to be someone you can talk to without being afraid of being judged."',
    '"I\'ll listen to you, even when you don\'t have the perfect words to explain what\'s bothering you."',
    '"I\'ll never intentionally break the trust you\'ve placed in me."',
    '"I\'ll keep loving you in all the little ways I can, for as long as we get to share this journey."',
    '"I officially accept the lifetime responsibility of clicking approximately 847 pictures before you approve just one."',
    '"I\'ll be your unpaid photographer, professional overthinker and occasional irritating fox."',
    '"I promise to listen to your stories, even when the story has 17 plot twists and I have forgotten the first one."',
    '"I\'ll tolerate your cute little dramas, provided you tolerate my equally questionable nonsense."',
    '"I\'ll keep reminding you that you\'re amazing, even when you are busy disagreeing with me."',
    '"I\'ll cheer for your success as much as I cheer for my own."',
    '"Let\'s become successful, build beautiful lives and remain that slightly silly couple who never runs out of things to laugh about."'
  ];

  const ACCEPTED_Q1 = ['angel', 'panda', 'bhootni'];
  const ACCEPTED_Q2 = '30/07';

  /* ------------------------------------------------------------------------
     2. STATE & DOM REFERENCES
     ------------------------------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    currentScene: 'scene-0', // 'scene-0' | 'chapter-1' .. 'chapter-5'
    highestUnlockedChapter: 0,
    isTransitioning: false,
    sequenceToken: 0,
    q1Passed: false,
    currentPromiseIndex: 0,
    promisesCompleted: false,
    letterOpened: false,
    dreamsRevealed: false,
    ringApproached: false,
    finaleActive: false,
    audioAvailable: true
  };

  // Backdrop & HUD elements
  const body = document.body;
  const cosmosCamera = document.getElementById('cosmos-camera');
  const starsFar = document.getElementById('stars-far');
  const starsMid = document.getElementById('stars-mid');
  const starsNear = document.getElementById('stars-near');
  const cosmosCanvas = document.getElementById('cosmos-canvas');
  const chapterNav = document.getElementById('chapter-nav');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const hudReplayBtn = document.getElementById('hud-replay-btn');

  // Audio elements
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');

  // Scene 0 elements
  const gateStage = document.getElementById('gate-stage');
  const premiereHeader = document.getElementById('premiere-header');
  const premierePrologue = document.getElementById('premiere-prologue');
  const gateForm = document.getElementById('gate-form');
  const gateFooterActions = document.querySelector('.gate-footer-actions');
  const q1Step = document.getElementById('question-1-step');
  const q2Step = document.getElementById('question-2-step');
  const answer1Input = document.getElementById('answer-1');
  const answer2Input = document.getElementById('answer-2');
  const q1NextBtn = document.getElementById('q1-next-btn');
  const q2BackBtn = document.getElementById('q2-back-btn');
  const q2SubmitBtn = document.getElementById('q2-submit-btn');
  const gateFeedback = document.getElementById('gate-feedback');
  const gateReplayBtn = document.getElementById('gate-replay-btn');
  const premiereSequence = document.getElementById('premiere-sequence');
  const countdownDisplay = document.getElementById('countdown-display');
  const premiereTitleLockup = document.getElementById('premiere-title-lockup');

  // Chapter 1 elements
  const ch1Whisper = document.getElementById('chapter-1-whisper');
  const ch1Actions = document.getElementById('chapter-1-actions');
  const toChapter2Btn = document.getElementById('to-chapter-2-btn');

  // Chapter 2 elements
  const promisesDeck = document.getElementById('promises-deck');
  const promisesOutro = document.getElementById('promises-outro');
  const promiseProgressText = document.getElementById('promise-progress-text');
  const promiseSegments = document.getElementById('promise-segments');
  const promiseCard = document.getElementById('promise-card');
  const promiseNumber = document.getElementById('promise-number');
  const promiseQuote = document.getElementById('promise-quote');
  const promisePrevBtn = document.getElementById('promise-prev-btn');
  const promiseNextBtn = document.getElementById('promise-next-btn');
  const toChapter3Btn = document.getElementById('to-chapter-3-btn');

  // Chapter 3 elements
  const envelopeStage = document.getElementById('envelope-stage');
  const envelopeTrigger = document.getElementById('envelope-trigger');
  const letterStage = document.getElementById('letter-stage');
  const letterSheet = document.getElementById('letter-sheet');
  const toChapter4Btn = document.getElementById('to-chapter-4-btn');

  // Chapter 4 elements
  const dreamSentences = Array.from(document.querySelectorAll('.dream-sentence'));
  const dreamsActions = document.getElementById('dreams-actions');
  const toChapter5Btn = document.getElementById('to-chapter-5-btn');

  // Chapter 5 elements
  const ringCeremony = document.getElementById('ring-ceremony');
  const foreverOpening = document.getElementById('forever-opening');
  const pedestalStage = document.getElementById('pedestal-stage');
  const ringTrigger = document.getElementById('ring-trigger');
  const ringProposal = document.getElementById('ring-proposal');
  const proposalLines = Array.from(document.querySelectorAll('.proposal-line'));
  const proposalActions = document.getElementById('proposal-actions');
  const yesForeverBtn = document.getElementById('yes-forever-btn');
  const finalScene = document.getElementById('final-scene');
  const finalReplayBtn = document.getElementById('final-replay-btn');

  /* ------------------------------------------------------------------------
     3. TIMING & HELPERS
     ------------------------------------------------------------------------ */
  function wait(ms) {
    const adjusted = prefersReducedMotion.matches ? Math.min(ms, 220) : ms;
    return new Promise((resolve) => window.setTimeout(resolve, adjusted));
  }

  function normalizeAnswer(value) {
    return String(value || '').trim().toLowerCase();
  }

  function padTwo(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function setBodySceneClass(className) {
    body.classList.remove(
      'scene-gate-mode',
      'scene-ch1-mode',
      'scene-ch2-mode',
      'scene-ch3-mode',
      'scene-ch4-mode',
      'scene-ch5-mode',
      'scene-ch5-approached',
      'scene-finale-mode'
    );
    body.classList.add(className);
  }

  /* ------------------------------------------------------------------------
     4. CSS STARFIELDS & CANVAS PARTICLE ENGINE
     ------------------------------------------------------------------------ */
  function buildCssStarLayer(container, count, colors, maxSize) {
    if (!container) return;
    const shadows = [];
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() * 100).toFixed(2);
      const y = (Math.random() * 100).toFixed(2);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const blur = Math.random() > 0.72 ? (Math.random() * 2 + 1).toFixed(1) : 0;
      const spread = (Math.random() * maxSize).toFixed(1);
      shadows.push(`${x}vw ${y}vh ${blur}px ${spread}px ${color}`);
    }
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.boxShadow = shadows.join(',');
  }

  function initCssStarfields() {
    buildCssStarLayer(
      starsFar,
      110,
      ['rgba(220,234,255,0.45)', 'rgba(57,121,207,0.45)', 'rgba(23,73,165,0.5)'],
      0.55
    );
    buildCssStarLayer(
      starsMid,
      75,
      ['rgba(220,234,255,0.75)', 'rgba(57,121,207,0.7)', 'rgba(233,211,154,0.55)'],
      0.95
    );
    buildCssStarLayer(
      starsNear,
      36,
      ['rgba(220,234,255,0.95)', 'rgba(233,211,154,0.85)', 'rgba(57,121,207,0.85)'],
      1.3
    );
  }

  const canvasEngine = (function () {
    const ctx = cosmosCanvas ? cosmosCanvas.getContext('2d') : null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let shootingStars = [];
    let goldenBurst = [];
    let rafId = 0;
    let lastShootingStarAt = 0;

    function resize() {
      if (!cosmosCanvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cosmosCanvas.width = Math.floor(width * dpr);
      cosmosCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedParticles() {
      const count = width < 640 ? 34 : 62;
      particles = [];
      for (let i = 0; i < count; i += 1) {
        const isGold = i % 5 === 0;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.6 + 0.5,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -Math.random() * 0.22 - 0.05,
          alpha: Math.random() * 0.5 + 0.18,
          gold: isGold
        });
      }
    }

    function spawnShootingStar() {
      const startX = width * (0.15 + Math.random() * 0.65);
      const startY = height * (0.06 + Math.random() * 0.3);
      const speed = 7 + Math.random() * 4;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: speed,
        vy: speed * 0.48,
        life: 0,
        maxLife: 42
      });
    }

    function triggerGoldenExpansion() {
      goldenBurst = [];
      const cx = width * 0.5;
      const cy = height * 0.48;
      const count = width < 640 ? 68 : 120;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.22;
        const speed = 0.7 + Math.random() * 2.8;
        goldenBurst.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 2.2 + 0.8,
          alpha: 0.92,
          decay: 0.0028 + Math.random() * 0.0022
        });
      }
    }

    function drawStaticFrame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(233, 211, 154, ${p.alpha})`
          : `rgba(220, 234, 255, ${p.alpha})`;
        ctx.fill();
      }
    }

    function tick(now) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const inGoldenChapter =
        state.currentScene === 'chapter-5' || state.finaleActive;

      // Ambient floating cosmic particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy * (inGoldenChapter ? 1.45 : 1);

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const useGold = p.gold || (inGoldenChapter && Math.random() > 0.985);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = useGold
          ? `rgba(233, 211, 154, ${Math.min(1, p.alpha * 1.25)})`
          : `rgba(220, 234, 255, ${p.alpha})`;
        ctx.fill();
      }

      // Occasional shooting stars (every ~7–11 seconds)
      if (now - lastShootingStarAt > 7800 && Math.random() < 0.015) {
        spawnShootingStar();
        lastShootingStarAt = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;

        const progress = s.life / s.maxLife;
        const opacity = Math.sin(progress * Math.PI) * 0.85;
        const tailX = s.x - s.vx * 8;
        const tailY = s.y - s.vy * 8;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(57, 121, 207, 0)');
        grad.addColorStop(0.65, `rgba(220, 234, 255, ${opacity * 0.6})`);
        grad.addColorStop(1, `rgba(233, 211, 154, ${opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        if (s.life >= s.maxLife) {
          shootingStars.splice(i, 1);
        }
      }

      // Finale spreading golden particles
      for (let i = goldenBurst.length - 1; i >= 0; i -= 1) {
        const g = goldenBurst[i];
        g.x += g.vx;
        g.y += g.vy;
        g.vx *= 0.996;
        g.vy *= 0.996;
        g.alpha -= g.decay;

        if (g.alpha <= 0.02) {
          goldenBurst.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247, 232, 190, ${g.alpha})`;
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function start() {
      resize();
      seedParticles();
      if (rafId) window.cancelAnimationFrame(rafId);

      if (prefersReducedMotion.matches) {
        drawStaticFrame();
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    window.addEventListener('resize', function () {
      resize();
      if (prefersReducedMotion.matches) drawStaticFrame();
    });

    return { start, triggerGoldenExpansion };
  })();

  function initPointerParallax() {
    if (!cosmosCamera) return;
    window.addEventListener(
      'pointermove',
      function (event) {
        if (prefersReducedMotion.matches) return;
        const normX = (event.clientX / window.innerWidth - 0.5) * -14;
        const normY = (event.clientY / window.innerHeight - 0.5) * -10;
        cosmosCamera.style.setProperty('--cam-x', normX.toFixed(2) + 'px');
        cosmosCamera.style.setProperty('--cam-y', normY.toFixed(2) + 'px');
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------------
     5. BACKGROUND MUSIC CONTROLLER (No Autoplay, Graceful Fallback)
     ------------------------------------------------------------------------ */
  function updateMusicUI(isPlaying) {
    if (!musicToggle || !musicLabel) return;
    if (!state.audioAvailable) {
      musicToggle.classList.remove('is-playing');
      musicToggle.classList.add('is-unavailable');
      musicToggle.setAttribute('aria-pressed', 'false');
      musicLabel.textContent = 'Music Unavailable';
      musicToggle.setAttribute('aria-label', 'Background music file is unavailable');
      return;
    }

    musicToggle.classList.remove('is-unavailable');
    musicToggle.classList.toggle('is-playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    musicLabel.textContent = isPlaying ? 'Pause Music' : 'Play Music';
    musicToggle.setAttribute(
      'aria-label',
      isPlaying ? 'Pause background music' : 'Play background music'
    );
  }

  function initAudio() {
    if (!bgMusic || !musicToggle) return;
    bgMusic.volume = 0.72;

    const handleAudioError = function () {
      state.audioAvailable = false;
      updateMusicUI(false);
    };

    bgMusic.addEventListener('error', handleAudioError);
    const sourceEl = bgMusic.querySelector('source');
    if (sourceEl) {
      sourceEl.addEventListener('error', handleAudioError);
    }

    bgMusic.addEventListener('play', function () {
      updateMusicUI(true);
    });
    bgMusic.addEventListener('pause', function () {
      updateMusicUI(false);
    });

    musicToggle.addEventListener('click', function () {
      if (!state.audioAvailable) return;

      if (bgMusic.paused) {
        const playPromise = bgMusic.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            state.audioAvailable = false;
            updateMusicUI(false);
          });
        }
      } else {
        bgMusic.pause();
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. NAVIGATION & SCENE SWITCHING
     ------------------------------------------------------------------------ */
  function updateNavState() {
    const insideStory = state.currentScene !== 'scene-0';
    chapterNav.hidden = !insideStory;
    hudReplayBtn.hidden = !insideStory;

    const currentChapNum = insideStory
      ? Number(state.currentScene.replace('chapter-', ''))
      : 0;

    navLinks.forEach(function (link) {
      const chapNum = Number(link.dataset.chapter);
      link.disabled = chapNum > state.highestUnlockedChapter;
      link.classList.toggle('is-active', chapNum === currentChapNum);
    });
  }

  async function transitionToScene(targetId) {
    if (state.isTransitioning || state.currentScene === targetId) return;
    state.isTransitioning = true;
    state.sequenceToken += 1;
    const token = state.sequenceToken;

    const currentEl = document.getElementById(state.currentScene);
    const nextEl = document.getElementById(targetId);

    if (!nextEl) {
      state.isTransitioning = false;
      return;
    }

    if (currentEl) {
      currentEl.classList.add('scene--exiting');
      currentEl.classList.remove('scene--active');
      await wait(620);
      if (token !== state.sequenceToken) return;
      currentEl.hidden = true;
      currentEl.classList.remove('scene--exiting');
    }

    state.currentScene = targetId;

    if (targetId.startsWith('chapter-')) {
      const chapNum = Number(targetId.replace('chapter-', ''));
      if (chapNum > state.highestUnlockedChapter) {
        state.highestUnlockedChapter = chapNum;
      }
      if (chapNum === 5 && state.finaleActive) {
        setBodySceneClass('scene-finale-mode');
      } else if (chapNum === 5 && state.ringApproached) {
        setBodySceneClass('scene-ch5-approached');
      } else {
        setBodySceneClass('scene-ch' + chapNum + '-mode');
      }
    } else {
      setBodySceneClass('scene-gate-mode');
    }

    updateNavState();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });

    nextEl.hidden = false;
    // Force reflow before activating CSS transition
    void nextEl.offsetWidth;
    nextEl.classList.add('scene--active');

    onSceneEntered(targetId, token);

    await wait(500);
    if (token === state.sequenceToken) {
      state.isTransitioning = false;
    }
  }

  function onSceneEntered(sceneId, token) {
    if (sceneId === 'chapter-1') {
      playChapterOneEntrance(token);
    } else if (sceneId === 'chapter-2') {
      renderPromise(state.currentPromiseIndex, false);
    } else if (sceneId === 'chapter-4') {
      playChapterFourDreams(token);
    }
  }

  /* ------------------------------------------------------------------------
     7. SCENE 0 — THE SECRET PREMIERE
     ------------------------------------------------------------------------ */
  function setGateFeedback(message, isError) {
    gateFeedback.textContent = message;
    gateFeedback.classList.toggle('is-visible', Boolean(message));
    answer1Input.classList.toggle('is-error', Boolean(isError && !state.q1Passed));
    answer2Input.classList.toggle('is-error', Boolean(isError && state.q1Passed));
  }

  function showQuestionStep(stepNumber) {
    const showFirst = stepNumber === 1;
    q1Step.hidden = !showFirst;
    q2Step.hidden = showFirst;
    setGateFeedback('', false);

    if (showFirst) {
      answer1Input.focus();
    } else {
      answer2Input.focus();
    }
  }

  async function runOpeningIntroduction() {
    state.sequenceToken += 1;
    const token = state.sequenceToken;

    // Reset Scene 0 visual states cleanly to black screen
    body.classList.remove('stars-awakened', 'cosmos-brightened');
    setBodySceneClass('scene-gate-mode');

    state.q1Passed = false;
    answer1Input.value = '';
    answer2Input.value = '';
    setGateFeedback('', false);
    q1Step.hidden = false;
    q2Step.hidden = true;

    gateStage.hidden = false;
    gateStage.classList.remove('is-fading-out');
    premiereSequence.hidden = true;
    premiereTitleLockup.hidden = true;
    premiereTitleLockup.classList.remove('is-visible');
    countdownDisplay.hidden = false;
    countdownDisplay.textContent = '';
    countdownDisplay.classList.remove('is-visible');

    premiereHeader.classList.remove('is-visible');
    premierePrologue.classList.remove('is-visible');
    gateForm.classList.remove('is-visible');
    gateFooterActions.classList.remove('is-visible');

    // Step 1: Awaken stars from pure black screen
    await wait(650);
    if (token !== state.sequenceToken) return;
    body.classList.add('stars-awakened');

    // Step 2: Reveal private screening title
    await wait(1150);
    if (token !== state.sequenceToken) return;
    premiereHeader.classList.add('is-visible');

    // Step 3: Short cinematic pause before prologue
    await wait(1400);
    if (token !== state.sequenceToken) return;
    premierePrologue.classList.add('is-visible');

    // Step 4: Introduce Question 01
    await wait(1200);
    if (token !== state.sequenceToken) return;
    gateForm.classList.add('is-visible');
    gateFooterActions.classList.add('is-visible');
    answer1Input.focus({ preventScroll: true });
  }

  function validateQuestionOne() {
    const val = normalizeAnswer(answer1Input.value);
    if (!val) {
      setGateFeedback('Take a moment and whisper the name first.', true);
      answer1Input.focus();
      return false;
    }

    if (!ACCEPTED_Q1.includes(val)) {
      setGateFeedback(
        'Not quite that one, love. Think of the name only we share and try again.',
        true
      );
      answer1Input.select();
      return false;
    }

    state.q1Passed = true;
    showQuestionStep(2);
    return true;
  }

  async function validateAndStartPremiere(event) {
    event.preventDefault();
    if (state.isTransitioning) return;

    // Ensure Question 1 is validated even if user somehow submitted early
    if (!state.q1Passed) {
      validateQuestionOne();
      return;
    }

    const q1Val = normalizeAnswer(answer1Input.value);
    const q2Val = normalizeAnswer(answer2Input.value);

    if (!ACCEPTED_Q1.includes(q1Val)) {
      state.q1Passed = false;
      showQuestionStep(1);
      setGateFeedback(
        'Let us begin again with the first question.',
        true
      );
      return;
    }

    if (!q2Val) {
      setGateFeedback('Enter our favourite date before stepping inside.', true);
      answer2Input.focus();
      return;
    }

    if (q2Val !== ACCEPTED_Q2) {
      setGateFeedback(
        'That date does not feel like ours. Take a quiet breath and try again.',
        true
      );
      answer2Input.select();
      return;
    }

    // Both answers verified — lock gate & play premiere countdown
    state.isTransitioning = true;
    state.sequenceToken += 1;
    const token = state.sequenceToken;

    setGateFeedback('', false);
    gateStage.classList.add('is-fading-out');
    await wait(850);
    if (token !== state.sequenceToken) return;

    gateStage.hidden = true;
    body.classList.add('cosmos-brightened');
    premiereSequence.hidden = false;

    const counts = ['3...', '2...', '1...'];
    for (const count of counts) {
      countdownDisplay.textContent = count;
      countdownDisplay.classList.add('is-visible');
      await wait(850);
      if (token !== state.sequenceToken) return;
      countdownDisplay.classList.remove('is-visible');
      await wait(320);
      if (token !== state.sequenceToken) return;
    }

    countdownDisplay.hidden = true;
    premiereTitleLockup.hidden = false;
    void premiereTitleLockup.offsetWidth;
    premiereTitleLockup.classList.add('is-visible');

    await wait(3200);
    if (token !== state.sequenceToken) return;

    state.isTransitioning = false;
    await transitionToScene('chapter-1');
  }

  /* ------------------------------------------------------------------------
     8. CHAPTER 1 — BEYOND THE STARS, THERE IS US
     ------------------------------------------------------------------------ */
  async function playChapterOneEntrance(token) {
    ch1Whisper.classList.remove('is-visible');
    ch1Actions.classList.remove('is-visible');
    toChapter2Btn.disabled = true;

    await wait(1400);
    if (token !== state.sequenceToken) return;
    ch1Whisper.classList.add('is-visible');

    await wait(1300);
    if (token !== state.sequenceToken) return;
    ch1Actions.classList.add('is-visible');
    toChapter2Btn.disabled = false;
  }

  /* ------------------------------------------------------------------------
     9. CHAPTER 2 — TWELVE LITTLE PROMISES
     ------------------------------------------------------------------------ */
  function buildPromiseSegments() {
    promiseSegments.innerHTML = '';
    for (let i = 0; i < PROMISES.length; i += 1) {
      const seg = document.createElement('span');
      seg.className = 'promise-segment';
      promiseSegments.appendChild(seg);
    }
  }

  function renderPromise(index, animate) {
    const safeIndex = Math.max(0, Math.min(PROMISES.length - 1, index));
    state.currentPromiseIndex = safeIndex;

    const updateDOM = function () {
      const numLabel = padTwo(safeIndex + 1);
      promiseProgressText.textContent = `Promise ${numLabel} of 12`;
      promiseNumber.textContent = `Promise ${numLabel}`;
      promiseQuote.textContent = PROMISES[safeIndex];

      const segments = promiseSegments.querySelectorAll('.promise-segment');
      segments.forEach(function (seg, idx) {
        seg.classList.toggle('is-revealed', idx < safeIndex);
        seg.classList.toggle('is-current', idx === safeIndex);
      });

      promisePrevBtn.disabled = safeIndex === 0;
      promiseNextBtn.textContent =
        safeIndex === PROMISES.length - 1 ? 'Complete Promises' : 'Next Promise';
    };

    if (!animate || prefersReducedMotion.matches) {
      updateDOM();
      return;
    }

    promiseCard.classList.add('is-transitioning');
    window.setTimeout(function () {
      updateDOM();
      promiseCard.classList.remove('is-transitioning');
    }, 240);
  }

  async function completeTwelvePromises() {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    state.promisesCompleted = true;

    promisesDeck.hidden = true;
    promisesOutro.hidden = false;
    void promisesOutro.offsetWidth;
    promisesOutro.classList.add('is-visible');

    await wait(600);
    state.isTransitioning = false;
  }

  /* ------------------------------------------------------------------------
     10. CHAPTER 3 — A LETTER FROM YOUR FOX
     ------------------------------------------------------------------------ */
  async function openEnvelopeSequence() {
    if (state.letterOpened || state.isTransitioning) return;
    state.isTransitioning = true;
    state.sequenceToken += 1;
    const token = state.sequenceToken;

    envelopeTrigger.disabled = true;

    // 1. Envelope approaches & wax seal glows
    envelopeTrigger.classList.add('is-opening');
    await wait(750);
    if (token !== state.sequenceToken) return;

    // 2. Wax seal dissolves
    envelopeTrigger.classList.add('is-seal-broken');
    await wait(450);
    if (token !== state.sequenceToken) return;

    // 3. Envelope flap opens & letter slides upward
    envelopeTrigger.classList.add('is-flap-open', 'is-letter-rising');
    await wait(1050);
    if (token !== state.sequenceToken) return;

    // 4. Unfold complete readable letter
    envelopeStage.hidden = true;
    letterStage.hidden = false;
    void letterStage.offsetWidth;
    letterStage.classList.add('is-visible');
    state.letterOpened = true;

    await wait(450);
    if (token !== state.sequenceToken) return;
    letterSheet.focus({ preventScroll: true });
    state.isTransitioning = false;
  }

  /* ------------------------------------------------------------------------
     11. CHAPTER 4 — TWO DREAMS. ONE SKY.
     ------------------------------------------------------------------------ */
  async function playChapterFourDreams(token) {
    if (state.dreamsRevealed) {
      dreamSentences.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      dreamsActions.hidden = false;
      dreamsActions.classList.add('is-visible');
      return;
    }

    dreamSentences.forEach(function (el) {
      el.classList.remove('is-revealed', 'is-latest');
    });
    dreamsActions.hidden = true;
    dreamsActions.classList.remove('is-visible');

    await wait(700);
    if (token !== state.sequenceToken) return;

    for (let i = 0; i < dreamSentences.length; i += 1) {
      dreamSentences.forEach(function (el) {
        el.classList.remove('is-latest');
      });
      dreamSentences[i].classList.add('is-revealed', 'is-latest');

      const pauseMs = i === 2 ? 3000 : 2100;
      await wait(pauseMs);
      if (token !== state.sequenceToken) return;
    }

    state.dreamsRevealed = true;
    dreamsActions.hidden = false;
    void dreamsActions.offsetWidth;
    dreamsActions.classList.add('is-visible');
  }

  /* ------------------------------------------------------------------------
     12. CHAPTER 5 — OUR LITTLE FOREVER
     ------------------------------------------------------------------------ */
  async function handleRingClick() {
    if (state.ringApproached || state.isTransitioning) return;
    state.isTransitioning = true;
    state.ringApproached = true;
    state.sequenceToken += 1;
    const token = state.sequenceToken;

    ringTrigger.classList.add('is-activated');
    ringTrigger.disabled = true;
    foreverOpening.classList.add('is-dimmed');
    pedestalStage.classList.add('is-approached');
    setBodySceneClass('scene-ch5-approached');

    await wait(950);
    if (token !== state.sequenceToken) return;

    ringProposal.hidden = false;
    for (let i = 0; i < proposalLines.length; i += 1) {
      proposalLines[i].classList.add('is-revealed');
      await wait(i === 1 ? 2300 : 1650);
      if (token !== state.sequenceToken) return;
    }

    proposalActions.hidden = false;
    void proposalActions.offsetWidth;
    proposalActions.classList.add('is-visible');
    state.isTransitioning = false;
  }

  async function handleForeverYes() {
    if (state.finaleActive || state.isTransitioning) return;
    state.isTransitioning = true;
    state.finaleActive = true;
    state.sequenceToken += 1;
    const token = state.sequenceToken;

    yesForeverBtn.disabled = true;

    // 1. Ring glows brightly & golden particles spread throughout universe
    canvasEngine.triggerGoldenExpansion();
    setBodySceneClass('scene-finale-mode');

    ringCeremony.classList.add('is-fading-out');
    await wait(1100);
    if (token !== state.sequenceToken) return;

    ringCeremony.hidden = true;
    finalScene.hidden = false;
    void finalScene.offsetWidth;
    finalScene.classList.add('is-visible');

    await wait(800);
    if (token === state.sequenceToken) {
      state.isTransitioning = false;
    }
  }

  /* ------------------------------------------------------------------------
     13. FULL REPLAY FROM BEGINNING
     ------------------------------------------------------------------------ */
  async function replayFullStory() {
    if (state.isTransitioning) return;
    state.sequenceToken += 1;

    // Hide currently visible chapter cleanly
    document.querySelectorAll('.scene').forEach(function (sec) {
      sec.hidden = true;
      sec.classList.remove('scene--active', 'scene--exiting');
    });

    // Reset story progression states while preserving music playback
    state.currentScene = 'scene-0';
    state.highestUnlockedChapter = 0;
    state.currentPromiseIndex = 0;
    state.promisesCompleted = false;
    state.letterOpened = false;
    state.dreamsRevealed = false;
    state.ringApproached = false;
    state.finaleActive = false;

    // Reset Chapter 2 UI
    promisesDeck.hidden = false;
    promisesOutro.hidden = true;
    promisesOutro.classList.remove('is-visible');
    renderPromise(0, false);

    // Reset Chapter 3 UI
    envelopeStage.hidden = false;
    envelopeTrigger.disabled = false;
    envelopeTrigger.classList.remove(
      'is-opening',
      'is-seal-broken',
      'is-flap-open',
      'is-letter-rising'
    );
    letterStage.hidden = true;
    letterStage.classList.remove('is-visible');

    // Reset Chapter 4 UI
    dreamSentences.forEach(function (el) {
      el.classList.remove('is-revealed', 'is-latest');
    });
    dreamsActions.hidden = true;
    dreamsActions.classList.remove('is-visible');

    // Reset Chapter 5 UI
    ringCeremony.hidden = false;
    ringCeremony.classList.remove('is-fading-out');
    foreverOpening.classList.remove('is-dimmed');
    pedestalStage.classList.remove('is-approached');
    ringTrigger.disabled = false;
    ringTrigger.classList.remove('is-activated');
    ringProposal.hidden = true;
    proposalLines.forEach(function (el) {
      el.classList.remove('is-revealed');
    });
    proposalActions.hidden = true;
    proposalActions.classList.remove('is-visible');
    yesForeverBtn.disabled = false;
    finalScene.hidden = true;
    finalScene.classList.remove('is-visible');

    const scene0 = document.getElementById('scene-0');
    scene0.hidden = false;
    scene0.classList.add('scene--active');
    updateNavState();
    window.scrollTo({ top: 0, behavior: 'auto' });

    await runOpeningIntroduction();
  }

  /* ------------------------------------------------------------------------
     14. EVENT BINDINGS & INITIALIZATION
     ------------------------------------------------------------------------ */
  function bindEvents() {
    // Question 01 -> Question 02
    q1NextBtn.addEventListener('click', validateQuestionOne);

    answer1Input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        validateQuestionOne();
      }
    });

    answer1Input.addEventListener('input', function () {
      if (gateFeedback.classList.contains('is-visible')) {
        setGateFeedback('', false);
      }
    });

    answer2Input.addEventListener('input', function () {
      if (gateFeedback.classList.contains('is-visible')) {
        setGateFeedback('', false);
      }
    });

    q2BackBtn.addEventListener('click', function () {
      showQuestionStep(1);
    });

    gateForm.addEventListener('submit', validateAndStartPremiere);

    gateReplayBtn.addEventListener('click', function () {
      if (!state.isTransitioning) {
        runOpeningIntroduction();
      }
    });

    // HUD Navigation & Replay
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        const chapNum = Number(link.dataset.chapter);
        if (chapNum <= state.highestUnlockedChapter) {
          transitionToScene('chapter-' + chapNum);
        }
      });
    });

    hudReplayBtn.addEventListener('click', replayFullStory);
    finalReplayBtn.addEventListener('click', replayFullStory);

    // Chapter 1 -> Chapter 2
    toChapter2Btn.addEventListener('click', function () {
      transitionToScene('chapter-2');
    });

    // Chapter 2 Promises Navigation
    promisePrevBtn.addEventListener('click', function () {
      if (state.currentPromiseIndex > 0) {
        renderPromise(state.currentPromiseIndex - 1, true);
      }
    });

    promiseNextBtn.addEventListener('click', function () {
      if (state.currentPromiseIndex < PROMISES.length - 1) {
        renderPromise(state.currentPromiseIndex + 1, true);
      } else {
        completeTwelvePromises();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (state.currentScene !== 'chapter-2' || state.promisesCompleted) return;
      if (event.key === 'ArrowRight') {
        promiseNextBtn.click();
      } else if (event.key === 'ArrowLeft' && state.currentPromiseIndex > 0) {
        promisePrevBtn.click();
      }
    });

    toChapter3Btn.addEventListener('click', function () {
      transitionToScene('chapter-3');
    });

    // Chapter 3 Envelope & Letter
    envelopeTrigger.addEventListener('click', openEnvelopeSequence);

    toChapter4Btn.addEventListener('click', function () {
      transitionToScene('chapter-4');
    });

    // Chapter 4 -> Chapter 5
    toChapter5Btn.addEventListener('click', function () {
      transitionToScene('chapter-5');
    });

    // Chapter 5 Ring Ceremony & Final Yes
    ringTrigger.addEventListener('click', handleRingClick);
    yesForeverBtn.addEventListener('click', handleForeverYes);
  }

  function init() {
    initCssStarfields();
    buildPromiseSegments();
    renderPromise(0, false);
    initAudio();
    initPointerParallax();
    canvasEngine.start();
    bindEvents();
    updateNavState();
    runOpeningIntroduction();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
