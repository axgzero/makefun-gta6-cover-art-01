// Vice Coast Cover Studio — cover render engine.
// Draws the multi-panel poster cover onto any 2D canvas: panels of photos,
// a Vice City neon-sunset grade, vector palms + skyline, and bold title
// lettering. Every drawn shape here is original; no game art, logo or font.

export const LAYOUTS = [
  {
    id: 'hero', name: 'Hero + 3',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 0.333 },
      { x: 0.62, y: 0.333, w: 0.38, h: 0.334 },
      { x: 0.62, y: 0.667, w: 0.38, h: 0.333 },
    ],
    title: { x: 0.03, y: 0.76, w: 0.94, h: 0.21, band: 'bottom' },
  },
  {
    id: 'collage', name: 'Collage 5',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.60 },
      { x: 0.5, y: 0, w: 0.5, h: 0.60 },
      { x: 0, y: 0.60, w: 0.333, h: 0.40 },
      { x: 0.333, y: 0.60, w: 0.334, h: 0.40 },
      { x: 0.667, y: 0.60, w: 0.333, h: 0.40 },
    ],
    title: { x: 0.03, y: 0.02, w: 0.94, h: 0.17, band: 'top' },
  },
  {
    id: 'grid', name: 'Poster 6',
    panels: [
      { x: 0, y: 0, w: 0.333, h: 0.42 },
      { x: 0.333, y: 0, w: 0.334, h: 0.42 },
      { x: 0.667, y: 0, w: 0.333, h: 0.42 },
      { x: 0, y: 0.58, w: 0.333, h: 0.42 },
      { x: 0.333, y: 0.58, w: 0.334, h: 0.42 },
      { x: 0.667, y: 0.58, w: 0.333, h: 0.42 },
    ],
    title: { x: 0.03, y: 0.42, w: 0.94, h: 0.16, band: 'center' },
  },
  {
    id: 'strips', name: 'Snapshots',
    panels: [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 0.05, y: 0.66, w: 0.28, h: 0.27, rot: -4 },
      { x: 0.36, y: 0.68, w: 0.28, h: 0.27, rot: 2 },
      { x: 0.67, y: 0.66, w: 0.28, h: 0.27, rot: -2 },
    ],
    title: { x: 0.04, y: 0.05, w: 0.92, h: 0.18, band: 'top' },
  },
];

export const GRADES = [
  { id: 'vice-sunset', name: 'Vice Sunset', sky: ['#ff9a3d', '#ff4d8d', '#7b2ff7'], tint: '#ff5e8a', glow: '#ff4d8d', dot: '#ff9a3d' },
  { id: 'neon-night', name: 'Neon Night', sky: ['#2de2c5', '#ff4d8d', '#1b0f4b'], tint: '#ff4dd2', glow: '#2de2c5', dot: '#2de2c5' },
  { id: 'palm-gold', name: 'Palm Gold', sky: ['#ffd166', '#ff7a3d', '#8a2be2'], tint: '#ffb03d', glow: '#ffd166', dot: '#ffd166' },
  { id: 'teal-heat', name: 'Teal Heat', sky: ['#2de2c5', '#ff7a59', '#3d1a6e'], tint: '#2de2c5', glow: '#ff7a59', dot: '#ff7a59' },
  { id: 'midnight', name: 'Midnight', sky: ['#7b6cff', '#ff4d8d', '#0b1035'], tint: '#8a7bff', glow: '#7b6cff', dot: '#c9b3ff' },
];

export const SIZES = [
  { id: 'square', name: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

/** Deterministic pseudo-random stream, so the grain is identical on every export. */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** One original vector palm tree: curved trunk, five drooping fronds. */
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(10, -55, 26, -96);
  ctx.stroke();
  ctx.translate(26, -96);
  for (let i = 0; i < 5; i++) {
    const a = (-150 + i * 52) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * 34, Math.sin(a) * 30 - 14, Math.cos(a) * 58, Math.sin(a) * 44 + 16);
    ctx.quadraticCurveTo(Math.cos(a) * 34, Math.sin(a) * 30 + 8, 0, 0);
    ctx.fill();
  }
  ctx.restore();
}

