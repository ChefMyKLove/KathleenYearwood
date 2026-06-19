(function () {
  // Continuously perturbs the SVG turbulence baseFrequency so the
  // distortion pattern never repeats identically — this is what
  // makes the swirl read as "alive" rather than a looping GIF.
  // Same technique as NakedStory's cover-cloud-swirl / bg-anim.js,
  // simplified: no background image cycle, just the one cover photo.

  var t = 0;

  function startSwirl() {
    var turb  = document.getElementById('cloud-turb');
    var turb2 = document.getElementById('cloud-turb-b');
    if (!turb) return;

    function tick() {
      t += 0.00055;

      var fx = 0.009 + Math.sin(t * 1.10) * 0.011 + Math.sin(t * 2.30) * 0.005;
      var fy = 0.011 + Math.cos(t * 0.75) * 0.010 + Math.cos(t * 1.90) * 0.005;
      turb.setAttribute('baseFrequency', fx.toFixed(5) + ' ' + fy.toFixed(5));

      if (turb2) {
        var fx2 = 0.010 + Math.sin(t * 0.85 + 2.10) * 0.011 + Math.sin(t * 1.70) * 0.005;
        var fy2 = 0.009 + Math.cos(t * 0.60 + 1.50) * 0.010 + Math.cos(t * 1.50) * 0.005;
        turb2.setAttribute('baseFrequency', fx2.toFixed(5) + ' ' + fy2.toFixed(5));
      }

      requestAnimationFrame(tick);
    }
    tick();
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    startSwirl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
