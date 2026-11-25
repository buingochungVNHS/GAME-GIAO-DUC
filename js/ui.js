/* Giao diện: các màn hình và luồng luyện tập. */
(function () {
  'use strict';
  var G = window.GGD;
  var ST = G.state();
  var $screen = document.getElementById('screen');
  var $overlay = document.getElementById('overlay');
  var $toast = document.getElementById('toast');
  var $app = document.getElementById('app');
  var S = { tab: 'home', subSpeak: 'reflex', reflexTopic: 'all', shadowLevel: 1, soundTab: 'table', sound: -1, chartOpen: true };
  var RUN = 0, pending = null, clk = 0, toastT = null;

  /* ---------- tiện ích ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function show(html) { $screen.innerHTML = html; $screen.scrollTop = 0; }
  function toast(msg) {
    $toast.textContent = msg; $toast.hidden = false; clearTimeout(toastT);
    toastT = setTimeout(function () { $toast.hidden = true; }, 2200);
  }
  function modal(html) { $overlay.innerHTML = '<div class="box">' + html + '</div>'; $overlay.hidden = false; }
  function closeModal() { $overlay.hidden = true; $overlay.innerHTML = ''; }
  function confetti() {
    var d = document.createElement('div'); d.className = 'confetti';
    var cols = ['#ff8a3d', '#35d07f', '#4cc9f0', '#ffd23f', '#ff5d73', '#c77dff'], h = '';
    for (var i = 0; i < 40; i++) {
      h += '<i style="left:' + Math.random() * 100 + '%;background:' + cols[i % cols.length] + ';animation-delay:' + Math.random() * 0.8 + 's"></i>';
    }
    d.innerHTML = h; $app.appendChild(d); setTimeout(function () { d.remove(); }, 3200);
  }
  function applyPrefs() {
    document.body.className = 'fs-' + ST.settings.fontSize;
  }
  function userName() { return ST.names.user || 'bạn'; }
  function dragonName() { return ST.names.dragon || 'Rồng'; }
  function clockOn() { if (!clk) clk = Date.now(); }
  function clockOff() {
    if (clk) { var s = (Date.now() - clk) / 1000; clk = 0; G.progress.addSeconds(Math.min(s, 1500)); }
  }
  function newRun() {
    RUN++; pending = null; clockOff();
    G.tts.cancel(); G.stt.abort();
    return RUN;
  }
  function live(id) { return id === RUN; }
  function waitFor() {
    var names = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve) { pending = { names: names, resolve: resolve }; });
  }
  function say(text, o) { return G.tts.speak(text, o || {}); }
  function stageIdx() { return G.stageInfo(G.progress.learnedCount()).idx; }
  function dragonSvg(mood) { return G.dragon(stageIdx(), mood || 'happy'); }

  function micHelp(code) {
    modal('<h2>🎤 Micro chưa hoạt động</h2>' +
      '<p class="mute">Mã lỗi: ' + esc(code || 'không rõ') + '</p>' +
      '<p style="text-align:left">1) Bấm <b>Tải lại trang</b> rồi thử lại.<br>2) Khi trình duyệt hỏi, chọn <b>Cho phép</b> micro.<br>3) Đóng các ứng dụng khác đang dùng micro.<br>4) iPhone: bật Siri và có mạng.</p>' +
      '<button class="btn pri" data-act="reload">Tải lại trang</button>' +
      '<button class="btn" data-act="closemodal">Đóng</button>');
  }

  /* ---------- điều hướng ---------- */
  var render = {};
  function go(tab) {
    newRun();
    S.tab = tab;
    Array.prototype.forEach.call(document.querySelectorAll('#tabs button'), function (b) {
      b.classList.toggle('on', b.getAttribute('data-tab') === tab);
    });
    closeModal();
    render[tab]();
  }

  /* ---------- màn Hôm nay ---------- */
  function chartHtml() {
    var wk = G.weekData(), ms = ST.settings.chartMetrics;
    var defs = [
      { k: 'minutes', name: 'Phút luyện', max: Math.max(10, Math.max.apply(null, wk.map(function (d) { return d.minutes; }))) },
      { k: 'learned', name: 'Cụm đã thuộc', max: Math.max(5, Math.max.apply(null, wk.map(function (d) { return d.learned; }))) },
      { k: 'acc', name: 'Nói đúng %', max: 100 }
    ];
    var chips = defs.map(function (d) {
      return '<span class="chip' + (ms.indexOf(d.k) >= 0 ? ' on' : '') + '" data-act="metric" data-k="' + d.k + '">' + d.name + '</span>';
    }).join('');
    var cols = wk.map(function (d) {
      var bars = defs.filter(function (m) { return ms.indexOf(m.k) >= 0; }).map(function (m) {
        var v = d[m.k] || 0, hgt = Math.max(0, Math.round(100 * v / m.max));
        return '<div class="b c-' + m.k + '" style="height:' + hgt + 'px" title="' + v + '"></div>';
      }).join('');
      var vv = ms.length === 1 ? '<div class="vv">' + (d[ms[0]] == null ? '–' : d[ms[0]]) + '</div>' : '';
      return '<div class="col">' + vv + '<div class="grp">' + bars + '</div><div class="lb">' + d.label + '</div></div>';
    }).join('');
    return '<div class="card"><b>Tuần này</b><div>' + chips + '</div><div class="chart">' + cols + '</div></div>';
  }

  render.home = function () {
    var n = G.progress.learnedCount(), si = G.stageInfo(n);
    var d = G.weekData()[6], practiced = ST.lastPractice === G.util.dateStr();
    var mood = practiced ? 'happy' : 'sleepy';
    var msg;
    if (!practiced) msg = 'Zzz… ' + esc(userName()) + ' ơi, luyện một chút để đánh thức mình nhé!';
    else msg = 'Hôm nay ' + esc(userName()) + ' đã luyện rồi, giỏi quá!';
    var next = si.next ? 'Còn <b>' + si.toNext + '</b> cụm nữa để lên <b>' + si.next.name + '</b>' : 'Rồng đã trưởng thành tối đa!';
    var due = G.progress.dueIds().length, fresh = G.progress.newIds().length;
    show('<div class="dragonbox bob" data-act="roar">' + G.dragon(si.idx, mood) +
      '<div class="bubble">' + msg + '</div></div>' +
      '<div class="center"><b>' + esc(dragonName()) + '</b> · ' + si.name + '</div>' +
      '<div class="bar"><i style="width:' + Math.round(si.progress * 100) + '%"></i></div>' +
      '<p class="center small mute">' + next + '</p>' +
      '<button class="btn pri big" data-act="start">▶ Bắt đầu hôm nay</button>' +
      '<div class="stats"><div class="stat"><b>' + n + '</b><span>cụm đã thuộc</span></div>' +
      '<div class="stat"><b>' + d.minutes + '</b><span>phút hôm nay</span></div>' +
      '<div class="stat"><b>' + due + '</b><span>cụm cần ôn</span></div></div>' +
      (fresh === 0 && due === 0 ? '<p class="center small mute">Bạn đã học hết bài hiện có. Vào tab Nói để luyện thêm.</p>' : '') +
      chartHtml());
  };

  /* ---------- khung chung cho luồng luyện ---------- */
  function head(title, i, n) {
    var dots = '';
    for (var k = 0; k < n; k++) dots += '<i class="' + (k < i ? 'd' : k === i ? 'c' : '') + '"></i>';
    return '<div class="row"><b class="grow">' + esc(title) + '</b><button class="back" data-act="quit">✖ Thoát</button></div>' +
      (n ? '<div class="prog">' + dots + '</div>' : '');
  }
  function colorWords(sc) {
    return sc.words.map(function (w, i) { return '<span class="' + (sc.flags[i] ? 'w-ok' : 'w-no') + '">' + esc(w) + '</span>'; }).join(' ');
  }
  function ipaLine(p) { return ST.settings.ipa && p.ipa ? '<div class="ipa-big">' + esc(p.ipa) + '</div>' : ''; }
  async function banner(id, emoji, title, sub) {
    show(head(title, 0, 0) + '<div class="center" style="margin-top:30px"><div style="font-size:4em">' + emoji + '</div><h1>' + esc(title) + '</h1><p class="mute">' + esc(sub) + '</p>' +
      '<button class="btn pri big" data-act="go">Bắt đầu</button></div>');
    await waitFor('go');
    return live(id);
  }

  /* ---------- một lượt phản xạ ---------- */
  function hintOf(en) {
    return en.split(/\s+/).map(function (w) { return w.charAt(0) + w.slice(1).replace(/[A-Za-z0-9]/g, '_'); }).join(' ');
  }
  async function reflexTurn(id, p, sec, idx, total, title) {
    var skipped = false;
    var base = head(title, idx, total) +
      '<div class="center mute small">Nói bằng tiếng Anh · còn ' + sec + ' giây</div>' +
      '<div class="big-vi">' + esc(p.vi) + '</div>' +
      '<div class="timer"><i id="tbar" style="transition:width ' + sec + 's linear"></i></div>' +
      '<div class="hint" id="hint">&nbsp;</div>' +
      '<div class="center" id="interim" style="min-height:1.6em"></div>' +
      '<button class="mic live" disabled>🎤</button>' +
      '<button class="btn" data-act="skip">Không biết, cho xem đáp án</button>';
    show(base);
    var hintT = setTimeout(function () { var h = document.getElementById('hint'); if (h) h.textContent = hintOf(p.en); }, sec * 500);
    setTimeout(function () { var b = document.getElementById('tbar'); if (b) b.style.width = '0%'; }, 60);
    var res;
    if (G.stt.supported()) {
      pending = { names: ['skip'], resolve: function () { skipped = true; G.stt.abort(); } };
      res = await G.stt.listen({ maxMs: sec * 1000, onInterim: function (t) { var e = document.getElementById('interim'); if (e) e.textContent = t; } });
      pending = null;
    } else { res = { ok: false, alts: [], error: 'unsupported-selfjudge' }; }
    clearTimeout(hintT);
    if (!live(id)) return null;
    if (res.error && G.stt.isFatal(res.error) && !skipped) { micHelp(res.error); return null; }
    var outcome = 'fail', sc = null, selfJudge = res.error === 'unsupported-selfjudge';
    if (res.ok && !skipped) {
      sc = G.score(p.en, res.alts);
      outcome = sc.pass ? 'pass' : sc.score >= 0.5 ? 'half' : 'fail';
    }
    var fbHtml;
    if (selfJudge) {
      fbHtml = '<div class="big-en">' + esc(p.en) + '</div>' + ipaLine(p) +
        '<p class="center">Bạn nói đúng chưa?</p><div class="rating"><button class="btn ok" data-act="j_pass">✅ Đúng</button><button class="btn bad" data-act="j_fail">❌ Chưa</button></div>';
      show(head(title, idx, total) + '<div class="big-vi">' + esc(p.vi) + '</div>' + fbHtml);
      say(p.en);
      var j = await waitFor('j_pass', 'j_fail');
      if (!live(id)) return null;
      outcome = j.act === 'j_pass' ? 'pass' : 'fail';
      G.progress.record(p.id, outcome); G.sfx(outcome === 'pass' ? 'ok' : 'bad');
      return outcome;
    }
    G.progress.record(p.id, outcome);
    G.sfx(outcome === 'pass' ? 'ok' : outcome === 'half' ? 'tap' : 'bad');
    var title2 = outcome === 'pass' ? '✅ Chuẩn rồi!' : outcome === 'half' ? '🤏 Gần đúng' : (skipped ? '💡 Đáp án' : res.ok ? '❌ Chưa đúng' : '😶 Không nghe thấy');
    show(head(title, idx, total) + '<div class="big-vi">' + esc(p.vi) + '</div>' +
      '<h2 class="center">' + title2 + '</h2>' +
      '<div class="big-en">' + (sc ? colorWords(sc) : esc(p.en)) + '</div>' + ipaLine(p) +
      (sc ? '<p class="center small mute">Bạn nói: ' + esc(sc.said) + '</p>' : '') +
      '<div class="row"><button class="btn blue" data-act="say">🔊 Nghe</button><button class="btn blue" data-act="slow">🐢 Chậm</button></div>' +
      '<button class="btn pri" data-act="next">Tiếp →</button>');
    if (outcome !== 'pass') say(p.en);
    for (;;) {
      var a = await waitFor('say', 'slow', 'next');
      if (!live(id)) return null;
      if (a.act === 'next') break;
      say(p.en, { rate: a.act === 'slow' ? 0.7 : undefined });
    }
    return outcome;
  }

  async function reflexRound(id, ids, tally, title) {
    for (var i = 0; i < ids.length; i++) {
      var sec = Math.max(5, ST.settings.reflexSec - i);
      var o = await reflexTurn(id, G.BY_ID[ids[i]], sec, i, ids.length, title);
      if (!live(id) || o === null) return false;
      tally[o]++;
    }
    return true;
  }

  /* ---------- học cụm mới ---------- */
  async function learnOne(id, p, idx, total) {
    G.progress.introduce(p.id);
    var res = '';
    function draw() {
      show(head('Học cụm mới', idx, total) +
        '<div class="big-en">' + esc(p.en) + '</div>' + ipaLine(p) +
        '<div class="big-vi">' + esc(p.vi) + '</div>' +
        '<div class="row"><button class="btn blue" data-act="say">🔊 Nghe</button><button class="btn blue" data-act="slow">🐢 Chậm</button></div>' +
        '<div id="lres" class="center">' + res + '</div>' +
        '<button class="btn pri" data-act="try">🎤 Nói theo</button>' +
        '<button class="btn" data-act="next">Tiếp →</button>');
    }
    draw();
    say(p.en);
    for (;;) {
      var a = await waitFor('say', 'slow', 'try', 'next');
      if (!live(id)) return false;
      if (a.act === 'next') return true;
      if (a.act === 'say' || a.act === 'slow') { say(p.en, { rate: a.act === 'slow' ? 0.7 : undefined }); continue; }
      if (!G.stt.supported()) { toast('Trình duyệt không nhận giọng nói'); continue; }
      var lr = document.getElementById('lres'); if (lr) lr.innerHTML = '<p class="mute">Nghe máy đọc…</p>';
      await say(p.en);
      if (!live(id)) return false;
      if (lr) lr.innerHTML = '<p>🎤 Đến lượt bạn…</p>';
      var r = await G.stt.listen({ maxMs: 8000 });
      if (!live(id)) return false;
      if (r.error && G.stt.isFatal(r.error)) { micHelp(r.error); return false; }
      if (!r.ok) { res = '<p>😶 Không nghe thấy, thử lại nhé.</p>'; }
      else {
        var sc = G.score(p.en, r.alts), out = sc.pass ? 'pass' : sc.score >= 0.5 ? 'half' : 'fail';
        G.progress.record(p.id, out); G.sfx(out === 'pass' ? 'ok' : 'bad');
        res = '<p>' + (out === 'pass' ? '✅ Chuẩn!' : out === 'half' ? '🤏 Gần đúng' : '❌ Thử lại') + '</p><div class="big-en" style="font-size:1.2em">' + colorWords(sc) + '</div>';
      }
      draw();
    }
  }
  async function learnPhrases(id, ids) {
    for (var i = 0; i < ids.length; i++) {
      var ok = await learnOne(id, G.BY_ID[ids[i]], i, ids.length);
      if (!ok || !live(id)) return false;
    }
    return true;
  }

  function summary(title, tally, extra) {
    var total = tally.pass + tally.half + tally.fail;
    var pct = total ? Math.round(100 * (tally.pass + tally.half * 0.5) / total) : 0;
    return head(title, 0, 0) + '<div class="center"><div style="font-size:3em">' + (pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '💪') + '</div>' +
      '<h1>Xong rồi!</h1><p>Nói đúng <b>' + tally.pass + '</b>/' + total + ' · gần đúng ' + tally.half + ' · chưa ' + tally.fail + '</p>' + (extra || '') + '</div>';
  }

  /* ---------- phiên hôm nay ---------- */
  async function startSession() {
    var id = newRun(); clockOn(); G.unlockAudio();
    var stageBefore = stageIdx();
    var due = G.progress.dueIds().slice(0, 5), fresh = G.progress.newIds().slice(0, 5);
    var tally = { pass: 0, half: 0, fail: 0 };
    if (!due.length && !fresh.length) {
      var seen = shuffle(G.progress.seenIds()).slice(0, 6);
      if (seen.length < 3) { toast('Chưa có bài để luyện'); go('home'); return; }
      if (!(await banner(id, '🔁', 'Luyện phản xạ', 'Hôm nay không có cụm cần ôn. Luyện phản xạ vài cụm đã học.'))) return;
      if (!(await reflexRound(id, seen, tally, 'Phản xạ'))) return;
    } else {
      if (due.length) {
        if (!(await banner(id, '🔁', 'Ôn lại', due.length + ' cụm đã học. Nhìn tiếng Việt, nói tiếng Anh.'))) return;
        if (!(await reflexRound(id, due, tally, 'Ôn lại'))) return;
      }
      if (fresh.length) {
        if (!(await banner(id, '🌟', 'Học cụm mới', fresh.length + ' cụm mới. Nghe, nói theo, nhớ nghĩa.'))) return;
        if (!(await learnPhrases(id, fresh))) return;
        var mix = shuffle(due.concat(fresh));
        var seenAll = shuffle(G.progress.seenIds().filter(function (x) { return mix.indexOf(x) < 0; }));
        while (mix.length < 6 && seenAll.length) mix.push(seenAll.pop());
        if (!(await banner(id, '⚡', 'Phản xạ nhanh', 'Thời gian giảm dần. Nói thật nhanh!'))) return;
        if (!(await reflexRound(id, mix.slice(0, 8), tally, 'Phản xạ'))) return;
      }
    }
    clockOff(); G.progress.snapshot();
    var after = stageIdx(), grew = after > stageBefore;
    G.sfx(grew ? 'hatch' : 'win'); confetti();
    var extra = '<div class="dragonbox bob">' + G.dragon(after, 'happy') + '</div>' +
      '<p><b>' + esc(dragonName()) + '</b>' + (grew ? ' vừa lớn lên: <b>' + G.stageInfo(G.progress.learnedCount()).name + '</b>! 🎉' : ' rất vui!') + '</p>' +
      '<button class="btn pri big" data-act="home">Về trang chủ</button>';
    show(summary('Tổng kết', tally, extra));
  }

  /* ---------- tab Học ---------- */
  render.learn = function () {
    var h = '<h1>📚 Học</h1>';
    G.TOPICS.forEach(function (t) {
      var all = 0, got = 0;
      t.lessons.forEach(function (l) { l.phrases.forEach(function (p) { all++; if (G.progress.isLearned(p.id)) got++; }); });
      h += '<button class="btn" data-act="topic" data-id="' + t.id + '" style="text-align:left"><span style="font-size:1.6em">' + t.icon + '</span> ' + esc(t.name) +
        '<span style="float:right" class="mute">' + got + '/' + all + '</span></button>';
    });
    show(h);
  };
  function topicView(tid) {
    var t = G.TOPICS.filter(function (x) { return x.id === tid; })[0];
    var h = '<button class="back" data-act="tab_learn">← Chủ đề</button><h1>' + t.icon + ' ' + esc(t.name) + '</h1>';
    t.lessons.forEach(function (l) {
      var got = l.phrases.filter(function (p) { return G.progress.isLearned(p.id); }).length;
      h += '<button class="btn" data-act="lesson" data-id="' + l.id + '" style="text-align:left">' + esc(l.name) +
        '<span style="float:right" class="mute">' + got + '/' + l.phrases.length + '</span></button>';
    });
    show(h);
  }
  function findLesson(lid) {
    var r = null;
    G.TOPICS.forEach(function (t) { t.lessons.forEach(function (l) { if (l.id === lid) r = l; }); });
    return r;
  }
  function lessonView(lid) {
    var l = findLesson(lid);
    var h = '<button class="back" data-act="topic" data-id="' + l.topicId + '">← Bài học</button><h1>' + esc(l.name) + '</h1>';
    l.phrases.forEach(function (p) {
      h += '<div class="phrase"><div class="t"><div class="en">' + esc(p.en) + '</div>' + (ST.settings.ipa ? '<div class="ipa">' + esc(p.ipa) + '</div>' : '') +
        '<div class="vi">' + esc(p.vi) + '</div></div>' +
        '<button class="pbtn" data-act="play" data-id="' + p.id + '">🔊</button><button class="pbtn slow" data-act="playslow" data-id="' + p.id + '">🐢</button></div>';
    });
    h += '<button class="btn pri big" data-act="learnlesson" data-id="' + lid + '">🌟 Học bài này</button>';
    show(h);
  }
  async function learnLesson(lid) {
    var id = newRun(); clockOn(); G.unlockAudio();
    var l = findLesson(lid), ids = l.phrases.map(function (p) { return p.id; }), tally = { pass: 0, half: 0, fail: 0 };
    if (!(await learnPhrases(id, ids))) return;
    if (!(await banner(id, '⚡', 'Phản xạ nhanh', 'Nhìn tiếng Việt, nói tiếng Anh.'))) return;
    if (!(await reflexRound(id, shuffle(ids), tally, 'Phản xạ'))) return;
    clockOff(); G.progress.snapshot(); G.sfx('win'); confetti();
    show(summary('Xong bài ' + l.name, tally, '<button class="btn pri big" data-act="lesson" data-id="' + lid + '">Về bài học</button>'));
  }

  /* ---------- tab Nói ---------- */
  var LEVELS = [
    { n: 1, name: 'Nhắc lại', d: 'Nghe máy đọc xong rồi nhắc lại.' },
    { n: 2, name: 'Đọc chậm', d: 'Máy đọc chậm 0.7x, bạn nói trễ khoảng 1 giây sau máy.' },
    { n: 3, name: 'Tốc độ thường', d: 'Tốc độ thường, chữ ẩn dần.' },
    { n: 4, name: 'Đoạn dài', d: 'Đoạn 2–3 câu liền, ẩn chữ.' }
  ];
  render.speak = function () {
    var sub = '<div class="tabsub"><button data-act="sub" data-k="reflex" class="' + (S.subSpeak === 'reflex' ? 'on' : '') + '">⚡ Phản xạ</button>' +
      '<button data-act="sub" data-k="shadow" class="' + (S.subSpeak === 'shadow' ? 'on' : '') + '">🎧 Shadowing</button>' +
      '<button data-act="sub" data-k="rec" class="' + (S.subSpeak === 'rec' ? 'on' : '') + '">🎙 Giọng đã thu</button></div>';
    if (S.subSpeak === 'reflex') {
      var seen = G.progress.seenIds().length;
      var chips = '<span class="chip' + (S.reflexTopic === 'all' ? ' on' : '') + '" data-act="rtopic" data-k="all">Tất cả</span>' +
        G.TOPICS.map(function (t) { return '<span class="chip' + (S.reflexTopic === t.id ? ' on' : '') + '" data-act="rtopic" data-k="' + t.id + '">' + t.icon + ' ' + esc(t.name) + '</span>'; }).join('');
      show('<h1>🎤 Nói</h1>' + sub + '<div class="card"><p>Nhìn tiếng Việt, nói tiếng Anh trong ' + ST.settings.reflexSec + ' giây (giảm dần xuống 5).</p>' +
        '<div>' + chips + '</div></div><p class="mute small">Đã học ' + seen + ' cụm.</p>' +
        '<button class="btn pri big" data-act="reflexgo">⚡ Luyện phản xạ</button>');
    } else if (S.subSpeak === 'shadow') {
      var h = '<h1>🎤 Nói</h1>' + sub + '<div class="card"><p class="small">Nên đeo tai nghe để máy không thu lại tiếng loa.</p></div>';
      LEVELS.forEach(function (L) {
        h += '<button class="btn' + (S.shadowLevel === L.n ? ' pri' : '') + '" data-act="slevel" data-k="' + L.n + '" style="text-align:left">Mức ' + L.n + ' · ' + L.name + '<div class="small" style="font-weight:600">' + L.d + '</div></button>';
      });
      h += '<button class="btn ok big" data-act="shadowgo">🎧 Bắt đầu shadowing</button>';
      show(h);
    } else {
      show('<h1>🎤 Nói</h1>' + sub + '<div id="reclist" class="mute">Đang tải…</div>');
      recList();
    }
  };
  async function recList() {
    var items = await G.store.list(), el = document.getElementById('reclist');
    if (!el || S.tab !== 'speak' || S.subSpeak !== 'rec') return;
    if (!items.length) { el.innerHTML = '<div class="card">Chưa có bản thu. Hãy luyện shadowing, các bản thu gần nhất sẽ nằm ở đây (tối đa 20).</div>'; return; }
    var h = G.store.persistent ? '' : '<div class="card small">Trình duyệt không cho lưu lâu dài: bản thu sẽ mất khi đóng trang.</div>';
    items.forEach(function (it) {
      var url = URL.createObjectURL(it.blob), dt = new Date(it.ts);
      h += '<div class="card"><div style="font-weight:800">' + esc(it.text) + '</div><div class="small mute">Mức ' + it.level + ' · ' + G.util.pad2(dt.getDate()) + '/' + G.util.pad2(dt.getMonth() + 1) + ' ' + G.util.pad2(dt.getHours()) + ':' + G.util.pad2(dt.getMinutes()) + '</div>' +
        '<audio controls preload="none" src="' + url + '" style="width:100%;margin:8px 0"></audio>' +
        '<button class="btn sm blue" data-act="dlrec" data-id="' + it.id + '">⬇ Tải về</button><button class="btn sm bad" data-act="delrec" data-id="' + it.id + '">Xóa</button></div>';
    });
    el.className = ''; el.innerHTML = h;
    el._items = items;
  }

  async function reflexGo() {
    var id = newRun(); clockOn(); G.unlockAudio();
    var pool = G.progress.seenIds().filter(function (x) { return S.reflexTopic === 'all' || G.BY_ID[x].topicId === S.reflexTopic; });
    if (pool.length < 3) { toast('Học ít nhất 3 cụm trong chủ đề này trước'); go('speak'); return; }
    var ids = shuffle(pool).slice(0, 8), tally = { pass: 0, half: 0, fail: 0 };
    if (!(await reflexRound(id, ids, tally, 'Phản xạ'))) return;
    clockOff(); G.progress.snapshot(); G.sfx('win');
    show(summary('Phản xạ', tally, '<button class="btn pri big" data-act="tab_speak">Xong</button>'));
  }

  /* shadowing */
  function hideWords(text, frac) {
    var w = text.split(/\s+/), n = w.length, k = Math.round(n * frac), idxs = shuffle(w.map(function (_, i) { return i; })).slice(0, k);
    return w.map(function (x, i) { return idxs.indexOf(i) >= 0 ? '▢▢▢' : x; }).join(' ');
  }
  function shadowUnits(level) {
    var seen = G.progress.seenIds();
    var pool = (seen.length >= 3 ? seen : G.ALL.map(function (p) { return p.id; })).map(function (x) { return G.BY_ID[x]; });
    if (level < 4) return shuffle(pool).slice(0, 5).map(function (p) { return { ids: [p.id], text: p.en, vi: p.vi, ipa: p.ipa }; });
    var byLesson = {};
    pool.forEach(function (p) { (byLesson[p.lessonId] = byLesson[p.lessonId] || []).push(p); });
    var keys = shuffle(Object.keys(byLesson).filter(function (k) { return byLesson[k].length >= 2; }));
    if (!keys.length) keys = shuffle(G.TOPICS.reduce(function (a, t) { return a.concat(t.lessons.map(function (l) { return l.id; })); }, [])); /* dự phòng */
    return keys.slice(0, 3).map(function (k) {
      var arr = byLesson[k] || findLesson(k).phrases;
      var pick = shuffle(arr).slice(0, Math.min(3, arr.length)).sort(function (a, b) { return a.idx - b.idx; });
      return { ids: pick.map(function (p) { return p.id; }), text: pick.map(function (p) { return p.en; }).join(' '), vi: pick.map(function (p) { return p.vi; }).join(' '), ipa: '' };
    });
  }
  async function shadowTurn(id, u, level, i, n) {
    var frac = level === 3 ? Math.min(1, i * 0.34) : level === 4 ? 1 : 0;
    var shown = frac > 0 ? hideWords(u.text, frac) : u.text;
    var rate = level === 2 ? 0.7 : 1;
    show(head('Shadowing · mức ' + level, i, n) +
      '<div class="big-en">' + esc(shown) + '</div>' + (level <= 2 && u.ipa && ST.settings.ipa ? '<div class="ipa-big">' + esc(u.ipa) + '</div>' : '') +
      '<div class="center mute">' + esc(u.vi) + '</div>' +
      '<p class="center small mute">' + LEVELS[level - 1].d + '</p>' +
      '<button class="btn pri big" data-act="go">▶ Bắt đầu lượt</button><button class="btn" data-act="next">Bỏ qua →</button>');
    var a = await waitFor('go', 'next');
    if (!live(id)) return null;
    if (a.act === 'next') return 'skip';
    G.unlockAudio();
    var overlap = ST.settings.overlap && level >= 2, rec = null, blob = null, note = '';
    show(head('Shadowing · mức ' + level, i, n) + '<div class="big-en">' + esc(shown) + '</div>' +
      '<div class="center" id="st">🔊 Nghe…</div><button class="mic live" disabled>🎤</button><button class="btn" data-act="stop">Xong</button>');
    var estMs = G.tts.estimate(u.text, rate) * 1000;
    try {
      if (overlap) {
        try { rec = await G.rec.start(); } catch (e) { throw e; }
        var sp = say(u.text, { rate: rate });
        await Promise.race([sp.then(function () { return G.util.sleep(1600); }), waitFor('stop')]);
      } else {
        await Promise.race([say(u.text, { rate: rate }), waitFor('stop')]);
        if (!live(id)) return null;
        var st = document.getElementById('st'); if (st) st.textContent = '🎤 Đến lượt bạn!';
        rec = await G.rec.start();
        await Promise.race([G.util.sleep(estMs + 1200), waitFor('stop')]);
      }
    } catch (e) { G.tts.cancel(); micHelp(e && e.name ? e.name : 'mic'); return null; }
    G.tts.cancel();
    blob = await rec.stop();
    if (!live(id)) return null;
    if (!blob || blob.size < 1000) { micHelp('bản thu rỗng'); return null; }
    var rid = String(Date.now());
    G.store.add({ id: rid, ts: Date.now(), text: u.text, level: level, blob: blob });
    var url = URL.createObjectURL(blob);
    show(head('Shadowing · mức ' + level, i, n) + '<div class="big-en">' + esc(u.text) + '</div>' +
      '<audio controls src="' + url + '" style="width:100%"></audio>' +
      '<div class="row"><button class="btn blue" data-act="say">🔊 Nghe máy</button></div>' +
      '<p class="center">Bạn thấy giọng mình thế nào?</p>' +
      '<div class="rating"><button class="btn ok" data-act="r_pass">Giống</button><button class="btn blue" data-act="r_half">Gần</button><button class="btn bad" data-act="r_fail">Chưa</button></div>');
    for (;;) {
      var r = await waitFor('say', 'r_pass', 'r_half', 'r_fail');
      if (!live(id)) return null;
      if (r.act === 'say') { say(u.text, { rate: rate }); continue; }
      var out = r.act.slice(2);
      u.ids.forEach(function (pid) { G.progress.record(pid, out); });
      G.sfx(out === 'pass' ? 'ok' : 'tap');
      return out;
    }
  }
  async function shadowGo() {
    var id = newRun(); clockOn(); G.unlockAudio();
    if (!G.rec.supported()) { toast('Trình duyệt không hỗ trợ thu âm'); go('speak'); return; }
    var level = S.shadowLevel, units = shadowUnits(level), tally = { pass: 0, half: 0, fail: 0 };
    for (var i = 0; i < units.length; i++) {
      var o = await shadowTurn(id, units[i], level, i, units.length);
      if (!live(id) || o === null) return;
      if (o !== 'skip') tally[o]++;
    }
    clockOff(); G.progress.snapshot(); G.sfx('win');
    show(summary('Shadowing', tally, '<p class="small mute">Bản thu nằm ở mục Giọng đã thu.</p><button class="btn pri big" data-act="tab_speak">Xong</button>'));
  }

  /* ---------- tab Phiên âm ---------- */
  render.sound = function () {
    var sub = '<div class="tabsub"><button data-act="ssub" data-k="table" class="' + (S.soundTab === 'table' ? 'on' : '') + '">🔤 Bảng âm</button>' +
      '<button data-act="ssub" data-k="quiz" class="' + (S.soundTab === 'quiz' ? 'on' : '') + '">👂 Nghe – chọn</button></div>';
    if (S.soundTab === 'quiz') {
      show('<h1>🔤 Phiên âm</h1>' + sub + '<div class="card"><p>Máy đọc một từ, bạn chọn từ vừa nghe. 6 câu, dùng các cặp từ dễ nhầm.</p></div><button class="btn pri big" data-act="quizgo">▶ Bắt đầu</button>');
      return;
    }
    if (S.sound >= 0) { soundDetail(S.sound); return; }
    var h = '<h1>🔤 Phiên âm</h1>' + sub + '<p class="small mute">Bấm vào ký hiệu để xem cách phát âm và nghe từ ví dụ.</p>';
    G.SOUND_GROUPS.forEach(function (g) {
      h += '<h3>' + esc(g.name) + '</h3><div class="sgrid">';
      G.SOUNDS.forEach(function (s, i) { if (s.g === g.g) h += '<button data-act="snd" data-i="' + i + '">' + esc(s.ipa) + '</button>'; });
      h += '</div>';
    });
    show(h);
  };
  function soundDetail(i) {
    var s = G.SOUNDS[i], grp = G.SOUND_GROUPS.filter(function (g) { return g.g === s.g; })[0];
    var h = '<button class="back" data-act="sndback">← Bảng âm</button>' +
      '<div class="center"><div style="font-size:4.5em;font-weight:900;color:var(--blue)">/' + esc(s.ipa) + '/</div><div class="mute">' + esc(grp.name) + '</div></div>' +
      '<div class="card">' + esc(s.tip) + '</div><h3>Từ ví dụ</h3>';
    s.words.forEach(function (w) {
      h += '<div class="phrase"><div class="t"><div class="en">' + esc(w) + '</div></div><button class="pbtn" data-act="word" data-w="' + esc(w) + '">🔊</button><button class="pbtn slow" data-act="wordslow" data-w="' + esc(w) + '">🐢</button></div>';
    });
    h += '<div class="row"><button class="btn" data-act="sndnav" data-d="-1">← Trước</button><button class="btn" data-act="sndnav" data-d="1">Sau →</button></div>';
    show(h);
  }
  async function quizGo() {
    var id = newRun(); G.unlockAudio();
    var qs = shuffle(G.PAIRS).slice(0, 6), score = 0;
    for (var i = 0; i < qs.length; i++) {
      var pr = qs[i], target = Math.random() < 0.5 ? pr.a : pr.b, opts = shuffle([pr.a, pr.b]);
      show(head('Nghe – chọn', i, qs.length) + '<p class="center mute">' + esc(pr.note) + '</p>' +
        '<button class="btn blue big" data-act="again">🔊 Nghe lại</button>' +
        '<div class="opts">' + opts.map(function (o) { return '<button class="btn" data-act="opt" data-w="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>');
      say(target);
      var ans;
      for (;;) {
        var a = await waitFor('again', 'opt');
        if (!live(id)) return;
        if (a.act === 'again') { say(target); continue; }
        ans = a.el.getAttribute('data-w'); break;
      }
      var ok = ans === target; if (ok) score++;
      G.sfx(ok ? 'ok' : 'bad');
      show(head('Nghe – chọn', i, qs.length) + '<h2 class="center">' + (ok ? '✅ Đúng!' : '❌ Chưa đúng') + '</h2>' +
        '<div class="card center">Từ vừa đọc: <b>' + esc(target) + '</b><br><span class="mute">' + esc(pr.a) + ' · ' + esc(pr.b) + '</span></div>' +
        '<div class="row"><button class="btn blue" data-act="wa">🔊 ' + esc(pr.a) + '</button><button class="btn blue" data-act="wb">🔊 ' + esc(pr.b) + '</button></div>' +
        '<button class="btn pri" data-act="next">Tiếp →</button>');
      for (;;) {
        var b = await waitFor('wa', 'wb', 'next');
        if (!live(id)) return;
        if (b.act === 'next') break;
        say(b.act === 'wa' ? pr.a : pr.b);
      }
    }
    G.sfx('win'); confetti();
    show('<div class="center" style="margin-top:30px"><div style="font-size:3em">👂</div><h1>' + score + '/' + qs.length + ' câu đúng</h1><button class="btn pri big" data-act="tab_sound">Xong</button></div>');
  }

  /* ---------- tab Cài đặt ---------- */
  function voiceOptions() {
    var acc = ST.settings.accent, want = acc === 'gb' ? 'en-gb' : 'en-us';
    var list = G.tts.voices.filter(function (v) { return v.lang.replace('_', '-').toLowerCase() === want; });
    if (!list.length) list = G.tts.voices;
    var cur = ST.settings.voices[acc] || '';
    return '<option value="">Tự chọn</option>' + list.map(function (v) {
      return '<option value="' + esc(v.voiceURI) + '"' + (v.voiceURI === cur ? ' selected' : '') + '>' + esc(v.name) + ' (' + esc(v.lang) + ')</option>';
    }).join('');
  }
  function sw(label, key) {
    return '<label class="switch">' + label + '<input type="checkbox" data-set="' + key + '"' + (ST.settings[key] ? ' checked' : '') + '></label>';
  }
  render.settings = function () {
    var s = ST.settings;
    function chips(key, arr) {
      return arr.map(function (o) { return '<span class="chip' + (String(s[key]) === String(o[0]) ? ' on' : '') + '" data-act="setchip" data-key="' + key + '" data-v="' + o[0] + '">' + o[1] + '</span>'; }).join('');
    }
    show('<h1>⚙️ Cài đặt</h1>' +
      '<label class="set">Tên của bạn</label><input type="text" id="nUser" value="' + esc(ST.names.user) + '" data-name="user">' +
      '<label class="set">Tên của rồng</label><input type="text" id="nDragon" value="' + esc(ST.names.dragon) + '" data-name="dragon">' +
      '<label class="set">Giọng đọc</label><div>' + chips('accent', [['us', '🇺🇸 Mỹ'], ['gb', '🇬🇧 Anh']]) + '</div>' +
      '<select id="voiceSel">' + voiceOptions() + '</select>' +
      '<button class="btn sm blue" data-act="testvoice">🔊 Nghe thử</button>' +
      '<label class="set">Tốc độ đọc: <span id="rateV">' + s.rate + '</span>x</label><input type="range" min="0.6" max="1.2" step="0.05" value="' + s.rate + '" data-range="rate">' +
      '<label class="set">Thời gian phản xạ: <span id="rsV">' + s.reflexSec + '</span> giây</label><input type="range" min="5" max="15" step="1" value="' + s.reflexSec + '" data-range="reflexSec">' +
      '<label class="set">Mức chấm điểm</label><div>' + chips('strict', [['easy', 'Dễ'], ['medium', 'Vừa'], ['strict', 'Khắt khe']]) + '</div>' +
      '<label class="set">Cỡ chữ</label><div>' + chips('fontSize', [['s', 'Nhỏ'], ['m', 'Vừa'], ['l', 'Lớn']]) + '</div>' +
      sw('Hiện phiên âm', 'ipa') + sw('Âm thanh vui nhộn', 'sound') + sw('Shadowing: nói cùng lúc với máy (mức 2–4)', 'overlap') +
      '<h2>Sao lưu</h2><p class="small mute">Tiến độ lưu trên máy này. Nên sao lưu thỉnh thoảng (bản thu âm không nằm trong sao lưu).</p>' +
      '<button class="btn blue" data-act="export">⬇ Sao lưu ra tệp</button>' +
      '<button class="btn" data-act="import">⬆ Khôi phục từ tệp</button><input type="file" id="impf" accept=".json,application/json" hidden>' +
      '<button class="btn bad" data-act="resetask">Xóa toàn bộ tiến độ</button>' +
      '<p class="center small mute">Game Giáo Dục · bản 1</p>');
  };

  /* ---------- xử lý bấm ---------- */
  var acts = {
    quit: function () { go(S.tab); },
    home: function () { go('home'); },
    reload: function () { location.reload(); },
    closemodal: closeModal,
    roar: function (el) {
      G.sfx('roar'); var b = document.querySelector('.dragonbox');
      if (b) { b.innerHTML = G.dragon(stageIdx(), 'surprised') + b.querySelector('.bubble').outerHTML; setTimeout(function () { if (S.tab === 'home') render.home(); }, 1200); }
    },
    start: startSession,
    metric: function (el) {
      var k = el.getAttribute('data-k'), m = ST.settings.chartMetrics, i = m.indexOf(k);
      if (i >= 0) { if (m.length > 1) m.splice(i, 1); } else m.push(k);
      G.save(); render.home();
    },
    tab_learn: function () { go('learn'); }, tab_speak: function () { go('speak'); }, tab_sound: function () { go('sound'); },
    topic: function (el) { topicView(el.getAttribute('data-id')); },
    lesson: function (el) { lessonView(el.getAttribute('data-id')); },
    play: function (el) { G.unlockAudio(); say(G.BY_ID[el.getAttribute('data-id')].en); },
    playslow: function (el) { G.unlockAudio(); say(G.BY_ID[el.getAttribute('data-id')].en, { rate: 0.7 }); },
    learnlesson: function (el) { learnLesson(el.getAttribute('data-id')); },
    sub: function (el) { S.subSpeak = el.getAttribute('data-k'); render.speak(); },
    rtopic: function (el) { S.reflexTopic = el.getAttribute('data-k'); render.speak(); },
    reflexgo: reflexGo,
    slevel: function (el) { S.shadowLevel = +el.getAttribute('data-k'); render.speak(); },
    shadowgo: shadowGo,
    dlrec: async function (el) {
      var items = await G.store.list(), it = items.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
      if (it) G.download(it.blob, 'giong-' + it.id + (/mp4/.test(it.blob.type) ? '.m4a' : '.webm'));
    },
    delrec: async function (el) { await G.store.remove(el.getAttribute('data-id')); recList(); },
    ssub: function (el) { S.soundTab = el.getAttribute('data-k'); S.sound = -1; render.sound(); },
    snd: function (el) { S.sound = +el.getAttribute('data-i'); soundDetail(S.sound); },
    sndback: function () { S.sound = -1; render.sound(); },
    sndnav: function (el) { var n = G.SOUNDS.length; S.sound = (S.sound + (+el.getAttribute('data-d')) + n) % n; soundDetail(S.sound); },
    word: function (el) { G.unlockAudio(); say(el.getAttribute('data-w')); },
    wordslow: function (el) { G.unlockAudio(); say(el.getAttribute('data-w'), { rate: 0.6 }); },
    quizgo: quizGo,
    setchip: function (el) {
      var k = el.getAttribute('data-key'), v = el.getAttribute('data-v');
      ST.settings[k] = k === 'rate' ? +v : v; G.save(); applyPrefs(); render.settings();
    },
    testvoice: function () { G.unlockAudio(); say('Hello, nice to meet you. How are you today?'); },
    export: function () { G.backup.exportFile(); },
    import: function () { document.getElementById('impf').click(); },
    resetask: function () {
      modal('<h2>Xóa toàn bộ tiến độ?</h2><p class="mute">Rồng quay về quả trứng, các cụm đã học bị xóa. Không thể hoàn tác.</p>' +
        '<button class="btn bad" data-act="resetdo">Xóa hết</button><button class="btn" data-act="closemodal">Hủy</button>');
    },
    resetdo: function () { G.backup.reset(); ST = G.state(); applyPrefs(); closeModal(); askNames(); go('home'); },
    savenames: function () {
      var u = document.getElementById('pnUser').value.trim(), d = document.getElementById('pnDragon').value.trim();
      if (!u) { toast('Hãy nhập tên của bạn'); return; }
      ST.names.user = u.slice(0, 20); ST.names.dragon = (d || 'Rồng Lửa').slice(0, 20); G.save(); closeModal(); go('home');
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    G.unlockAudio();
    if (act !== 'play' && act !== 'playslow' && act !== 'roar') G.sfx('tap');
    if (pending && pending.names.indexOf(act) >= 0) {
      var p = pending; pending = null; p.resolve({ act: act, el: el }); return;
    }
    if (acts[act]) acts[act](el);
  });
  document.getElementById('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]');
    if (b) { G.unlockAudio(); G.sfx('tap'); if (b.getAttribute('data-tab') === 'sound') S.sound = -1; go(b.getAttribute('data-tab')); }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.getAttribute('data-name')) { ST.names[t.getAttribute('data-name')] = t.value.slice(0, 20); G.save(); }
    var r = t.getAttribute('data-range');
    if (r) {
      ST.settings[r] = +t.value; G.save();
      var sp = document.getElementById(r === 'rate' ? 'rateV' : 'rsV'); if (sp) sp.textContent = t.value;
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    var k = t.getAttribute('data-set');
    if (k) { ST.settings[k] = t.checked; G.save(); return; }
    if (t.id === 'voiceSel') { ST.settings.voices[ST.settings.accent] = t.value; G.save(); return; }
    if (t.id === 'impf' && t.files && t.files[0]) {
      var fr = new FileReader();
      fr.onload = function () {
        try { G.backup.importText(String(fr.result)); ST = G.state(); applyPrefs(); toast('Đã khôi phục'); go('home'); }
        catch (err) { toast('Tệp không hợp lệ'); }
      };
      fr.readAsText(t.files[0]);
    }
  });
  G.onVoices = function () { if (S.tab === 'settings') { var s = document.getElementById('voiceSel'); if (s) s.innerHTML = voiceOptions(); } };
  window.addEventListener('pagehide', clockOff);
  document.addEventListener('visibilitychange', function () { if (document.hidden) clockOff(); else if (RUN > 0 && S.tab !== 'home') { /* tiếp tục đo khi quay lại luồng luyện */ } });

  function askNames() {
    if (ST.names.user) return;
    modal('<div style="font-size:3em">🥚</div><h2>Chào mừng!</h2><p class="mute">Một quả trứng rồng đang chờ bạn.</p>' +
      '<label class="set" style="text-align:left">Bạn tên gì?</label><input type="text" id="pnUser" maxlength="20" placeholder="Tên của bạn">' +
      '<label class="set" style="text-align:left">Đặt tên cho rồng</label><input type="text" id="pnDragon" maxlength="20" placeholder="Ví dụ: Lửa">' +
      '<button class="btn pri" data-act="savenames">Bắt đầu</button>');
  }

  applyPrefs();
  go('home');
  askNames();
})();