/** A low city skyline silhouette with a few lit windows. */
export function drawSkyline(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  const rnd = seededRandom(77);
  let cx = x;
  while (cx < x + w) {
    const bw = w * (0.05 + rnd() * 0.07);
    const bh = h * (0.35 + rnd() * 0.65);
    ctx.fillRect(cx, y + h - bh, bw, bh);
    if (rnd() > 0.5) ctx.fillRect(cx + bw * 0.3, y + h - bh - h * 0.12, bw * 0.4, h * 0.12);
    cx += bw + w * 0.012;
  }
  ctx.restore();
}

/** Cover-fit draw of one photo into a panel rect, with zoom / pan / flip. */
export function drawPanelPhoto(ctx, img, rect, panel) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img && img.naturalWidth > 0) {
    const zoom = panel.zoom || 1;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = x + (w - dw) / 2 + (panel.ox || 0) * w;
    const dy = y + (h - dh) / 2 + (panel.oy || 0) * h;
    if (panel.flip) {
      ctx.translate(x + w / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(x + w / 2), 0);
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3d1a6e');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff88';
    ctx.font = `700 ${Math.round(h * 0.09)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
  }
  ctx.restore();
}

/** The neon-sunset grade: warm wash, coloured light from the top, cool shadow. */
export function applyGrade(ctx, rect, grade) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const wash = ctx.createLinearGradient(x, y, x, y + h);
  wash.addColorStop(0, grade.sky[0]);
  wash.addColorStop(0.55, grade.tint);
  wash.addColorStop(1, grade.sky[2]);
  ctx.globalAlpha = 0.22;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 0.10;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = grade.sky[2];
  ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
  ctx.restore();
}

/** Bold poster lettering: gradient fill, dark outline, neon glow. */
export function drawTitle(ctx, text, zone, grade, style) {
  const { x, y, w, h } = zone;
  const fs = Math.min(h * 0.58, (w / Math.max(text.length, 1)) * 1.15);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${Math.round(fs * 0.03)}px`; } catch { /* older canvas */ }
  ctx.font = `900 ${Math.round(fs)}px 'Arial Black', Impact, 'Franklin Gothic Heavy', sans-serif`;
  const cx = x + w / 2;
  const cy = y + h * 0.52;
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = fs * 0.28;
  if (style === 'neon') {
    ctx.lineWidth = Math.max(2, fs * 0.07);
    ctx.strokeStyle = grade.glow;
    ctx.strokeText(text, cx, cy);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cx, cy);
  } else if (style === 'solid') {
    ctx.shadowBlur = fs * 0.12;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cx, cy);
  } else {
    const g = ctx.createLinearGradient(cx, cy - fs * 0.5, cx, cy + fs * 0.5);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#ffe27a');
    g.addColorStop(1, grade.tint);
    ctx.lineWidth = Math.max(2, fs * 0.09);
    ctx.strokeStyle = '#1a0b2e';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, cx, cy);
    ctx.fillStyle = g;
    ctx.fillText(text, cx, cy);
  }
  ctx.restore();
  return fs;
}

export function drawSubtitle(ctx, text, zone, fs, grade) {
  if (!text) return;
  const { x, y, w, h } = zone;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const sub = Math.max(14, fs * 0.26);
  ctx.font = `italic 700 ${Math.round(sub)}px 'Segoe Script', 'Brush Script MT', cursive`;
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = sub * 0.5;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x + w / 2, y + h * 0.92);
  ctx.restore();
}

