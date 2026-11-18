(function () {
  const root = document.documentElement;
  const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };

  // Language
  function setLang(l){
    root.setAttribute('data-lang', l); root.lang = l; store.set('lang', l);
    document.querySelectorAll('[data-lang-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.langBtn === l)));
  }
  document.querySelectorAll('[data-lang-btn]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.langBtn)));
  setLang(root.getAttribute('data-lang') || 'es');

  // Theme
  const themeBtn = document.getElementById('theme');
  function applyTheme(t){ if (t === 'light') root.setAttribute('data-theme','light'); else root.removeAttribute('data-theme'); store.set('theme', t); }
  themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else { document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); }

  // Case nav highlight
  const caseLinks = Array.from(document.querySelectorAll('.case nav a'));
  if (caseLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(caseLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => { const a = map.get(e.target.id); if (!a) return; if (e.isIntersecting) { a.closest('nav').querySelectorAll('a').forEach(x => x.classList.remove('on')); a.classList.add('on'); } });
    }, { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((a, id) => { const el = document.getElementById(id); if (el) io2.observe(el); });
  }

  // Embedded demos: desktop/mobile, reload, fullscreen
  document.querySelectorAll('[data-embed]').forEach(frame => {
    const stage = frame.querySelector('.stage');
    const iframe = stage.querySelector('iframe');
    const src = iframe.getAttribute('src');
    frame.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      frame.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      stage.classList.toggle('mobile', btn.dataset.view === 'mobile');
    }));
    frame.querySelector('[data-reload]').addEventListener('click', () => { iframe.src = 'about:blank'; setTimeout(() => { iframe.src = src; }, 50); });
    frame.querySelector('[data-full]').addEventListener('click', () => openOverlay(src, iframe.title));
  });

  function openOverlay(src, title){
    const ov = document.createElement('div');
    ov.className = 'overlay'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label', title);
    const es = root.getAttribute('data-lang') !== 'en';
    ov.innerHTML = `<div class="frame-bar"><div class="dots"><i></i><i></i><i></i></div><div class="url">${src.replace(/^https?:\/\//,'')}</div><div class="frame-actions"><a href="${src}" target="_blank" rel="noopener">${es?'Abrir en pestaña':'Open in tab'} ↗</a><button type="button" data-close>${es?'Cerrar':'Close'} ✕</button></div></div><iframe src="${src}" title="${title}" allow="clipboard-write"></iframe>`;
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    const close = () => { ov.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    ov.querySelector('[data-close]').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    ov.querySelector('[data-close]').focus();
  }

  // Copy buttons
  document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.copy); const txt = el.textContent.trim();
    const es = root.getAttribute('data-lang') !== 'en';
    const flash = (ok) => { const old = btn.innerHTML; btn.textContent = ok ? (es ? 'Copiado' : 'Copied') : (es ? 'Selecciona y copia' : 'Select and copy'); setTimeout(() => { btn.innerHTML = old; }, 1600); };
    try { await navigator.clipboard.writeText(txt); flash(true); }
    catch (e) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); flash(false); }
  }));
})();
