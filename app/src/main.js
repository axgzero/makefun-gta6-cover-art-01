// Vice Coast Cover Studio — editor wiring.
// Owns the state, the controls, panel picking / dragging / zooming, the
// sample photos, undo + redo, and the PNG export. The art itself lives in
// cover.js (drawCover); this file only drives it.

import { LAYOUTS, GRADES, SIZES, layoutById, gradeById, sizeById, drawCover } from './cover.js';

const SAMPLES = {
  boulevard: './samples/sample-boulevard.jpg',
  rooftop: './samples/sample-rooftop.jpg',
  neon: './samples/sample-neon.jpg',
};

const TITLES = ['VICE COAST', 'NEON SHORE', 'PALM HEIST', 'SUNSET RUN', 'NIGHT SHIFT', 'PIER PRESSURE'];
const SUBTITLES = ['neon nights · palm dreams', 'golden hour, every hour', 'drive fast · shine brighter', 'the city never sleeps', 'salt air and street lights'];

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

const photos = new Map(); // key -> HTMLImageElement
let uploadCount = 0;
let selected = 0;
let drag = null;

function blankPanel(photo) {
  return { photo, zoom: 1, ox: 0, oy: 0, flip: false };
}

function defaultState() {
  return {
    layout: 'hero',
    grade: 'vice-sunset',
    size: 'square',
    title: 'VICE COAST',
    subtitle: 'neon nights · palm dreams',
    badge: 'EST. 2026',
    titleStyle: 'sunset',
    panels: [blankPanel('boulevard'), blankPanel('rooftop'), blankPanel('neon'), blankPanel('boulevard')],
  };
}

let state = defaultState();
const undoStack = [];
const redoStack = [];

function snapshot() {
  return JSON.parse(JSON.stringify(state));
}
function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
  syncUndoButtons();
}
function applySnapshot(snap) {
  state = JSON.parse(JSON.stringify(snap));
  syncControls();
  render();
}
function syncUndoButtons() {
  $('undoBtn').disabled = undoStack.length === 0;
  $('redoBtn').disabled = redoStack.length === 0;
}

function panelCount() {
  return layoutById(state.layout).panels.length;
}
function ensurePanels() {
  while (state.panels.length < panelCount()) state.panels.push(blankPanel(state.panels[0]?.photo || 'boulevard'));
  state.panels.length = panelCount();
  if (selected >= panelCount()) selected = 0;
}

/** Redraw the live preview at the current export size, scaled by CSS. */
function render() {
  ensurePanels();
  const size = sizeById(state.size);
  if (preview.width !== size.w || preview.height !== size.h) {
    preview.width = size.w;
    preview.height = size.h;
  }
  drawCover(pctx, state, size.w, size.h, photos);
  $('exportBtn').textContent = `⬇ Export PNG — ${size.w} × ${size.h}`;
  const names = ['hero', 'top-left', 'top-right', 'middle', 'bottom-left', 'bottom-centre', 'bottom-right'];
  const label = layoutById(state.layout).panels.length > 1
    ? `Selected panel: ${selected + 1} of ${panelCount()} (${names[selected] || 'panel'}) — click any panel to pick it.`
    : 'Selected panel: the whole cover.';
  $('selectedLabel').textContent = label;
}

