/* Rồng gốc vẽ bằng SVG: 5 giai đoạn (0 trứng .. 4 trưởng thành), 4 tâm trạng. */
(function () {
  'use strict';
  var G = window.GGD, uid = 0;

  /* Thông số theo giai đoạn 1..4 */
  var ST = [
    null,
    { hr: 44, hy: 98, bx: 30, by2: 24, by: 152, wing: 16, horn: 10, spikes: 0, tail: 20, glow: 0 },
    { hr: 41, hy: 86, bx: 38, by2: 32, by: 144, wing: 30, horn: 15, spikes: 3, tail: 28, glow: 0 },
    { hr: 38, hy: 73, bx: 43, by2: 38, by: 133, wing: 42, horn: 21, spikes: 5, tail: 36, glow: 0 },
    { hr: 35, hy: 68, bx: 47, by2: 42, by: 130, wing: 48, horn: 22, spikes: 7, tail: 44, glow: 1 }
  ];
  var C = { body: '#4ecb8d', dark: '#2f9e6b', belly: '#ffe08a', wing: '#ff9f68', wingDark: '#e2703a', horn: '#fff1c2', spike: '#ff7b54', cheek: '#ff8fa3' };

  function r1(n) { return Math.round(n * 10) / 10; }

  function eggSvg(id, mood) {
    var crack = mood === 'happy'
      ? '<path d="M82 74 L92 88 L84 98 L96 110" fill="none" stroke="#a8742f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' : '';
    var zz = mood === 'sleepy'
      ? '<g class="zz" fill="#cfd8ff" font-family="system-ui,sans-serif" font-weight="800"><text x="132" y="62" font-size="22">Z</text><text x="150" y="42" font-size="16">z</text></g>' : '';
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trứng rồng">' +
      '<defs><radialGradient id="eg' + id + '" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#f3c98b"/></radialGradient></defs>' +
      '<ellipse cx="100" cy="188" rx="46" ry="8" fill="rgba(0,0,0,.25)"/>' +
      '<g class="eggbody"><ellipse cx="100" cy="118" rx="50" ry="66" fill="url(#eg' + id + ')" stroke="#c98f4a" stroke-width="3"/>' +
      '<circle cx="76" cy="104" r="10" fill="' + C.body + '"/><circle cx="118" cy="132" r="12" fill="' + C.body + '"/>' +
      '<circle cx="104" cy="92" r="6" fill="' + C.wing + '"/><circle cx="82" cy="146" r="7" fill="' + C.wing + '"/><circle cx="126" cy="106" r="5" fill="' + C.wing + '"/>' +
      '<path d="M68 82 Q76 62 94 56" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".7"/>' +
      crack + '</g>' + zz + '</svg>';
  }

  function eyes(hr, hy, mood) {
    var ex = hr * 0.4, ey = hy - hr * 0.05, er = hr * 0.2, out = '', s;
    for (s = -1; s <= 1; s += 2) {
      var x = 100 + s * ex;
      if (mood === 'happy') {
        out += '<path d="M' + r1(x - er) + ' ' + r1(ey + er * 0.3) + ' Q' + r1(x) + ' ' + r1(ey - er * 1.3) + ' ' + r1(x + er) + ' ' + r1(ey + er * 0.3) + '" fill="none" stroke="#21304a" stroke-width="3.5" stroke-linecap="round"/>';
      } else if (mood === 'sleepy') {
        out += '<path d="M' + r1(x - er) + ' ' + r1(ey) + ' Q' + r1(x) + ' ' + r1(ey + er * 1.2) + ' ' + r1(x + er) + ' ' + r1(ey) + '" fill="none" stroke="#21304a" stroke-width="3.5" stroke-linecap="round"/>';
      } else {
        var big = mood === 'surprised' ? 1.25 : 1, pr = mood === 'surprised' ? 0.42 : 0.58;
        out += '<circle cx="' + r1(x) + '" cy="' + r1(ey) + '" r="' + r1(er * big) + '" fill="#fff" stroke="#21304a" stroke-width="2.5"/>' +
          '<circle cx="' + r1(x + 1) + '" cy="' + r1(ey + 1) + '" r="' + r1(er * big * pr) + '" fill="#21304a"/>' +
          '<circle cx="' + r1(x + er * 0.25) + '" cy="' + r1(ey - er * 0.2) + '" r="' + r1(er * 0.2) + '" fill="#fff"/>';
      }
    }
    return out;
  }

  function mouth(hr, hy, mood) {
    var my = hy + hr * 0.52, w = hr * 0.28;
    if (mood === 'happy') {
      return '<path d="M' + r1(100 - w) + ' ' + r1(my - 2) + ' Q100 ' + r1(my + w * 1.5) + ' ' + r1(100 + w) + ' ' + r1(my - 2) + ' Z" fill="#7a2e3b" stroke="#21304a" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<ellipse cx="100" cy="' + r1(my + w * 0.7) + '" rx="' + r1(w * 0.5) + '" ry="' + r1(w * 0.3) + '" fill="#ff8fa3"/>';
    }
    if (mood === 'surprised') {
      return '<ellipse cx="100" cy="' + r1(my + 2) + '" rx="' + r1(w * 0.45) + '" ry="' + r1(w * 0.6) + '" fill="#7a2e3b" stroke="#21304a" stroke-width="2.5"/>';
    }
    if (mood === 'sleepy') {
      return '<path d="M' + r1(100 - w * 0.5) + ' ' + r1(my) + ' Q100 ' + r1(my + 3) + ' ' + r1(100 + w * 0.5) + ' ' + r1(my) + '" fill="none" stroke="#21304a" stroke-width="3" stroke-linecap="round"/>';
    }
    return '<path d="M' + r1(100 - w * 0.8) + ' ' + r1(my) + ' Q100 ' + r1(my + w * 0.8) + ' ' + r1(100 + w * 0.8) + ' ' + r1(my) + '" fill="none" stroke="#21304a" stroke-width="3" stroke-linecap="round"/>';
  }

  function sparkles(mood, stage) {
    if (mood !== 'happy') return '';
    var pts = [[34, 52, 9], [168, 44, 11], [28, 120, 7], [176, 104, 8]];
    if (stage < 2) pts = pts.slice(0, 2);
    return '<g class="spark" fill="#ffe66d">' + pts.map(function (p) {
      var x = p[0], y = p[1], s = p[2];
      return '<path d="M' + x + ' ' + (y - s) + ' L' + (x + s * 0.3) + ' ' + (y - s * 0.3) + ' L' + (x + s) + ' ' + y + ' L' + (x + s * 0.3) + ' ' + (y + s * 0.3) + ' L' + x + ' ' + (y + s) + ' L' + (x - s * 0.3) + ' ' + (y + s * 0.3) + ' L' + (x - s) + ' ' + y + ' L' + (x - s * 0.3) + ' ' + (y - s * 0.3) + ' Z"/>';
    }).join('') + '</g>';
  }

  /* stage: 0..4; mood: 'neutral' | 'happy' | 'surprised' | 'sleepy' */
  G.dragon = function (stage, mood) {
    stage = Math.max(0, Math.min(4, stage | 0));
    mood = mood || 'neutral';
    var id = ++uid;
    if (stage === 0) return eggSvg(id, mood);
    var p = ST[stage], hr = p.hr, hy = p.hy, bx = p.bx, bry = p.by2, by = p.by;
    var o = '<svg viewBox="' + (stage >= 3 ? '-8 0 216 200' : '0 0 200 200') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rồng">';
    o += '<defs>' +
      '<radialGradient id="bd' + id + '" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#8ff0b8"/><stop offset="1" stop-color="' + C.body + '"/></radialGradient>' +
      '<radialGradient id="gl' + id + '" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3a8" stop-opacity=".85"/><stop offset="1" stop-color="#fff3a8" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    if (p.glow) o += '<circle class="glow" cx="100" cy="112" r="96" fill="url(#gl' + id + ')"/>';
    o += '<ellipse cx="100" cy="190" rx="' + (bx + 14) + '" ry="7" fill="rgba(0,0,0,.25)"/>';

    /* cánh */
    if (p.wing) {
      var w = p.wing, ax = bx * 0.75, ay = by - bry * 0.35, s;
      for (s = -1; s <= 1; s += 2) {
        var x0 = 100 + s * ax;
        var d = 'M' + r1(x0) + ' ' + r1(ay) +
          ' Q' + r1(x0 + s * w * 0.9) + ' ' + r1(ay - w * 1.15) + ' ' + r1(x0 + s * w * 1.45) + ' ' + r1(ay - w * 0.25) +
          ' Q' + r1(x0 + s * w * 1.05) + ' ' + r1(ay + w * 0.05) + ' ' + r1(x0 + s * w * 0.85) + ' ' + r1(ay + w * 0.55) +
          ' Q' + r1(x0 + s * w * 0.5) + ' ' + r1(ay + w * 0.2) + ' ' + r1(x0) + ' ' + r1(ay + w * 0.4) + ' Z';
        o += '<path class="wing' + (s < 0 ? 'L' : 'R') + '" d="' + d + '" fill="' + C.wing + '" stroke="' + C.wingDark + '" stroke-width="3" stroke-linejoin="round"/>';
      }
    }
    /* đuôi */
    var t = p.tail, tw = 8 + stage * 2.5;
    var tx0 = 100 + bx * 0.7, ty0 = by + bry * 0.35;
    o += '<path d="M' + r1(tx0) + ' ' + r1(ty0) + ' C' + r1(tx0 + t * 0.9) + ' ' + r1(ty0 + 8) + ' ' + r1(tx0 + t * 1.1) + ' ' + r1(ty0 - 18) + ' ' + r1(tx0 + t * 0.75) + ' ' + r1(ty0 - 32) +
      '" fill="none" stroke="' + C.dark + '" stroke-width="' + tw + '" stroke-linecap="round"/>';
    o += '<path d="M' + r1(tx0 + t * 0.75 - 7) + ' ' + r1(ty0 - 30) + ' L' + r1(tx0 + t * 0.75 + 4) + ' ' + r1(ty0 - 52) + ' L' + r1(tx0 + t * 0.75 + 12) + ' ' + r1(ty0 - 28) + ' Z" fill="' + C.spike + '" stroke="' + C.wingDark + '" stroke-width="2" stroke-linejoin="round"/>';
    /* gai lưng */
    if (p.spikes) {
      var n = p.spikes, k, step = (bx * 1.5) / Math.max(n, 1);
      for (k = 0; k < n; k++) {
        var sx = 100 + (k - (n - 1) / 2) * step, sy = by - bry + 4, sh = 10 + stage * 2;
        o += '<path d="M' + r1(sx - 6) + ' ' + r1(sy + 4) + ' L' + r1(sx) + ' ' + r1(sy - sh) + ' L' + r1(sx + 6) + ' ' + r1(sy + 4) + ' Z" fill="' + C.spike + '" stroke="' + C.wingDark + '" stroke-width="2" stroke-linejoin="round"/>';
      }
    }
    /* thân, bụng, chân */
    o += '<ellipse cx="100" cy="' + r1(by) + '" rx="' + bx + '" ry="' + bry + '" fill="url(#bd' + id + ')" stroke="' + C.dark + '" stroke-width="3"/>';
    o += '<ellipse cx="100" cy="' + r1(by + bry * 0.18) + '" rx="' + r1(bx * 0.62) + '" ry="' + r1(bry * 0.68) + '" fill="' + C.belly + '"/>';
    if (stage >= 2) {
      var bl;
      for (bl = 0; bl < 3; bl++) o += '<path d="M' + r1(100 - bx * 0.45) + ' ' + r1(by + bry * (0.0 + bl * 0.28)) + ' Q100 ' + r1(by + bry * (0.12 + bl * 0.28)) + ' ' + r1(100 + bx * 0.45) + ' ' + r1(by + bry * (0.0 + bl * 0.28)) + '" fill="none" stroke="#e5b84f" stroke-width="2" stroke-linecap="round"/>';
    }
    o += '<ellipse cx="' + r1(100 - bx * 0.5) + '" cy="' + r1(by + bry * 0.92) + '" rx="12" ry="7" fill="' + C.dark + '"/>' +
      '<ellipse cx="' + r1(100 + bx * 0.5) + '" cy="' + r1(by + bry * 0.92) + '" rx="12" ry="7" fill="' + C.dark + '"/>';

    /* sừng */
    var hn = p.horn, hs;
    for (hs = -1; hs <= 1; hs += 2) {
      var hx = 100 + hs * hr * 0.5, hb = hy - hr * 0.72;
      o += '<path d="M' + r1(hx - 6) + ' ' + r1(hb + 4) + ' L' + r1(hx + hs * hr * 0.28) + ' ' + r1(hy - hr - hn) + ' L' + r1(hx + 7) + ' ' + r1(hb + 4) + ' Z" fill="' + C.horn + '" stroke="#d9b45a" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    /* đầu */
    o += '<circle cx="100" cy="' + r1(hy) + '" r="' + hr + '" fill="url(#bd' + id + ')" stroke="' + C.dark + '" stroke-width="3"/>';
    o += '<ellipse cx="100" cy="' + r1(hy + hr * 0.38) + '" rx="' + r1(hr * 0.56) + '" ry="' + r1(hr * 0.4) + '" fill="#b6f5d2"/>';
    o += '<circle cx="' + r1(100 - hr * 0.16) + '" cy="' + r1(hy + hr * 0.3) + '" r="2.4" fill="' + C.dark + '"/><circle cx="' + r1(100 + hr * 0.16) + '" cy="' + r1(hy + hr * 0.3) + '" r="2.4" fill="' + C.dark + '"/>';
    if (mood !== 'sleepy') {
      o += '<circle cx="' + r1(100 - hr * 0.68) + '" cy="' + r1(hy + hr * 0.22) + '" r="' + r1(hr * 0.13) + '" fill="' + C.cheek + '" opacity=".75"/>' +
        '<circle cx="' + r1(100 + hr * 0.68) + '" cy="' + r1(hy + hr * 0.22) + '" r="' + r1(hr * 0.13) + '" fill="' + C.cheek + '" opacity=".75"/>';
    }
    o += eyes(hr, hy, mood) + mouth(hr, hy, mood);
    if (mood === 'sleepy') {
      o += '<g class="zz" fill="#cfd8ff" font-family="system-ui,sans-serif" font-weight="800"><text x="' + r1(100 + hr + 6) + '" y="' + r1(hy - hr * 0.6) + '" font-size="22">Z</text><text x="' + r1(100 + hr + 24) + '" y="' + r1(hy - hr * 0.95) + '" font-size="15">z</text></g>';
    }
    o += sparkles(mood, stage);
    return o + '</svg>';
  };
})();
