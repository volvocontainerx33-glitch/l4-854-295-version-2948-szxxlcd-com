(function() {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
      restartHero();
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
      restartHero();
    });
  });

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  function runFilter(form) {
    var root = form.closest('[data-filter-root]') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var input = form.querySelector('[data-filter-input]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var sortSelect = form.querySelector('[data-filter-sort]');
    var empty = root.querySelector('.search-empty');
    var query = input ? input.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || cardYear === year;
      var show = matchQuery && matchYear;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (sortSelect) {
      var grid = root.querySelector('.movie-grid');
      if (grid) {
        var shownCards = cards.filter(function(card) {
          return card.style.display !== 'none';
        });
        shownCards.sort(function(a, b) {
          if (sortSelect.value === 'rating') {
            return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          }
          if (sortSelect.value === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
        shownCards.forEach(function(card) {
          grid.appendChild(card);
        });
      }
    }

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  searchForms.forEach(function(form) {
    var input = form.querySelector('[data-filter-input]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var sortSelect = form.querySelector('[data-filter-sort]');

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      runFilter(form);
    });

    [input, yearSelect, sortSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', function() {
          runFilter(form);
        });
        control.addEventListener('change', function() {
          runFilter(form);
        });
      }
    });

    if (input && window.location.search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    runFilter(form);
  });
})();