function loadPhoto(key, src) {
  return new Promise((resolve) => {
    if (photos.has(key)) return resolve(photos.get(key));
    const img = new Image();
    img.onload = () => { photos.set(key, img); resolve(img); };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadSamples() {
  await Promise.all(Object.entries(SAMPLES).map(([k, src]) => loadPhoto(k, src)));
}

function syncControls() {
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('badgeInput').value = state.badge;
  $('titleStyleSelect').value = state.titleStyle;
  const p = state.panels[selected] || blankPanel(null);
  $('zoomRange').value = Math.round((p.zoom || 1) * 100);
  $('zoomVal').textContent = `${Math.round((p.zoom || 1) * 100)}%`;
  $('panXRange').value = Math.round((p.ox || 0) * 100);
  $('panYRange').value = Math.round((p.oy || 0) * 100);
  document.querySelectorAll('#layoutChoices button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === state.layout)));
  document.querySelectorAll('#gradeChoices button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === state.grade)));
  document.querySelectorAll('#sizeChoices button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === state.size)));
}

function buildChoices() {
  const layoutBox = $('layoutChoices');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = l.id;
    b.textContent = l.name;
    b.setAttribute('aria-pressed', String(l.id === state.layout));
    b.addEventListener('click', () => { pushHistory(); state.layout = l.id; ensurePanels(); syncControls(); render(); });
    layoutBox.appendChild(b);
  });
  const gradeBox = $('gradeChoices');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = g.id;
    b.setAttribute('aria-pressed', String(g.id === state.grade));
    b.innerHTML = `<span class="swatch-dot" style="background:linear-gradient(135deg,${g.sky[0]},${g.sky[1]})"></span>${g.name}`;
    b.addEventListener('click', () => { pushHistory(); state.grade = g.id; syncControls(); render(); });
    gradeBox.appendChild(b);
  });
  const sizeBox = $('sizeChoices');
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = s.id;
    b.textContent = s.name;
    b.setAttribute('aria-pressed', String(s.id === state.size));
    b.addEventListener('click', () => { pushHistory(); state.size = s.id; syncControls(); render(); });
    sizeBox.appendChild(b);
  });
}

/** Which panel (if any) sits under a point on the preview canvas. */
function hitPanel(clientX, clientY) {
  const r = preview.getBoundingClientRect();
  const px = ((clientX - r.left) / r.width) * preview.width;
  const py = ((clientY - r.top) / r.height) * preview.height;
  const panels = layoutById(state.layout).panels;
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (px >= p.x * preview.width && px <= (p.x + p.w) * preview.width
      && py >= p.y * preview.height && py <= (p.y + p.h) * preview.height) return i;
  }
  return -1;
}

function bindCanvas() {
  preview.addEventListener('pointerdown', (e) => {
    const hit = hitPanel(e.clientX, e.clientY);
    if (hit < 0) return;
    selected = hit;
    const p = state.panels[selected];
    drag = { x: e.clientX, y: e.clientY, ox: p.ox || 0, oy: p.oy || 0, moved: false };
    preview.setPointerCapture(e.pointerId);
    syncControls();
    render();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = preview.getBoundingClientRect();
    const p = state.panels[selected];
    const panel = layoutById(state.layout).panels[selected];
    const dx = (e.clientX - drag.x) / r.width / panel.w;
    const dy = (e.clientY - drag.y) / r.height / panel.h;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) drag.moved = true;
    p.ox = Math.max(-0.6, Math.min(0.6, drag.ox + dx));
    p.oy = Math.max(-0.6, Math.min(0.6, drag.oy + dy));
    $('panXRange').value = Math.round(p.ox * 100);
    $('panYRange').value = Math.round(p.oy * 100);
    render();
  });
  preview.addEventListener('pointerup', () => {
    if (drag && drag.moved) pushHistory();
    drag = null;
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = state.panels[selected];
    pushHistory();
    p.zoom = Math.max(1, Math.min(2.6, (p.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.93)));
    syncControls();
    render();
  }, { passive: false });
}

