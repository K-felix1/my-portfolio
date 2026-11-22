
const sidebar = document.getElementById('sidebar');
const toggle  = document.getElementById('menu-toggle');
const scrim   = document.getElementById('scrim');
const loader  = document.getElementById('loader');

function setMenu(open) {
  if (!sidebar) return;
  sidebar.classList.toggle('open', open);
  if (scrim) scrim.classList.toggle('show', open);
  if (toggle) {
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
}

if (toggle && sidebar) toggle.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
if (scrim) scrim.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Every link to another page on this site (menu links AND buttons) shows the loader first
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  const isInternal = href && !/^(https?:|mailto:|tel:|#)/.test(href) && link.target !== '_blank';
  if (!isInternal) return;

  link.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;       // let new-tab clicks work normally
    setMenu(false);
    if (link.pathname === window.location.pathname) return;  // already on this page: do nothing special
    if (!loader) return;                                     // no loader on this page: normal link
    e.preventDefault();
    loader.classList.add('show');
    setTimeout(() => { window.location.href = link.href; }, 900);
  });
});

// If the visitor presses Back, hide the loader again
window.addEventListener('pageshow', () => { if (loader) loader.classList.remove('show'); });
/* ===== Extra animations ===== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Scroll reveal: cards and headings slide up when they come into view
const revealItems = document.querySelectorAll('main .card, main > h2, main > p');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 80 + 'ms';   // small stagger
    io.observe(el);
  });
}

// 2. Typing effect on the home heading
const heading = document.querySelector('header h1');
if (heading && heading.textContent.startsWith('Hi,') && !reduceMotion) {
  const fullText = heading.textContent;
  heading.textContent = '';
  const caret = document.createElement('span');
  caret.className = 'caret';
  heading.appendChild(caret);
  let i = 0;
  const typer = setInterval(() => {
    caret.before(fullText[i]);
    i++;
    if (i >= fullText.length) {
      clearInterval(typer);
      setTimeout(() => caret.remove(), 1500);
    }
  }, 80);
}

// 3. Button ripple effect
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = (e.clientX - rect.left - size / 2) + 'px';
    dot.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
    btn.appendChild(dot);
    setTimeout(() => dot.remove(), 600);
  });
});

// 4. Scroll progress bar and back-to-top button
const bar = document.createElement('div');
bar.id = 'progress';
document.body.appendChild(bar);

const toTop = document.createElement('button');
toTop.id = 'to-top';
toTop.setAttribute('aria-label', 'Back to top');
toTop.innerHTML = '&#8593;';
document.body.appendChild(toTop);
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('scroll', () => {
  const scrolled = document.documentElement.scrollTop;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  toTop.classList.toggle('show', scrolled > 300);
}, { passive: true });

/* ===== Animated skill bars ===== */
const skills = document.querySelectorAll('.skill');
if (skills.length) {
  const animateSkill = (skill) => {
    const level = parseInt(skill.dataset.level, 10);
    const fill = skill.querySelector('.skill-fill');
    const num = skill.querySelector('.skill-num');

    if (reduceMotion) {                 // no animation for people who turned it off
      fill.style.width = level + '%';
      num.textContent = level + '%';
      return;
    }

    fill.style.width = level + '%';     // CSS transition animates the bar

    // count the number up from 0
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      num.textContent = Math.round(eased * level) + '%';
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => animateSkill(entry.target), i * 150);   // bars start one after another
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  skills.forEach(s => skillObserver.observe(s));
}