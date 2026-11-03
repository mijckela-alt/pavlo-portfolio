(function () {
  'use strict';

  /* Мобільне меню */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      nav.classList.toggle('is-open', open);
    };

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });

    window.matchMedia('(min-width: 881px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* Лайтбокс для скріншотів */
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (!links.length) return;

  // група = однакове значення data-lightbox (напр. "review" гортається окремо від скріншотів);
  // посилання на ту саму картинку рахуються один раз
  var groupOf = function (link) {
    var name = link.getAttribute('data-lightbox');
    var seen = {};
    return links.filter(function (l) {
      var href = l.getAttribute('href');
      if (l.getAttribute('data-lightbox') !== name || seen[href]) return false;
      seen[href] = true;
      return true;
    });
  };
  var shots = [];

  var icon = function (d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  };

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Перегляд скріншоту');
  box.innerHTML =
    '<img class="lightbox__img" alt="">' +
    '<button class="lightbox__btn lightbox__close" type="button" aria-label="Закрити">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
    '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Попередній скріншот">' + icon('M15 6l-6 6 6 6') + '</button>' +
    '<button class="lightbox__btn lightbox__next" type="button" aria-label="Наступний скріншот">' + icon('M9 6l6 6-6 6') + '</button>' +
    '<p class="lightbox__caption" aria-live="polite"></p>';
  document.body.appendChild(box);

  var img = box.querySelector('.lightbox__img');
  var caption = box.querySelector('.lightbox__caption');
  var closeBtn = box.querySelector('.lightbox__close');
  var current = 0;
  var opener = null;

  var show = function (index) {
    current = (index + shots.length) % shots.length;
    var link = shots[current];
    var thumb = link.querySelector('img');
    var text = link.getAttribute('data-caption') || (thumb ? thumb.alt : '');
    img.src = link.getAttribute('href');
    img.alt = text;
    caption.textContent = shots.length > 1
      ? (current + 1) + ' / ' + shots.length + (text ? ' — ' + text : '')
      : text;
  };

  var open = function (link) {
    opener = document.activeElement;
    shots = groupOf(link);
    box.classList.toggle('is-single', shots.length < 2);
    for (var i = 0; i < shots.length; i++) {
      if (shots[i].getAttribute('href') === link.getAttribute('href')) break;
    }
    show(i);
    box.classList.add('is-open');
    document.body.classList.add('is-locked');
    closeBtn.focus();
  };

  var close = function () {
    box.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    img.removeAttribute('src');
    if (opener) opener.focus();
  };

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      open(link);
    });
  });

  closeBtn.addEventListener('click', close);
  box.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });

  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      // фокус лишається всередині лайтбокса
      var btns = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
      var first = btns[0];
      var last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // свайп на телефоні
  var startX = null;
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
