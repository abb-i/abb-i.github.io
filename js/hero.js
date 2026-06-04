(function () {
  var LANGUAGES = [
    { text: 'Hello, I am Abbi',   flag: '🇬🇧' },
    { text: 'Hallo, ich bin Abbi', flag: '🇩🇪' },
    { text: 'Hola, soy Abbi',     flag: '🇪🇸' },
    { text: 'Ciao, sono Abbi',    flag: '🇮🇹' },
    { text: '你好，我是Abbi',       flag: '🇨🇳' },
    { text: 'Olá, eu sou Abbi',   flag: '🇧🇷' },
  ];

  var heading = document.getElementById('hero-heading');
  var flag    = document.getElementById('hero-flag');
  var content = document.getElementById('hero-content');
  var video   = document.getElementById('hero-video');

  if (!heading || !flag || !content) return;

  var langIndex = 0;

  // Video fade-in
  if (video) {
    video.addEventListener('canplay', function () { video.style.opacity = '1'; });
    if (video.readyState >= 3) video.style.opacity = '1';
  }

  // Hero reveal after 80ms
  setTimeout(function () {
    content.classList.add('hero-animate');

    // Start language cycling after 2200ms
    setTimeout(function () {
      setInterval(cycle, 4000);
    }, 2200);
  }, 80);

  function cycle() {
    langIndex = (langIndex + 1) % LANGUAGES.length;
    var target = LANGUAGES[langIndex];
    var count  = 0;
    var STEPS  = 14;

    heading.classList.add('text-shuffle');
    flag.classList.add('text-shuffle');

    var timer = setInterval(function () {
      var rand = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
      heading.textContent = rand.text;
      flag.textContent    = rand.flag;

      // Re-trigger flash animation each step
      heading.classList.remove('text-shuffle');
      flag.classList.remove('text-shuffle');
      void heading.offsetWidth; // force reflow
      heading.classList.add('text-shuffle');
      flag.classList.add('text-shuffle');

      count++;
      if (count >= STEPS) {
        clearInterval(timer);
        heading.textContent = target.text;
        flag.textContent    = target.flag;
        heading.classList.remove('text-shuffle');
        flag.classList.remove('text-shuffle');
      }
    }, 75);
  }
})();