function bindControls() {
  $('photoInput').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const key = `upload-${++uploadCount}`;
    const url = URL.createObjectURL(file);
    await loadPhoto(key, url);
    pushHistory();
    state.panels[selected].photo = key;
    state.panels[selected].zoom = 1;
    state.panels[selected].ox = 0;
    state.panels[selected].oy = 0;
    syncControls();
    render();
    $('status').textContent = `Loaded ${file.name} into panel ${selected + 1}.`;
    e.target.value = '';
  });

  $('fillAllBtn').addEventListener('click', () => {
    const key = state.panels[selected]?.photo;
    if (!key) { $('status').textContent = 'Pick a photo for the selected panel first.'; return; }
    pushHistory();
    state.panels.forEach((p) => { p.photo = key; p.zoom = 1; p.ox = 0; p.oy = 0; });
    render();
    $('status').textContent = 'Every panel now uses that photo — crop each one differently if you like.';
  });

  $('samples').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-sample]');
    if (!btn) return;
    const key = btn.dataset.sample;
    await loadPhoto(key, SAMPLES[key]);
    pushHistory();
    state.panels[selected].photo = key;
    state.panels[selected].zoom = 1;
    state.panels[selected].ox = 0;
    state.panels[selected].oy = 0;
    syncControls();
    render();
    $('status').textContent = `Sample “${btn.textContent.trim()}” loaded into panel ${selected + 1}.`;
  });

  $('zoomRange').addEventListener('pointerdown', pushHistory);
  $('panXRange').addEventListener('pointerdown', pushHistory);
  $('panYRange').addEventListener('pointerdown', pushHistory);
  $('zoomRange').addEventListener('input', (e) => {
    const p = state.panels[selected];
    p.zoom = Number(e.target.value) / 100;
    $('zoomVal').textContent = `${e.target.value}%`;
    render();
  });
  $('panXRange').addEventListener('input', (e) => { state.panels[selected].ox = Number(e.target.value) / 100; render(); });
  $('panYRange').addEventListener('input', (e) => { state.panels[selected].oy = Number(e.target.value) / 100; render(); });

  $('resetPanelBtn').addEventListener('click', () => {
    pushHistory();
    Object.assign(state.panels[selected], { zoom: 1, ox: 0, oy: 0, flip: false });
    syncControls();
    render();
  });
  $('flipBtn').addEventListener('click', () => {
    pushHistory();
    const p = state.panels[selected];
    p.flip = !p.flip;
    render();
  });

  $('titleInput').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('titleInput').addEventListener('change', pushHistory);
  $('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('subtitleInput').addEventListener('change', pushHistory);
  $('badgeInput').addEventListener('input', (e) => { state.badge = e.target.value; render(); });
  $('badgeInput').addEventListener('change', pushHistory);
  $('titleStyleSelect').addEventListener('change', (e) => { pushHistory(); state.titleStyle = e.target.value; render(); });

  $('undoBtn').addEventListener('click', () => {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    applySnapshot(undoStack.pop());
    syncUndoButtons();
  });
  $('redoBtn').addEventListener('click', () => {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    applySnapshot(redoStack.pop());
    syncUndoButtons();
  });
  $('surpriseBtn').addEventListener('click', async () => {
    pushHistory();
    state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.title = TITLES[Math.floor(Math.random() * TITLES.length)];
    state.subtitle = SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)];
    ensurePanels();
    const keys = Object.keys(SAMPLES);
    state.panels.forEach((p, i) => { p.photo = keys[(i + Math.floor(Math.random() * 3)) % keys.length]; });
    await loadSamples();
    syncControls();
    render();
    $('status').textContent = `Surprise: ${layoutById(state.layout).name} layout, ${gradeById(state.grade).name} grade, “${state.title}”.`;
  });

  $('exportBtn').addEventListener('click', () => {
    const size = sizeById(state.size);
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off.getContext('2d'), state, size.w, size.h, photos);
    off.toBlob((blob) => {
      if (!blob) { $('status').textContent = 'Export failed in this browser — try again.'; return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vice-coast-cover-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      $('status').textContent = `Exported ${size.w} × ${size.h} PNG — check your downloads.`;
    }, 'image/png');
  });
}

/** Screenshot mode (?shot=cover | editor): renders a finished cover or a
 *  loaded editor with no interaction, for the entry's screenshots. */
function applyShotMode(params) {
  const shot = params.get('shot');
  if (!shot) return false;
  if (params.get('layout')) state.layout = params.get('layout');
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('size')) state.size = params.get('size');
  if (params.get('title')) state.title = params.get('title');
  if (params.get('subtitle')) state.subtitle = params.get('subtitle');
  if (params.get('badge')) state.badge = params.get('badge');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    document.title = `Vice Coast cover — ${state.title}`;
  }
  return true;
}

async function init() {
  buildChoices();
  bindCanvas();
  bindControls();
  const params = new URLSearchParams(location.search);
  applyShotMode(params);
  await loadSamples();
  // In shot mode, spread the samples across the panels so the cover shows
  // three different photos; in the editor the defaults already do.
  if (params.get('shot') === 'cover') {
    const keys = ['boulevard', 'rooftop', 'neon'];
    ensurePanels();
    state.panels.forEach((p, i) => { p.photo = keys[i % keys.length]; });
  }
  syncControls();
  syncUndoButtons();
  render();
  document.body.dataset.ready = 'ready';
}

init();
