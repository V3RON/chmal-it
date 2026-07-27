(() => {
  const stage = document.querySelector('#stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const overview = document.querySelector('#overview');
  const fullscreen = document.querySelector('#fullscreen');
  const counter = document.querySelector('#counter');
  const progress = document.querySelector('#progress-bar');
  const rozeniteSlide = document.querySelector('.rozenite-origin');
  const rozeniteTabs = Array.from(rozeniteSlide?.querySelectorAll('[data-rozenite-tab]') ?? []);
  const rozenitePanels = Array.from(rozeniteSlide?.querySelectorAll('[data-rozenite-panel]') ?? []);
  let activeRozeniteTab = 0;
  let rozeniteTabTimer;

  function showRozeniteTab(index) {
    activeRozeniteTab = index;
    const tabName = rozeniteTabs[index]?.dataset.rozeniteTab;

    rozeniteTabs.forEach((tab) => {
      const isActive = tab.dataset.rozeniteTab === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    rozenitePanels.forEach((panel) => {
      const isActive = panel.dataset.rozenitePanel === tabName;
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });
  }

  function syncRozeniteTabs({ reset = false } = {}) {
    window.clearInterval(rozeniteTabTimer);
    if (!rozeniteSlide?.classList.contains('active') || document.body.classList.contains('overview')) return;
    if (reset) showRozeniteTab(0);
    rozeniteTabTimer = window.setInterval(() => {
      showRozeniteTab((activeRozeniteTab + 1) % rozeniteTabs.length);
    }, 2500);
  }

  rozeniteTabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.stopPropagation();
      showRozeniteTab(index);
      syncRozeniteTabs();
    });
  });

  document.querySelectorAll('.pixel-field').forEach((field) => {
    const size = 35;
    const fragment = document.createDocumentFragment();

    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        const x = (column / (size - 1)) * 2 - 1;
        const y = (row / (size - 1)) * 2 - 1;
        const distance = Math.hypot(x, y);
        const directionX = distance === 0 ? 0 : x / distance;
        const directionY = distance === 0 ? 0 : y / distance;
        const dot = document.createElement('span');

        dot.className = 'pixel-dot';
        dot.style.setProperty('--wave-x', directionX.toFixed(3));
        dot.style.setProperty('--wave-y', directionY.toFixed(3));
        dot.style.setProperty('--delay', `${(-distance * 1.55).toFixed(3)}s`);
        fragment.appendChild(dot);
      }
    }

    field.replaceChildren(fragment);
    field.classList.add('pixel-field-ready');
  });

  const leaseSlide = document.querySelector('.remote-lease-slide');

  if (leaseSlide && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const agents = Array.from(leaseSlide.querySelectorAll('.lease-agents span'));
    const devices = Array.from(leaseSlide.querySelectorAll('.lease-devices span'));
    const incomingLines = Array.from(leaseSlide.querySelectorAll('.lease-lines:not(.lease-lines-out) i'));
    const outgoingLines = Array.from(leaseSlide.querySelectorAll('.lease-lines-out i'));
    const proxy = leaseSlide.querySelector('.lease-proxy');
    let previousPair = '';
    let pulseTimer;

    const clearLeasePulse = () => {
      agents.forEach((agent) => agent.classList.remove('lease-node-active'));
      devices.forEach((device) => device.classList.remove('lease-node-active'));
      incomingLines.forEach((line) => line.classList.remove('lease-pulse'));
      outgoingLines.forEach((line) => line.classList.remove('lease-pulse'));
      proxy.classList.remove('lease-proxy-active');
    };

    const scheduleLeasePulse = (delay) => {
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(runLeasePulse, delay);
    };

    const continueIfVisible = (callback) => {
      if (!leaseSlide.classList.contains('active')) {
        clearLeasePulse();
        scheduleLeasePulse(600);
        return;
      }
      callback();
    };

    function runLeasePulse() {
      clearLeasePulse();

      if (!leaseSlide.classList.contains('active')) {
        scheduleLeasePulse(600);
        return;
      }

      let agentIndex;
      let deviceIndex;
      let pair;

      do {
        agentIndex = Math.floor(Math.random() * agents.length);
        deviceIndex = Math.floor(Math.random() * devices.length);
        pair = `${agentIndex}:${deviceIndex}`;
      } while (pair === previousPair && agents.length * devices.length > 1);

      previousPair = pair;
      agents[agentIndex].classList.add('lease-node-active');
      incomingLines[agentIndex].classList.add('lease-pulse');

      pulseTimer = window.setTimeout(() => {
        continueIfVisible(() => {
          incomingLines[agentIndex].classList.remove('lease-pulse');
          proxy.classList.add('lease-proxy-active');
          outgoingLines[deviceIndex].classList.add('lease-pulse');

          pulseTimer = window.setTimeout(() => {
            continueIfVisible(() => {
              proxy.classList.remove('lease-proxy-active');
              outgoingLines[deviceIndex].classList.remove('lease-pulse');
              devices[deviceIndex].classList.add('lease-node-active');

              pulseTimer = window.setTimeout(() => {
                clearLeasePulse();
                scheduleLeasePulse(900 + Math.random() * 1200);
              }, 520);
            });
          }, 600);
        });
      }, 600);
    }

    scheduleLeasePulse(500);
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const fromHash = Number.parseInt(window.location.hash.replace('#', ''), 10);
  let current = Number.isFinite(fromHash) ? clamp(fromHash - 1, 0, slides.length - 1) : 0;
  let idleTimer;

  function scaleStage() {
    if (document.body.classList.contains('overview')) return;
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function render({ focus = false } = {}) {
    slides.forEach((slide, index) => {
      const isActive = index === current;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.querySelectorAll('video').forEach((video) => {
        if (isActive) {
          video.currentTime = 0;
          const playWhenReady = () => {
            if (slide.classList.contains('active')) video.play().catch(() => {});
          };
          if (video.readyState >= 2) {
            playWhenReady();
          } else {
            video.addEventListener('canplay', playWhenReady, { once: true });
          }
        } else {
          video.pause();
        }
      });
      if (isActive && focus) {
        slide.setAttribute('tabindex', '-1');
        slide.focus({ preventScroll: true });
      } else {
        slide.removeAttribute('tabindex');
      }
    });

    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.title = `${slides[current].dataset.title} · Giving Agents Hands and Eyes`;
    window.history.replaceState(null, '', `#${current + 1}`);
    syncRozeniteTabs({ reset: true });
  }

  function goTo(index, options) {
    current = clamp(index, 0, slides.length - 1);
    render(options);
    wakeControls();
  }

  function toggleOverview(force) {
    const shouldOpen = typeof force === 'boolean' ? force : !document.body.classList.contains('overview');
    document.body.classList.toggle('overview', shouldOpen);
    overview.setAttribute('aria-pressed', String(shouldOpen));
    if (shouldOpen) {
      stage.style.transform = 'none';
      slides.forEach((slide) => slide.removeAttribute('aria-hidden'));
    } else {
      render({ focus: true });
      scaleStage();
    }
    syncRozeniteTabs();
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  function wakeControls() {
    document.body.classList.remove('presenter-idle');
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (!document.body.classList.contains('overview')) document.body.classList.add('presenter-idle');
    }, 2600);
  }

  previous.addEventListener('click', () => goTo(current - 1, { focus: true }));
  next.addEventListener('click', () => goTo(current + 1, { focus: true }));
  overview.addEventListener('click', () => toggleOverview());
  fullscreen.addEventListener('click', toggleFullscreen);

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (!document.body.classList.contains('overview')) return;
      current = index;
      toggleOverview(false);
    });
  });

  window.addEventListener('resize', scaleStage);
  window.addEventListener('hashchange', () => {
    const requested = Number.parseInt(window.location.hash.replace('#', ''), 10);
    if (Number.isFinite(requested) && requested - 1 !== current) {
      current = clamp(requested - 1, 0, slides.length - 1);
      render();
    }
  });
  window.addEventListener('mousemove', wakeControls);
  window.addEventListener('pointerdown', wakeControls);
  window.addEventListener('keydown', (event) => {
    const overviewOpen = document.body.classList.contains('overview');

    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      if (!overviewOpen) goTo(current + 1, { focus: true });
      event.preventDefault();
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      if (!overviewOpen) goTo(current - 1, { focus: true });
      event.preventDefault();
    }
    if (event.key === 'Home') goTo(0, { focus: true });
    if (event.key === 'End') goTo(slides.length - 1, { focus: true });
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key.toLowerCase() === 'o' || event.key === 'Escape' && overviewOpen) toggleOverview();
    wakeControls();
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreen.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
    scaleStage();
  });

  render();
  scaleStage();
  wakeControls();
})();
