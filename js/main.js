(function () {
  'use strict';
  const T = TEAM, root = document.documentElement;
  const $ = (q, c) => (c || document).querySelector(q);
  const $$ = (q, c) => Array.from((c || document).querySelectorAll(q));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const F = Object.assign({ pulse: true, pulseRadius: 56, codeRain: true, codeFlow: true, hacker: true, hackerImage: '', sound: true, soundVolume: .5 }, T.effects || {});
  const initials = n => n.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const ago = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; if (s < 2592000) return Math.round(s / 86400) + ' days ago'; if (s < 31536000) return Math.round(s / 2592000) + ' months ago'; return Math.round(s / 31536000) + ' years ago'; };
  const cache = {
    get: k => { try { const v = JSON.parse(sessionStorage.getItem(k)); return v && Date.now() - v.t < 600000 ? v.d : null; } catch (e) { return null; } },
    set: (k, d) => { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d })); } catch (e) {} }
  };
  const gh = async (path, fresh) => {
    const k = 'xg:' + path; if (!fresh) { const c = cache.get(k); if (c) return c; }
    try { const r = await fetch('https://api.github.com' + path, { headers: { Accept: 'application/vnd.github+json' } }); if (!r.ok) return null; const d = await r.json(); cache.set(k, d); return d; } catch (e) { return null; }
  };
  // Best-effort "is the site up" check (cross-site reads are blocked, so we only test that it answers)
  const ping = url => new Promise(res => {
    const c = new AbortController(), t = setTimeout(() => { c.abort(); res(false); }, 9000);
    fetch(url, { mode: 'no-cors', cache: 'no-store', signal: c.signal }).then(() => { clearTimeout(t); res(true); }).catch(() => { clearTimeout(t); res(false); });
  });

  /* ---------- theme ---------- */
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const saved = ls.get('xtheme'); if (saved) root.dataset.theme = saved;
  $('#themeBtn').onclick = () => { const d = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); root.dataset.theme = d ? 'light' : 'dark'; ls.set('xtheme', root.dataset.theme); };

  /* ---------- static text ---------- */
  document.title = T.fullName + ' | Team Dashboard';
  $('#title').textContent = T.fullName; $('#tagline').textContent = T.tagline;
  const ghUrl = 'https://github.com/' + T.github; $('#ghLink').href = ghUrl; $('#ghBtn').href = ghUrl;
  $('#joinText').textContent = T.join.text; $('#joinBtn').href = T.join.url; $('#y').textContent = new Date().getFullYear();

  /* ---------- members ---------- */
  const members = T.members.map(m => Object.assign({}, m, { status: 'check', user: null, latest: null }));
  const grid = $('#grid'); let io = null;
  if ('IntersectionObserver' in window) io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .1 });
  const mk = m => {
    const el = document.createElement('article'); el.className = 'mc rv';
    el.innerHTML = `<span class="st"></span>
      <div class="mb"><div class="avw">${F.pulse ? '<canvas class="pulse" aria-hidden="true"></canvas>' : ''}<img class="av" alt=""></div><h3><a class="stretch" rel="noopener"></a></h3><p class="role"></p><p class="bio"></p><div class="chips"></div>
      <div class="ms"></div><div class="ml"></div><span class="go">Open portfolio &rarr;</span></div>`;
    const a = $('.stretch', el); a.href = m.portfolio; if (T.openInNewTab) a.target = '_blank';
    $('.chips', el).innerHTML = (m.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
    const links = Object.assign({}, m.github ? { GitHub: 'https://github.com/' + m.github } : {}, m.links || {});
    $('.ml', el).innerHTML = Object.keys(links).map(k => `<a class="sl" href="${esc(links[k])}" target="_blank" rel="noopener">${esc(k)}</a>`).join('');
    m.el = el; const pc = $('.pulse', el); if (pc) addPulse(pc); grid.appendChild(el); if (io) io.observe(el); else el.classList.add('in'); fill(m);
  };
  const fill = m => {
    const el = m.el, u = m.user || {};
    const name = m.name || u.name || m.github || 'Team member';
    $('.stretch', el).textContent = name;
    $('.role', el).textContent = m.role || 'Xander team member';
    $('.bio', el).textContent = m.bio || u.bio || '';
    const av = $('.av', el), src = m.photo || (m.github ? 'https://github.com/' + m.github + '.png?size=200' : '');
    av.alt = name; if (src && av.getAttribute('src') !== src) { av.src = src; av.onerror = () => { if (m.github && !av.dataset.fb) { av.dataset.fb = 1; av.src = 'https://github.com/' + m.github + '.png?size=200'; } else { av.onerror = null; av.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#2a3550"/><text x="50%" y="58%" text-anchor="middle" font-size="30" font-family="sans-serif" fill="#fff">' + initials(name) + '</text></svg>'); } }; }
    const st = $('.st', el); st.className = 'st ' + m.status; st.textContent = m.status === 'online' ? '● Live' : m.status === 'offline' ? '● Offline' : '● Checking...';
    const num = v => v == null ? '–' : v;
    $('.ms', el).innerHTML = m.github ? `<span><b>${num(u.public_repos)}</b> repos</span><span><b>${num(u.followers)}</b> followers</span>` + (m.latest ? `<span>Last push ${ago(m.latest.pushed_at)}</span>` : '') : '';
    m.el.dataset.search = [name, m.role, m.bio || u.bio, (m.tags || []).join(' ')].join(' ').toLowerCase();
  };

  /* ---------- filters ---------- */
  let tag = 'All', query = '';
  const tags = ['All'].concat(Array.from(new Set(members.reduce((a, m) => a.concat(m.tags || []), []))));
  const chips = $('#chips');
  tags.forEach(t => { const b = document.createElement('button'); b.textContent = t; if (t === 'All') b.className = 'on'; b.onclick = () => { tag = t; $$('button', chips).forEach(x => x.classList.toggle('on', x === b)); applyFilter(); }; chips.appendChild(b); });
  const applyFilter = () => {
    let n = 0;
    members.forEach(m => { const ok = (tag === 'All' || (m.tags || []).includes(tag)) && (!query || m.el.dataset.search.includes(query)); m.el.hidden = !ok; if (ok) n++; });
    $('#none').hidden = n > 0;
  };
  $('#q').oninput = e => { query = e.target.value.trim().toLowerCase(); applyFilter(); };

  /* ---------- stats ---------- */
  const shown = {};
  const setNum = (id, v) => {
    const el = $('#' + id), from = shown[id] || 0; shown[id] = v;
    if (reduce || from === v) { el.textContent = v; return; }
    const t0 = performance.now(); (function step(t) { const p = Math.min(1, (t - t0) / 700); el.textContent = Math.round(from + (v - from) * p); if (p < 1) requestAnimationFrame(step); })(t0);
  };
  const totals = () => {
    setNum('sMembers', members.length); setNum('sLive', members.filter(m => m.status === 'online').length);
    setNum('sRepos', members.reduce((s, m) => s + ((m.user && m.user.public_repos) || 0), 0));
    setNum('sFollowers', members.reduce((s, m) => s + ((m.user && m.user.followers) || 0), 0));
  };

  /* ---------- team repos ---------- */
  const repos = async fresh => {
    const box = $('#repos'), d = await gh('/users/' + T.github + '/repos?sort=pushed&per_page=6', fresh);
    if (!d || !d.length) { box.innerHTML = `<p class="empty">No public team projects yet. They will appear here as soon as they are published on <a href="${ghUrl}" target="_blank" rel="noopener">github.com/${esc(T.github)}</a>.</p>`; return; }
    box.innerHTML = d.map(r => `<a class="rp" href="${esc(r.html_url)}" target="_blank" rel="noopener"><h3>${esc(r.name)}</h3><p>${esc(r.description || 'No description yet.')}</p><div class="ms"><span>${esc(r.language || '')}</span><span>★ ${Number(r.stargazers_count) || 0}</span><span>Updated ${ago(r.pushed_at)}</span></div></a>`).join('');
  };

  /* ---------- refresh loop ---------- */
  const refresh = async fresh => {
    await Promise.all(members.map(async m => {
      const jobs = [ping(m.portfolio).then(ok => { m.status = ok ? 'online' : 'offline'; })];
      if (m.github) jobs.push(gh('/users/' + m.github, fresh).then(u => { m.user = u; }), gh('/users/' + m.github + '/repos?sort=pushed&per_page=1', fresh).then(r => { m.latest = r && r[0] || null; }));
      await Promise.all(jobs); fill(m);
    }));
    totals(); repos(fresh);
    const d = new Date(); $('#updated').textContent = 'Last checked ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '.';
  };

  /* ---------- effects: code rain, flowing typed code, ambient music, orbiting pulse ---------- */
  const bg = $('#bg'); bg.innerHTML = '<i></i><i></i><i></i>';
  const isDark = () => root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  let DK = isDark();   // cached so animation loops never query the theme per frame
  new MutationObserver(() => { DK = isDark(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { DK = isDark(); }); } catch (e) {}
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const BPM = 72, SPB = 60 / BPM;   // one tempo shared by the music and every pulse

  // 1. falling code (unchanged)
  if (F.codeRain) {
    const cv = document.createElement('canvas'); bg.appendChild(cv); const g = cv.getContext && cv.getContext('2d');
    if (g) {
      const FS = 16, CH = '01{}[]()<>/;:=+-*&|$#@!?~^%_ABCDEFxyz'.split(''), N = 60; let W, H, cols = [];
      const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; cols = Array.from({ length: Math.ceil(W / FS) }, () => ({ on: Math.random() < .42, y: Math.random() * -40, v: .25 + Math.random() * .55, ch: Array.from({ length: N }, () => CH[(Math.random() * CH.length) | 0]) })); };
      size(); addEventListener('resize', size);
      const draw = () => {
        g.clearRect(0, 0, W, H); g.font = FS + 'px monospace'; const d = DK, rows = H / FS;
        cols.forEach((c, i) => {
          if (!c.on) return; c.y += c.v; if (c.y > rows + 20) { c.y = Math.random() * -30; c.v = .25 + Math.random() * .55; }
          const head = Math.floor(c.y);
          for (let k = 0; k < 18; k++) { const row = head - k; if (row < 0 || row > rows) continue; const a = (1 - k / 18) * (d ? .42 : .2);
            g.fillStyle = k === 0 ? `rgba(200,255,225,${a + .2})` : `rgba(0,${d ? 255 : 150},${d ? 156 : 90},${a})`; g.fillText(c.ch[row % N], i * FS, row * FS); }
          if (Math.random() < .04) c.ch[(Math.random() * N) | 0] = CH[(Math.random() * CH.length) | 0];
        });
        if (!reduce) requestAnimationFrame(draw);
      };
      draw();
    }
  }

  // 2. typed code that flows across the page background (no terminal window)
  const LINES = ['$ whoami', 'xander', '$ sudo apt update && sudo apt upgrade -y', '$ git clone https://github.com/Xander-Land/project.git', '$ cd project && npm install', 'def encrypt(msg, key):', '    return bytes(b ^ key for b in msg)', '$ nmap -sV 192.168.1.0/24   # my own lab network', '$ python3 scan.py --target lab.local', 'import hashlib', 'print(hashlib.sha256(b"xander").hexdigest())', 'SELECT name, role FROM members WHERE team = "Xander";', '$ git commit -m "fix: patch vulnerability"', '$ git push origin main', '# responsible disclosure: report it, never exploit it', 'const ship = () => console.log("deployed");', '$ curl -I https://xander-land.github.io', '$ chmod +x deploy.sh && ./deploy.sh', 'async function fetchTeam() {', '  const r = await fetch("/api/members");', '  return r.json();', '}', '$ docker compose up -d', '$ pytest -q', 'for (const m of members) render(m);', '# bug bounty: read the scope first', 'CREATE INDEX idx_member ON members(name);', '$ npm run build'];
  if (F.codeFlow) {
    const cv = document.createElement('canvas'); cv.className = 'flow'; bg.appendChild(cv);
    const g = cv.getContext && cv.getContext('2d');
    if (g) {
      const ROWS = 8, KW = /\b(const|let|def|return|import|await|async|function|for|SELECT|FROM|WHERE|CREATE|INDEX|ON|sudo|git|npm|nmap|curl|chmod|python3|pytest|docker|cd|apt|print|console)\b/g;
      const PAL = { d: ['#b9ffd8', '#00ff9c', '#6ee7ff', '#ffd479', '#6f8fa8'], l: ['#146b4a', '#00875a', '#0a6ea8', '#946400', '#6b7a90'] };
      const tokenize = txt => {   // colour index per character: 0 text, 1 prompt, 2 keyword, 3 string, 4 comment
        const c = new Array(txt.length).fill(0); let m;
        if (txt.startsWith('$ ')) c[0] = c[1] = 1;
        KW.lastIndex = 0; while ((m = KW.exec(txt))) for (let i = 0; i < m[0].length; i++) c[m.index + i] = 2;
        const s = /"[^"]*"/g; while ((m = s.exec(txt))) for (let i = 0; i < m[0].length; i++) c[m.index + i] = 3;
        m = /(^|\s)(#|\/\/).*$/.exec(txt); if (m) for (let i = m.index + m[1].length; i < txt.length; i++) c[i] = 4;
        const runs = []; for (let i = 0; i < txt.length;) { let j = i; while (j < txt.length && c[j] === c[i]) j++; runs.push({ i, s: txt.slice(i, j), c: c[i] }); i = j; }
        return runs;
      };
      let W, H, FS, LH, CW, maxCh, lanes = [];
      const getLine = li => { const t = LINES[li % LINES.length].slice(0, maxCh); return { txt: t, runs: tokenize(t) }; };
      const place = () => {
        const mobile = W < 700, n = mobile ? 2 : Math.max(2, Math.min(4, Math.round(W / 430)));
        const lw = mobile ? W - 32 : Math.min(460, W / n - 24); maxCh = Math.max(18, Math.floor(lw / CW));
        while (lanes.length < n) { const li = Math.floor(Math.random() * LINES.length); lanes.push({ li, ci: 0, hist: [], slide: 0, wait: Math.random() * 1.2, acc: 0, delay: .03, ph: Math.random() * 6.28, cur: null }); }
        lanes.length = n;
        lanes.forEach((l, i) => {
          l.x = mobile ? 16 : (i + .5) * (W / n) - lw / 2 + (Math.random() - .5) * 30;
          l.y = mobile ? H * (i ? .8 : .38) : H * (.3 + Math.random() * .55);
          l.cur = getLine(l.li); l.ci = Math.min(l.ci, l.cur.txt.length);
          if (reduce) { l.hist = []; for (let k = 1; k <= 6; k++) l.hist.push(getLine(l.li - k)); l.ci = l.cur.txt.length; }
        });
      };
      const size = () => {
        W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
        FS = W < 700 ? 11 : 13; LH = FS * 1.7; g.font = FS + 'px "JetBrains Mono","Courier New",monospace'; CW = g.measureText('M').width || FS * .6; place(); if (reduce) paint(0);
      };
      const step = (l, dt) => {
        l.slide = Math.max(0, l.slide - dt * 2.2);
        if (l.wait > 0) { l.wait -= dt; return; }
        l.acc += dt;
        while (l.acc >= l.delay) {
          l.acc -= l.delay; l.delay = .022 + Math.random() * .06; l.ci++;
          if (l.ci >= l.cur.txt.length) { l.hist.unshift(l.cur); if (l.hist.length > ROWS) l.hist.pop(); l.li = (l.li + 1) % LINES.length; l.cur = getLine(l.li); l.ci = 0; l.slide = 1; l.wait = .3 + Math.random() * .8; l.acc = 0; break; }
        }
      };
      const row = (l, line, n, x, y, a, pal) => { g.globalAlpha = a; for (const r of line.runs) { if (r.i >= n) break; g.fillStyle = pal[r.c]; g.fillText(r.s.slice(0, n - r.i), x + r.i * CW, y); } };
      const paint = t => {
        g.clearRect(0, 0, W, H); g.font = FS + 'px "JetBrains Mono","Courier New",monospace'; g.textBaseline = 'alphabetic';
        const pal = DK ? PAL.d : PAL.l, base = (DK ? .3 : .2) * (W < 700 ? .7 : 1);
        lanes.forEach(l => {
          const x = l.x + (reduce ? 0 : Math.sin(t / 9000 + l.ph) * 14), sl = l.slide * l.slide;
          l.hist.forEach((h, k) => { const pos = k + 1 - sl; if (pos >= ROWS) return; row(l, h, h.txt.length, x, l.y - pos * LH, base * Math.pow(Math.max(0, 1 - pos / ROWS), 1.5), pal); });
          row(l, l.cur, l.ci, x, l.y, base * 1.25, pal);
          if (!reduce && (Math.floor(t / 520) % 2 === 0 || l.wait <= 0)) { g.globalAlpha = base * 1.4; g.fillStyle = pal[1]; g.fillRect(x + l.ci * CW + 1, l.y - FS * .8, CW * .7, FS * .95); }
        });
        g.globalAlpha = 1;
      };
      if (document.fonts && document.fonts.load) document.fonts.load('13px "JetBrains Mono"').then(() => size()).catch(() => {});
      size(); addEventListener('resize', size);
      if (!reduce) { let last = performance.now(), lastDraw = 0; const loop = t => { const dt = Math.min(.1, (t - last) / 1000); last = t; lanes.forEach(l => step(l, dt)); if (t - lastDraw > 32) { lastDraw = t; paint(t); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    }
  }

  // 3. ambient background music: generated live with Web Audio (no files). Starts off; the button turns it on.
  const audio = { ctx: null, master: null, on: false, sess: null, lat: 0, timer: null, ir: null, noise: null };
  // Am9 -> Fmaj7 -> Cmaj7 -> G6: b = bass note, p = pad notes, m = notes the melody may pick (MIDI numbers)
  const PROG = [{ b: 45, p: [57, 60, 64, 67, 71], m: [69, 72, 76, 79, 71] }, { b: 41, p: [53, 57, 60, 64], m: [72, 76, 77, 79, 81] }, { b: 48, p: [55, 59, 62, 64, 67], m: [71, 72, 74, 76, 79] }, { b: 43, p: [50, 55, 59, 64, 69], m: [71, 74, 76, 79, 81] }];
  const MP = [.7, .1, .35, .15, .55, .1, .4, .2];   // chance of a melody note on each eighth of a bar
  const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
  const gain = (c, v) => { const g = c.createGain(); g.gain.value = v; return g; };
  const osc = (c, type, f, t0, t1, det) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (det) o.detune.value = det; o.start(t0); o.stop(t1); return o; };
  const makeIR = c => { const len = Math.floor(c.sampleRate * 3.2), b = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); } return b; };
  const makeNoise = c => { const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };

  const voices = {
    pad(S, n, t, dur) {   // slow, warm chord tone
      const c = audio.ctx, g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.042, t + 1.8); g.gain.setValueAtTime(.042, t + dur - .4); g.gain.linearRampToValueAtTime(0, t + dur + 2.6); g.connect(S.pad);
      [['triangle', -5, 1], ['sawtooth', 6, .32]].forEach(([ty, det, v]) => { const o = osc(c, ty, mtof(n), t, t + dur + 2.7, det), og = gain(c, v); o.connect(og); og.connect(g); });
    },
    bass(S, n, t, len) {
      const c = audio.ctx, g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .06); g.gain.exponentialRampToValueAtTime(.0001, t + len); g.connect(S.dry);
      const o = osc(c, 'sine', mtof(n), t, t + len + .1), h = osc(c, 'sine', mtof(n) * 2, t, t + len + .1), hg = gain(c, .28); o.connect(g); h.connect(hg); hg.connect(g);
    },
    pluck(S, n, t, v) {   // soft felt-piano note with echo and room
      const c = audio.ctx, f = mtof(n), g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16 * v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
      const o = osc(c, 'sine', f, t, t + 2.3), o2 = osc(c, 'triangle', f * 2, t, t + 2.3), g2 = gain(c, .16); o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g);
      g.connect(S.dry); g.connect(S.sendD); g.connect(S.sendR);
    },
    heart(S, t) {   // very soft lub-dub that the on-screen pulses beat with
      const c = audio.ctx;[[0, 95, .3], [.22, 84, .17]].forEach(([dt, f0, v]) => {
        const g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; const s = t + dt;
        g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(v, s + .008); g.gain.exponentialRampToValueAtTime(.0001, s + .22);
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, s); o.frequency.exponentialRampToValueAtTime(f0 * .5, s + .16); o.start(s); o.stop(s + .25);
        const t2 = osc(c, 'triangle', f0 * 2.4, s, s + .06), g2 = gain(c, .05); o.connect(lp); t2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(S.dry);
      });
    },
    shaker(S, t, v) {
      const c = audio.ctx, src = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain(); src.buffer = audio.noise; hp.type = 'highpass'; hp.frequency.value = 6500;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.03 * v, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
      src.connect(hp); hp.connect(g); g.connect(S.dry); src.start(t, Math.random() * .8, .08);
    }
  };
  const pick = a => a[(Math.random() * a.length) | 0];
  const playStep = (S, s) => {
    const e = s % 16, ch = PROG[Math.floor(s / 16) % PROG.length], odd = s & 1, t = S.t0 + s * SPB / 2 + (odd ? SPB * .07 : 0);
    if (e === 0) { ch.p.forEach(n => voices.pad(S, n, t, SPB * 8)); voices.bass(S, ch.b, t, SPB * 3.6); }
    if (e === 8) voices.bass(S, ch.b, t, SPB * 3.2);
    if (!odd) voices.heart(S, t); else voices.shaker(S, t, .5 + Math.random() * .5);
    if (Math.random() < MP[e % 8]) { S.mi = Math.max(0, Math.min(ch.m.length - 1, S.mi + pick([-2, -1, -1, 0, 1, 1, 2]))); voices.pluck(S, ch.m[S.mi], t, .5 + Math.random() * .5); }
  };
  const startMusic = () => {
    const c = audio.ctx, S = { mi: 2, s: 0, stops: [] }; S.t0 = c.currentTime + .15; audio.lat = (c.baseLatency || 0) + (c.outputLatency || 0);
    S.out = gain(c, 0); S.out.connect(audio.master); S.out.gain.setValueAtTime(0, c.currentTime); S.out.gain.linearRampToValueAtTime(1, c.currentTime + 2.5);
    S.dry = gain(c, 1); S.dry.connect(S.out);
    S.revIn = gain(c, 1); const rv = c.createConvolver(); rv.buffer = audio.ir; const rl = c.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 3200; const rg = gain(c, .55); S.revIn.connect(rv); rv.connect(rl); rl.connect(rg); rg.connect(S.out);
    S.dlIn = gain(c, 1); const dl = c.createDelay(2); dl.delayTime.value = SPB * .75; const fb = gain(c, .36), dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1700; const dg = gain(c, .5);
    S.dlIn.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(dg); dg.connect(S.out); dg.connect(S.revIn);
    S.sendD = gain(c, .55); S.sendD.connect(S.dlIn); S.sendR = gain(c, .5); S.sendR.connect(S.revIn);
    S.pad = gain(c, 1); const pl = c.createBiquadFilter(); pl.type = 'lowpass'; pl.frequency.value = 1200; pl.Q.value = .4; S.pad.connect(pl); pl.connect(S.dry); pl.connect(S.revIn);
    const lfo = c.createOscillator(); lfo.frequency.value = .06; const lg = gain(c, 350); lfo.connect(lg); lg.connect(pl.frequency); lfo.start(); S.stops.push(lfo);
    audio.sess = S;
    const pump = () => { while (S.t0 + S.s * SPB / 2 < c.currentTime + 1.2) playStep(S, S.s++); };
    pump(); audio.timer = setInterval(pump, 250);
  };
  const beatMs = () => audio.sess ? (audio.ctx.currentTime - audio.sess.t0 - audio.lat) * 1000 : performance.now() - beat0;
  let beat0 = performance.now();
  const stopMusic = () => {
    const S = audio.sess; if (!S) return; beat0 = performance.now() - beatMs(); audio.sess = null; clearInterval(audio.timer);
    const c = audio.ctx, t = c.currentTime; S.out.gain.cancelScheduledValues(t); S.out.gain.setValueAtTime(S.out.gain.value, t); S.out.gain.linearRampToValueAtTime(0, t + .7);
    setTimeout(() => { try { S.out.disconnect(); S.stops.forEach(o => o.stop()); } catch (e) {} }, 1200);
  };
  const snd = $('#sndBtn');
  if (!F.sound || reduce) snd.hidden = true;
  snd.onclick = () => {
    if (!audio.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { snd.hidden = true; return; }
      const c = audio.ctx = new AC(), comp = c.createDynamicsCompressor(); audio.master = gain(c, F.soundVolume); audio.master.connect(comp); comp.connect(c.destination); audio.ir = makeIR(c); audio.noise = makeNoise(c);
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    audio.on = !audio.on; if (audio.on) startMusic(); else stopMusic();
    snd.textContent = audio.on ? '🎧' : '🎵'; snd.setAttribute('aria-pressed', audio.on);
    const lbl = audio.on ? 'Pause background music' : 'Play background music'; snd.setAttribute('aria-label', lbl); snd.title = lbl;
  };
  document.addEventListener('visibilitychange', () => { if (!audio.ctx || !audio.on) return; if (document.hidden) audio.ctx.suspend(); else audio.ctx.resume(); });

  // 4. a heartbeat pulse orbiting every profile photo; code streams out of it
  const pulses = [], PS = 180, PC = PS / 2, AVR = 40, PR = Math.max(46, Math.min(66, +F.pulseRadius || 56)), GL = '01{}<>/;=$#&|[]()'.split('');
  const pobs = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.target._p) e.target._p.vis = e.isIntersecting; })) : null;
  const stepPulse = (p, ms, dt, still) => {
    const g = p.g, per = SPB * 1000, idx = Math.floor(ms / per), ph = (ms - idx * per) / 1000, env = Math.max(Math.exp(-ph * 7), ph > .22 ? .6 * Math.exp(-(ph - .22) * 8) : 0), rgb = DK ? '0,255,156' : '0,160,100', TAU = 6.2832;
    if (!still) { if (idx !== p.idx) { p.idx = idx; p.dub = false; p.rings.push({ r: 5, a: .85 }); } if (!p.dub && ph > .22) { p.dub = true; p.rings.push({ r: 4, a: .5 }); } p.ang += p.spd * dt; }
    const nx = PC + Math.cos(p.ang) * PR, ny = PC + Math.sin(p.ang) * PR;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, PS, PS);
    g.lineWidth = 1; g.setLineDash([2, 5]); g.strokeStyle = `rgba(${rgb},${.26 + .16 * env})`; g.beginPath(); g.arc(PC, PC, PR, 0, TAU); g.stroke(); g.setLineDash([]);   // the orbit
    g.lineCap = 'round'; g.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const a1 = p.ang - i * .036; g.strokeStyle = `rgba(${rgb},${(1 - i / 26) * .55 * (.55 + .45 * env)})`; g.beginPath(); g.arc(PC, PC, PR, a1 - .036, a1 + .01); g.stroke(); }   // comet tail
    for (let i = p.rings.length - 1; i >= 0; i--) { const r = p.rings[i]; r.r += 26 * dt; r.a -= 1.6 * dt; if (r.a <= 0) { p.rings.splice(i, 1); continue; } g.lineWidth = 1.2; g.strokeStyle = `rgba(${rgb},${r.a})`; g.beginPath(); g.arc(nx, ny, r.r, 0, TAU); g.stroke(); }   // beat rings
    if (!still) { p.acc = Math.min(3, p.acc + (11 + 95 * env * env) * dt); while (p.acc >= 1 && p.P.length < 90) { p.acc--; const out = Math.random() < .78; p.P.push({ a: p.ang - Math.random() * .08, r: PR, va: p.spd * (.15 + Math.random() * .55), vr: (7 + Math.random() * 15) * (out ? 1 : -.6), life: 1, d: .5 + Math.random() * .45, ch: GL[(Math.random() * GL.length) | 0] }); } }
    g.font = 'bold 11px "Courier New",monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = `rgb(${rgb})`;
    for (let i = p.P.length - 1; i >= 0; i--) { const q = p.P[i]; q.life -= q.d * dt; q.a += q.va * dt; q.r += q.vr * dt; if (q.life <= 0 || q.r < AVR + 3) { p.P.splice(i, 1); continue; } g.globalAlpha = Math.min(1, q.life * 1.2) * .9; g.fillText(q.ch, PC + Math.cos(q.a) * q.r, PC + Math.sin(q.a) * q.r); }   // code flowing out
    g.globalAlpha = 1;
    const gr = g.createRadialGradient(nx, ny, 0, nx, ny, 12 + env * 9); gr.addColorStop(0, `rgba(${rgb},${.55 + .4 * env})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.beginPath(); g.arc(nx, ny, 12 + env * 9, 0, TAU); g.fill();   // the pulse itself
    g.fillStyle = '#f2fff8'; g.beginPath(); g.arc(nx, ny, 2.6 + env * 1.8, 0, TAU); g.fill(); g.lineWidth = 1; g.strokeStyle = `rgba(${rgb},.9)`; g.stroke();
  };
  const addPulse = cv => {
    const g = cv.getContext && cv.getContext('2d'); if (!g) return; cv.width = PS * DPR; cv.height = PS * DPR;
    const p = { g, vis: true, ang: Math.random() * 6.28, spd: .38 + Math.random() * .1, P: [], rings: [], acc: 0, idx: -1, dub: false }; cv._p = p; pulses.push(p);
    if (reduce) stepPulse(p, 0, 0, true); else if (pobs) pobs.observe(cv);
  };
  if (F.pulse && !reduce) { let last = performance.now(); const loop = t => { const dt = Math.min(.05, (t - last) / 1000); last = t; const ms = beatMs(); pulses.forEach(p => { if (p.vis) stepPulse(p, ms, dt, false); }); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  // 5. your hacker picture
  $('#hacker').hidden = !F.hacker;
  if (F.hackerImage) $('#hacker img').src = F.hackerImage;
  $('#hacker img').onerror = () => { $('#hacker').hidden = true; };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('inhero', e.isIntersecting))).observe($('.hero'));

  members.forEach(mk); applyFilter(); totals(); refresh(false);
  setInterval(() => refresh(true), Math.max(1, T.refreshMinutes) * 60000);
})();