/** Star-burst badge with the cover's own invented label. */
export function drawBadge(ctx, text, cx, cy, r, grade) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = grade.dot;
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#1a0b2e';
  ctx.stroke();
  ctx.fillStyle = '#1a0b2e';
  ctx.font = `900 ${Math.round(r * 0.34)}px 'Arial Black', Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** Film grain + vignette, deterministic so exports match the preview. */
export function applyFinish(ctx, W, H) {
  const rnd = seededRandom(W * 31 + H * 17 + 12345);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  const n = Math.floor((W * H) / 9000);
  for (let i = 0; i < n; i++) {
    ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  }
  ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,4,24,0.38)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Draw the whole cover.
 * state: { layout, grade, title, subtitle, badge, titleStyle, panels: [{photo, zoom, ox, oy, flip}] }
 * photos: Map of photo key -> HTMLImageElement. A panel's photo is a key in that map.
 */
export function drawCover(ctx, state, W, H, photos) {
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // Sunset sky behind everything.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.5, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun disc + palms peeking behind the panels.
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.2, Math.min(W, H) * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawPalm(ctx, W * 0.04, H * 0.30, Math.min(W, H) * 0.0011, '#2a0f3a55');
  drawPalm(ctx, W * 0.94, H * 0.34, Math.min(W, H) * 0.0013, '#2a0f3a55');

  // Panels.
  const gap = Math.max(4, Math.round(Math.min(W, H) * 0.008));
  layout.panels.forEach((p, i) => {
    const rect = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
    const panel = state.panels[i] || { photo: null, zoom: 1, ox: 0, oy: 0, flip: false };
    ctx.save();
    if (p.rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = Math.min(W, H) * 0.02;
    ctx.shadowOffsetY = Math.min(W, H) * 0.008;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rect.x - gap / 2, rect.y - gap / 2, rect.w + gap, rect.h + gap);
    ctx.restore();
    const inner = { x: rect.x + gap / 2, y: rect.y + gap / 2, w: rect.w - gap, h: rect.h - gap };
    ctx.save();
    if (p.rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    drawPanelPhoto(ctx, panel.photo ? photos.get(panel.photo) : null, inner, panel);
    applyGrade(ctx, inner, grade);
    ctx.restore();
  });

  // Title band. The title zone leaves the right-hand strip free for the badge.
  const t = layout.title;
  const zone = { x: t.x * W, y: t.y * H, w: t.w * W * 0.86, h: t.h * H };
  const band = ctx.createLinearGradient(0, zone.y, 0, zone.y + zone.h);
  if (t.band === 'top') {
    band.addColorStop(0, 'rgba(20,6,40,0.88)');
    band.addColorStop(1, 'rgba(20,6,40,0)');
  } else if (t.band === 'center') {
    band.addColorStop(0, 'rgba(20,6,40,0)');
    band.addColorStop(0.5, 'rgba(20,6,40,0.92)');
    band.addColorStop(1, 'rgba(20,6,40,0)');
  } else {
    band.addColorStop(0, 'rgba(20,6,40,0)');
    band.addColorStop(1, 'rgba(20,6,40,0.92)');
  }
  ctx.fillStyle = band;
  ctx.fillRect(0, zone.y, W, zone.h);
  drawSkyline(ctx, W * 0.03, zone.y + zone.h * 0.62, W * 0.94, zone.h * 0.38, '#12081f66');
  const fs = drawTitle(ctx, (state.title || 'VICE COAST').toUpperCase(), zone, grade, state.titleStyle || 'sunset');
  drawSubtitle(ctx, state.subtitle || '', zone, fs, grade);
  if (state.badge) {
    drawBadge(ctx, state.badge, W * 0.925, zone.y + zone.h * 0.5, Math.min(W, H) * 0.05, grade);
  }

  applyFinish(ctx, W, H);

  // Outer poster frame.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(6, Math.min(W, H) * 0.008);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  ctx.strokeStyle = grade.dot;
  ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.002);
  ctx.strokeRect(Math.min(W, H) * 0.018, Math.min(W, H) * 0.018, W - Math.min(W, H) * 0.036, H - Math.min(W, H) * 0.036);
  ctx.restore();
}
