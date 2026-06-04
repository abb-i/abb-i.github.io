document.addEventListener('DOMContentLoaded', function () {

  function makeObserver(threshold, callback) {
    return new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) callback(entry.target, obs);
      });
    }, { threshold: threshold });
  }

  function show(el) { el.classList.add('is-visible'); }

  // ── About section ────────────────────────────────────────────
  var aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    makeObserver(0.15, function (target, obs) {
      obs.unobserve(target);
      target.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(show);
    }).observe(aboutSection);
  }

  // ── Portfolio header + grid items ────────────────────────────
  var portfolioSection = document.querySelector('.portfolio-section');
  if (portfolioSection) {
    makeObserver(0.05, function (target, obs) {
      obs.unobserve(target);
      var header = target.querySelector('.portfolio-header');
      if (header) show(header);
      target.querySelectorAll('.portfolio-grid-item').forEach(function (item, i) {
        setTimeout(function () { show(item); }, i * 120);
      });
    }).observe(portfolioSection);
  }

  // ── Timeline heading ─────────────────────────────────────────
  var tlHeader = document.querySelector('.timeline-header');
  if (tlHeader) {
    makeObserver(0.3, function (target, obs) {
      obs.unobserve(target); show(target);
    }).observe(tlHeader);
  }

  // ── Timeline entries (image + text cols) ─────────────────────
  document.querySelectorAll('.timeline-entry').forEach(function (entry) {
    makeObserver(0.15, function (target, obs) {
      obs.unobserve(target);
      target.querySelectorAll('.tl-img-col, .tl-text-col').forEach(show);
    }).observe(entry);
  });

  // ── Timeline story button ────────────────────────────────────
  var storyBtn = document.querySelector('.tl-story-btn');
  if (storyBtn) {
    makeObserver(0.5, function (target, obs) {
      obs.unobserve(target); show(target);
    }).observe(storyBtn);
  }

  // ── Newsletter ───────────────────────────────────────────────
  var nlContent = document.querySelector('.newsletter-content');
  if (nlContent) {
    makeObserver(0.3, function (target, obs) {
      obs.unobserve(target); show(target);
    }).observe(nlContent);
  }

  // ── Social links ─────────────────────────────────────────────
  var socialSection = document.querySelector('.social-section');
  if (socialSection) {
    makeObserver(0.3, function (target, obs) {
      obs.unobserve(target);
      target.querySelectorAll('.social-link').forEach(function (link, i) {
        setTimeout(function () { show(link); }, i * 80);
      });
    }).observe(socialSection);
  }

});
