document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.portfolio-card').forEach(function (card) {
    var video = card.querySelector('.card-video');

    card.addEventListener('mouseenter', function () {
      if (video) video.play().catch(function () {});
    });

    card.addEventListener('mouseleave', function () {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    if (card.classList.contains('no-link')) {
      card.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });
});
