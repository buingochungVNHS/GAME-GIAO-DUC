/* Lõi: lưu trữ, tiến độ, âm thanh, giọng đọc, nhận giọng, thu âm, chấm điểm. */
(function () {
  'use strict';
  var G = window.GGD;

  /* ---------- tiện ích ---------- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(str, n) { var p = str.split('-'); return dateStr(new Date(+p[0], +p[1] - 1, +p[2] + n)); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  G.util = { pad2: pad2, dateStr: dateStr, addDays: addDays, sleep: sleep };

  /* ---------- trạng thái được lưu ---------- */
  var KEY = 'ggd_state_v1';
  function defaults() {
    return {
      v: 1,
      names: { user: '', dragon: '' },
      settings: {
        accent: 'us', voices: { us: '', gb: '' }, rate: 1, reflexSec: 10, strict: 'easy',
        ipa: true, fontSize: 'm', sound: true, overlap: true, shadowLevel: 1,
        chartMetrics: ['minutes', 'learned']
      },
      phrases: {}, daily: {}, lastPractice: ''
    };
  }
  function merge(base, saved) {
    var out = defaults();
    if (!saved || typeof saved !== 'object') return out;
    if (saved.names) { out.names.user = String(saved.names.user || ''); out.names.dragon = String(saved.names.dragon || ''); }
    if (saved.settings) {
      Object.keys(out.settings).forEach(function (k) {
        if (saved.settings[k] !== undefined) out.settings[k] = saved.settings[k];
      });
      out.settings.voices = Object.assign({ us: '', gb: '' }, saved.settings.voices || {});
    }
    if (saved.phrases && typeof saved.phrases === 'object') out.phrases = saved.phrases;
    if (saved.daily && typeof saved.daily === 'object') out.daily = saved.daily;
    if (typeof saved.lastPractice === 'string') out.lastPractice = saved.lastPractice;
    return out;
  }
  var state;
  try { state = merge(null, JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) { state = defaults(); }
  G.state = function () { return state; };
  G.save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } };

  /* ---------- tiến độ ôn tập ngắt quãng ---------- */
  function today() { return dateStr(); }
  function dayRec(d) {
    if (!state.daily[d]) state.daily[d] = { sec: 0, attempts: 0, correct: 0, learned: 0 };
    return state.daily[d];
  }
  function learnedCount() {
    var n = 0;
    Object.keys(state.phrases).forEach(function (id) {
      if (G.BY_ID[id] && state.phrases[id].box >= G.LEARNED_BOX) n++;
    });
    return n;
  }
  G.progress = {
    get: function (id) { return state.phrases[id] || null; },
    learnedCount: learnedCount,
    isLearned: function (id) { var p = state.phrases[id]; return !!(p && p.box >= G.LEARNED_BOX); },
    dueIds: function () {
      var t = today();
      return Object.keys(state.phrases).filter(function (id) {
        var p = state.phrases[id];
        return G.BY_ID[id] && p.box >= 1 && p.due <= t;
      }).sort(function (a, b) { return state.phrases[a].due < state.phrases[b].due ? -1 : 1; });
    },
    newIds: function () {
      return G.ALL.filter(function (p) { return !state.phrases[p.id]; }).map(function (p) { return p.id; });
    },
    seenIds: function () {
      return G.ALL.filter(function (p) { return state.phrases[p.id]; }).map(function (p) { return p.id; });
    },
    introduce: function (id) {
      if (!state.phrases[id]) {
        state.phrases[id] = { box: 1, due: addDays(today(), 1), seen: 0, ok: 0, up: '' };
        G.save();
      }
    },
    /* outcome: 'pass' | 'half' | 'fail' */
    record: function (id, outcome) {
      G.progress.introduce(id);
      var p = state.phrases[id], t = today(), d = dayRec(t);
      p.seen = (p.seen || 0) + 1;
      d.attempts += 1;
      if (outcome === 'pass') {
        p.ok = (p.ok || 0) + 1; d.correct += 1;
        if (p.up !== t) {
          p.box = Math.min(5, p.box + 1);
          p.up = t;
        }
        p.due = addDays(t, G.INTERVALS[p.box]);
      } else if (outcome === 'half') {
        p.ok = (p.ok || 0) + 0.5; d.correct += 0.5;
      } else {
        if (p.up !== t) { p.box = Math.max(1, p.box - 1); p.up = t; }
        p.due = t;
      }
      d.learned = learnedCount();
      state.lastPractice = t;
      G.save();
    },
    addSeconds: function (s) {
      if (!(s > 0)) return;
      dayRec(today()).sec += Math.round(s);
      G.save();
    },
    snapshot: function () { dayRec(today()).learned = learnedCount(); G.save(); }
  };

  G.stageInfo = function (n) {
    var idx = 0, i;
    for (i = 0; i < G.STAGES.length; i++) { if (n >= G.STAGES[i].min) idx = i; }
    var cur = G.STAGES[idx], next = G.STAGES[idx + 1] || null;
    var prog = next ? (n - cur.min) / (next.min - cur.min) : 1;
    return { idx: idx, name: cur.name, next: next, toNext: next ? next.min - n : 0, progress: Math.max(0, Math.min(1, prog)) };
  };

  G.weekData = function () {
    var out = [], names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    var keys = Object.keys(state.daily).sort();
    var carry = 0, i;
    /* giá trị "đã thuộc" của ngày đầu tiên trong tuần: lấy ngày gần nhất trước đó */
    var start = addDays(today(), -6);
    keys.forEach(function (k) { if (k < start && state.daily[k].learned) carry = state.daily[k].learned; });
    for (i = 6; i >= 0; i--) {
      var d = addDays(today(), -i), r = state.daily[d];
      var p = d.split('-');
      var wd = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
      if (r && r.learned) carry = r.learned;
      out.push({
        date: d, label: names[wd],
        minutes: r ? Math.round(r.sec / 6) / 10 : 0,
        learned: carry,
        acc: r && r.attempts > 0 ? Math.round(100 * r.correct / r.attempts) : null
      });
    }
    return out;
  };

  /* ---------- hiệu ứng âm thanh (Web Audio) ---------- */
  var ac = null;
  function actx() {
    if (!ac) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (C) { try { ac = new C(); } catch (e) { ac = null; } }
    }
    if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
    return ac;
  }
  function tone(c, f, t0, dur, type, gain, slideTo, vib) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    if (vib) {
      var l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = 22; lg.gain.value = f * 0.12;
      l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.25, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  G.sfx = function (name) {
    if (!state.settings.sound) return;
    var c = actx(); if (!c) return;
    var t = c.currentTime;
    try {
      if (name === 'tap') { tone(c, 620, t, 0.07, 'triangle', 0.18); }
      else if (name === 'ok') { tone(c, 880, t, 0.12, 'sine', 0.25); tone(c, 1320, t + 0.1, 0.22, 'sine', 0.25); }
      else if (name === 'bad') { tone(c, 260, t, 0.25, 'sawtooth', 0.12, 150); }
      else if (name === 'win') {
        [523, 659, 784, 1047].forEach(function (f, i) { tone(c, f, t + i * 0.11, 0.25, 'triangle', 0.22); });
        tone(c, 1047, t + 0.5, 0.5, 'sine', 0.2);
      }
      else if (name === 'roar') { tone(c, 170, t, 0.55, 'sawtooth', 0.2, 60, true); tone(c, 85, t, 0.55, 'square', 0.1, 45); }
      else if (name === 'hatch') {
        tone(c, 300, t, 0.08, 'square', 0.15); tone(c, 340, t + 0.15, 0.08, 'square', 0.15);
        [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(c, f, t + 0.4 + i * 0.09, 0.25, 'triangle', 0.22); });
      }
    } catch (e) { /* bỏ qua lỗi âm thanh */ }
  };
  G.unlockAudio = function () { actx(); };

  /* ---------- giọng đọc ---------- */
  G.tts = {
    voices: [],
    supported: function () { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance); },
    load: function () {
      if (!G.tts.supported()) return;
      var v = window.speechSynthesis.getVoices() || [];
      G.tts.voices = v.filter(function (x) { return /^en/i.test(x.lang); });
    },
    pick: function (accent) {
      var want = accent === 'gb' ? 'en-gb' : 'en-us';
      var saved = state.settings.voices[accent];
      var list = G.tts.voices, found = null;
      if (saved) found = list.filter(function (v) { return v.voiceURI === saved; })[0];
      if (!found) found = list.filter(function (v) { return v.lang.replace('_', '-').toLowerCase() === want; })[0];
      return found || null;
    },
    estimate: function (text, rate) {
      var words = String(text).split(/\s+/).length;
      return words * 0.45 / Math.max(rate || 1, 0.5) + 0.8;
    },
    cancel: function () { try { if (G.tts.supported()) window.speechSynthesis.cancel(); } catch (e) {} },
    speak: function (text, opts) {
      opts = opts || {};
      if (!G.tts.supported()) return Promise.resolve(false);
      var accent = opts.accent || state.settings.accent;
      var rate = opts.rate || state.settings.rate;
      return new Promise(function (resolve) {
        var s = window.speechSynthesis, done = false, timer;
        try { s.cancel(); } catch (e) {}
        var u = new SpeechSynthesisUtterance(text);
        var v = G.tts.pick(accent);
        if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = accent === 'gb' ? 'en-GB' : 'en-US'; }
        u.rate = rate; u.pitch = 1;
        function fin(ok) { if (done) return; done = true; clearTimeout(timer); resolve(ok); }
        u.onstart = function () { if (opts.onstart) opts.onstart(); };
        u.onend = function () { fin(true); };
        u.onerror = function () { fin(false); };
        timer = setTimeout(function () { fin(false); }, G.tts.estimate(text, rate) * 1000 + 4000);
        setTimeout(function () { try { s.speak(u); } catch (e) { fin(false); } }, 40);
      });
    }
  };
  if (G.tts.supported()) {
    G.tts.load();
    try { window.speechSynthesis.onvoiceschanged = function () { G.tts.load(); if (G.onVoices) G.onVoices(); }; } catch (e) {}
  }

  /* ---------- nhận giọng nói ---------- */
  G.stt = {
    current: null,
    supported: function () { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
    isFatal: function (err) {
      return ['not-allowed', 'service-not-allowed', 'audio-capture', 'start-failed', 'unsupported'].indexOf(err) >= 0;
    },
    stop: function () { try { if (G.stt.current) G.stt.current.stop(); } catch (e) {} },
    abort: function () { try { if (G.stt.current) G.stt.current.abort(); } catch (e) {} G.stt.current = null; },
    /* opts: { accent, maxMs, onInterim } -> Promise<{ ok, alts, error }> */
    listen: function (opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { resolve({ ok: false, alts: [], error: 'unsupported' }); return; }
        G.stt.abort();
        var accent = opts.accent || state.settings.accent;
        var rec = new SR(), alts = [], err = null, finished = false, timer;
        rec.lang = accent === 'gb' ? 'en-GB' : 'en-US';
        rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 3;
        function fin() {
          if (finished) return; finished = true; clearTimeout(timer);
          if (G.stt.current === rec) G.stt.current = null;
          resolve({ ok: alts.length > 0, alts: alts, error: err });
        }
        rec.onresult = function (ev) {
          var last = ev.results[ev.results.length - 1], cur = [], i;
          for (i = 0; i < last.length; i++) cur.push(last[i].transcript);
          alts = last.isFinal ? cur : cur.slice(0, 1);
          if (opts.onInterim) opts.onInterim(cur[0]);
        };
        rec.onerror = function (ev) { err = ev.error; };
        rec.onend = fin;
        G.stt.current = rec;
        try { rec.start(); } catch (e) { err = 'start-failed'; fin(); return; }
        timer = setTimeout(function () { try { rec.stop(); } catch (e) {} }, opts.maxMs || 10000);
      });
    }
  };

  /* ---------- thu âm ---------- */
  G.rec = {
    supported: function () { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); },
    /* Trả về { stop() -> Promise<Blob> }. Ném lỗi nếu micro không dùng được. */
    start: async function () {
      if (!G.rec.supported()) throw new Error('unsupported');
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var mime = '';
      ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].some(function (m) {
        try { if (MediaRecorder.isTypeSupported(m)) { mime = m; return true; } } catch (e) {}
        return false;
      });
      var mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      var chunks = [];
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      var stopped = new Promise(function (res) {
        mr.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          res(new Blob(chunks, { type: mr.mimeType || mime || 'audio/mp4' }));
        };
      });
      mr.start(250);
      return {
        stop: function () { try { if (mr.state !== 'inactive') mr.stop(); } catch (e) {} return stopped; }
      };
    }
  };

  /* ---------- lưu giọng đã thu (IndexedDB, tối đa 20 bản) ---------- */
  var MAXREC = 20, mem = [], dbp = null;
  function getDB() {
    if (!dbp) {
      dbp = new Promise(function (res, rej) {
        if (!window.indexedDB) { rej(new Error('no-idb')); return; }
        var r = indexedDB.open('ggd', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('rec', { keyPath: 'id' }); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
    }
    return dbp;
  }
  function req(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  G.store = {
    persistent: true,
    add: async function (item) {
      try {
        var db = await getDB();
        await req(db.transaction('rec', 'readwrite').objectStore('rec').put(item));
        var all = await G.store.list();
        for (var i = MAXREC; i < all.length; i++) await G.store.remove(all[i].id);
      } catch (e) {
        G.store.persistent = false;
        mem.unshift(item); if (mem.length > MAXREC) mem.pop();
      }
    },
    list: async function () {
      try {
        var db = await getDB();
        var all = await req(db.transaction('rec').objectStore('rec').getAll());
        return all.sort(function (a, b) { return b.ts - a.ts; });
      } catch (e) { return mem.slice(); }
    },
    remove: async function (id) {
      try {
        var db = await getDB();
        await req(db.transaction('rec', 'readwrite').objectStore('rec').delete(id));
      } catch (e) { mem = mem.filter(function (x) { return x.id !== id; }); }
    }
  };

  /* ---------- chấm điểm lời nói ---------- */
  var CONTR = {
    "i'll": 'i will', "i'd": 'i would', "i'm": 'i am', "it's": 'it is', "let's": 'let us', "what's": 'what is',
    "that's": 'that is', "here's": 'here is', "don't": 'do not', "can't": 'can not', "i've": 'i have', "you'll": 'you will'
  };
  var NUM = { '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '11': 'eleven', '12': 'twelve' };
  function normalize(s) {
    s = String(s || '').toLowerCase().replace(/[’‘]/g, "'");
    s = s.replace(/e[- ]mail/g, 'email').replace(/[^a-z0-9' ]+/g, ' ');
    s = s.replace(/\bcheck out\b/g, 'checkout').replace(/\bcheck in\b/g, 'checkin');
    var out = [];
    s.split(/\s+/).filter(Boolean).forEach(function (w) {
      if (CONTR[w]) { out.push.apply(out, CONTR[w].split(' ')); }
      else if (NUM[w]) { out.push(NUM[w]); }
      else { w = w.replace(/^'+|'+$/g, ''); if (w) out.push(w); }
    });
    return out;
  }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[m][n];
  }
  function same(a, b) { return a === b || (a.length >= 5 && b.length >= 5 && lev(a, b) <= 1); }
  function align(target, said) {
    var n = target.length, m = said.length, dp = [], i, j;
    for (i = 0; i <= n; i++) { dp[i] = []; for (j = 0; j <= m; j++) dp[i][j] = 0; }
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        dp[i][j] = same(target[i - 1], said[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    var flags = [], k;
    for (k = 0; k < n; k++) flags.push(false);
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (same(target[i - 1], said[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + 1) { flags[i - 1] = true; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
    }
    return flags;
  }
  var THRESH = { easy: 0.6, medium: 0.75, strict: 1 };
  /* Trả về { score, flags, words, said, pass } */
  G.score = function (targetText, alts, strict) {
    var target = normalize(targetText), best = null;
    var displayWords = String(targetText).replace(/[’‘]/g, "'").split(/\s+/).filter(Boolean);
    (alts && alts.length ? alts : ['']).forEach(function (a) {
      var said = normalize(a), flags = align(target, said);
      var hit = flags.filter(Boolean).length, sc = target.length ? hit / target.length : 0;
      if (!best || sc > best.score) best = { score: sc, flags: flags, said: a };
    });
    var th = THRESH[strict || state.settings.strict] || 0.6;
    /* gán cờ cho từ hiển thị: nếu số từ chuẩn hóa khác số từ hiển thị thì dùng tỉ lệ chung */
    var shown = displayWords.map(function () { return best.score >= 1; });
    if (displayWords.length === target.length) shown = best.flags.slice();
    else { var cut = Math.round(best.score * displayWords.length); shown = displayWords.map(function (w, i) { return i < cut; }); }
    return { score: best.score, flags: shown, words: displayWords, said: best.said, pass: best.score >= th - 1e-9 };
  };
  G._normalize = normalize;

  /* ---------- sao lưu và khôi phục ---------- */
  function download(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }
  G.download = download;
  G.backup = {
    exportFile: function () {
      download(new Blob([JSON.stringify(state)], { type: 'application/json' }), 'game-giao-duc-sao-luu-' + dateStr() + '.json');
    },
    importText: function (txt) {
      var d = JSON.parse(txt);
      if (!d || d.v !== 1 || typeof d.phrases !== 'object') throw new Error('Tệp không đúng định dạng sao lưu.');
      state = merge(null, d); G.save();
    },
    reset: function () { state = defaults(); G.save(); }
  };

  dayRec(today()).learned = learnedCount();
  G.save();
})();
