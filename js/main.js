(function () {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('menu-overlay');

  function isMenuOpen() {
    return menuOverlay.classList.contains('open');
  }

  function openMenu() {
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-label', 'Close menu');
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    navbar.classList.remove('navbar-scrolled');
  }

  function closeMenu() {
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if (window.scrollY > 60) navbar.classList.add('navbar-scrolled');
  }

  window.addEventListener('scroll', function () {
    if (!isMenuOpen()) {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 60);
    }
  }, { passive: true });

  menuToggle.addEventListener('click', function () {
    isMenuOpen() ? closeMenu() : openMenu();
  });

  menuOverlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();
