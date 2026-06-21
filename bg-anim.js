(function () {
  // Continuously perturbs the SVG turbulence baseFrequency so the
  // distortion pattern never repeats identically.
  //
  // Performance optimizations:
  //   - Skips entirely on mobile (max-width: 768px) — CSS handles static fallback
  //   - Throttles setAttribute calls to ~15fps (the swirl moves slowly enough
  //     that 15fps is imperceptible, but saves ~75% GPU filter re-renders)
  //   - Pauses the rAF loop when neither the cover nor moon section is visible
  //   - Pauses when the browser tab is hidden

  var t = 0;
  var rafId = null;
  var lastUpdateTime = 0;
  var UPDATE_INTERVAL = 1000 / 15; // ~15fps
  var visibleCount = 0;            // count of animated sections currently in viewport
  var tick;                        // forward-declared below

  function startSwirl() {
    var turb  = document.getElementById('cloud-turb');
    var turb2 = document.getElementById('cloud-turb-b');
    if (!turb) return;

    function updateFilters(now) {
      if (now - lastUpdateTime < UPDATE_INTERVAL) return;
      var dt = lastUpdateTime ? Math.min(now - lastUpdateTime, 200) : 16.67;
      lastUpdateTime = now;
      // Scale increment by actual elapsed time so visual speed is stable
      t += 0.00055 * (dt / 16.67);

      var fx = 0.009 + Math.sin(t * 1.10) * 0.011 + Math.sin(t * 2.30) * 0.005;
      var fy = 0.011 + Math.cos(t * 0.75) * 0.010 + Math.cos(t * 1.90) * 0.005;
      turb.setAttribute('baseFrequency', fx.toFixed(5) + ' ' + fy.toFixed(5));

      if (turb2) {
        var fx2 = 0.010 + Math.sin(t * 0.85 + 2.10) * 0.011 + Math.sin(t * 1.70) * 0.005;
        var fy2 = 0.009 + Math.cos(t * 0.60 + 1.50) * 0.010 + Math.cos(t * 1.50) * 0.005;
        turb2.setAttribute('baseFrequency', fx2.toFixed(5) + ' ' + fy2.toFixed(5));
      }
    }

    tick = function (now) {
      updateFilters(now);
      if (visibleCount > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    // Track which animated sections are in the viewport
    function observeSection(el) {
      if (!el) return;
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          visibleCount++;
          if (!rafId && !document.hidden) {
            rafId = requestAnimationFrame(tick);
          }
        } else {
          visibleCount = Math.max(0, visibleCount - 1);
        }
      }, { threshold: 0 });
      obs.observe(el);
    }

    observeSection(document.querySelector('.cover'));
    observeSection(document.querySelector('.moon-section'));

    // Pause when tab goes to background, resume when it returns
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (visibleCount > 0 && !rafId) {
        rafId = requestAnimationFrame(tick);
      }
    });

    // Cover is visible on initial page load, so start immediately
    visibleCount = 1;
    rafId = requestAnimationFrame(tick);
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;
    startSwirl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
