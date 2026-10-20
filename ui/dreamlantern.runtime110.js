/* DreamLantern runtime110 — presentation renderer only. No MVU/worldbook writes. */
(() => {
  'use strict';

  const DEFAULT_BASE = 'https://cdn.jsdelivr.net/gh/3086013261qq-hue/DreamLantern-Media@main/';
  const cache = new Map();
  const q = (root, sel) => root?.matches?.(sel) ? root : root?.querySelector?.(sel);

  async function getJSON(path, base = DEFAULT_BASE) {
    const url = /^https?:\/\//i.test(path) ? path : base + path.replace(/^\/+/, '');
    if (cache.has(url)) return cache.get(url);
    const p = fetch(url, { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error(`DreamLantern110 ${r.status}: ${url}`);
      return r.json();
    });
    cache.set(url, p);
    return p;
  }

  function seedFrom(text = '') {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function rng(seed) {
    let s = seed || 1;
    return () => ((s = Math.imul(48271, s) % 2147483647) & 2147483647) / 2147483647;
  }
  function el(tag, cls, attrs = {}) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    Object.entries(attrs).forEach(([k, v]) => v != null && n.setAttribute(k, String(v)));
    return n;
  }

  function resolveSources(imgManifest) {
    const out = [];
    const push = item => {
      const url = item?.url || item?.path;
      if (!url || out.some(x => x.url === url)) return;
      out.push({ url, key: item.key || '', position: item.objectPosition || item.position || '50% 50%' });
    };
    (imgManifest?.primary || []).forEach(push);
    (imgManifest?.secondary || []).forEach(push);
    return out;
  }

  function clearRuntime(opening) {
    opening?.querySelectorAll?.('.dl-110-montage,.dl-110-fx,.dl-110-extra').forEach(n => n.remove());
    if (opening) {
      delete opening.dataset.dlFxMounted;
      delete opening.dataset.dlFxProfile;
      delete opening.dataset.dlMontageCount;
    }
  }

  function mountMontage(opening, sources, base = DEFAULT_BASE) {
    if (!opening || !sources?.length) return 0;
    const primary = q(opening, '.dl-poster');
    const wrap = el('div', 'dl-110-montage', { 'aria-hidden': 'true' });
    const usable = sources.slice(0, 4);

    usable.forEach((src, i) => {
      const img = el('img', 'dl-110-shot');
      img.alt = '';
      img.decoding = 'async';
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.src = /^https?:\/\//i.test(src.url) ? src.url : base + src.url.replace(/^\/+/, '');
      img.style.objectPosition = src.position || '50% 50%';
      img.style.setProperty('--dl-shot-index', i);
      img.style.setProperty('--dl-shot-count', usable.length);
      wrap.appendChild(img);
    });

    // A single official still still gets a real camera pass; multiple stills crossfade as a montage.
    wrap.classList.toggle('dl-110-single', usable.length === 1);
    opening.insertBefore(wrap, opening.firstChild);
    if (primary) primary.style.opacity = '0';
    opening.dataset.dlMontageCount = String(usable.length);
    return usable.length;
  }

  function mountFx(opening, profile, chapterId) {
    if (!opening || !profile) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    opening.dataset.dlFxProfile = profile.__name || '';
    opening.dataset.dlFxMounted = reduce ? 'reduced' : '1';
    if (reduce) return;

    const r = rng(seedFrom(chapterId + ':' + (profile.__name || 'fx')));
    const layer = el('div', 'dl-110-fx dl-fx', { 'aria-hidden': 'true' });
    const extras = Array.isArray(profile.extra) ? profile.extra : [];
    layer.dataset.extra = extras.join(' ');

    const count = (kind, n) => {
      for (let i = 0; i < Math.max(0, n || 0); i++) {
        const node = el('i', `dl-${kind}`);
        node.style.setProperty('--x', `${8 + r() * 84}%`);
        node.style.setProperty('--y', `${12 + r() * 72}%`);
        node.style.setProperty('--t', `${8 + r() * 8}s`);
        node.style.setProperty('--delay', `${-r() * 8}s`);
        layer.appendChild(node);
      }
    };

    count('thread', profile.redLines);
    count('fox-glow', profile.foxfire);
    count('petal', profile.petals);
    count('mote', profile.dust);

    const extra = el('div', 'dl-110-extra');
    extra.dataset.extra = extras.join(' ');
    if (extras.includes('thin_gold_slash')) extra.classList.add('dl-110-sword-flash');
    if (extras.some(x => /shimmer|light_sweep|water_light|mirror_refraction/.test(x))) extra.classList.add('dl-110-extra-motion');

    opening.appendChild(layer);
    opening.appendChild(extra);
  }

  function mountMirrors(root) {
    const doors = q(root, '.dl-doors');
    if (!doors || doors.dataset.dlMirrorsMounted === '1') return;
    doors.classList.add('dl-110-mirrors');
    [...doors.querySelectorAll('.dl-door')].forEach((door, i) => {
      door.classList.add('dl-110-mirror');
      door.dataset.mirror = door.dataset.era || (i ? 'modern' : 'ancient');
      if (!door.querySelector('.dl-110-mirror-glass')) {
        const glass = el('span', 'dl-110-mirror-glass', { 'aria-hidden': 'true' });
        const glint = el('span', 'dl-110-mirror-glint', { 'aria-hidden': 'true' });
        door.prepend(glass, glint);
      }
    });
    const thread = el('i', 'dl-110-mirror-thread', { 'aria-hidden': 'true' });
    doors.appendChild(thread);
    doors.dataset.dlMirrorsMounted = '1';
  }

  async function mountOpening(root, chapterId, options = {}) {
    const opening = q(root, '.dl-opening');
    if (!opening || !chapterId) return { ok: false, reason: 'missing_opening_or_chapter' };
    clearRuntime(opening);
    const base = options.assetBase || DEFAULT_BASE;

    try {
      const [runtime, fxIndex, chapterIndex] = await Promise.all([
        options.dynamicRuntime || getJSON('manifest/dynamic-runtime.v1.json', base),
        options.fxProfiles || getJSON('manifest/fx-profiles.v1.json', base),
        options.chapterRuntime || getJSON('manifest/chapter-runtime.v2.json', base),
      ]);
      const spec = runtime?.chapters?.[chapterId];
      const chapter = chapterIndex?.chapters?.[chapterId];
      if (!spec || !chapter) throw new Error(`unknown chapter ${chapterId}`);

      const imageManifest = options.imageManifest || await getJSON(chapter.images, base);
      const sources = resolveSources(imageManifest);
      mountMontage(opening, sources, base);

      const profile = { ...(fxIndex?.profiles?.[spec.fxProfile] || {}) };
      profile.__name = spec.fxProfile;
      const baseFx = fxIndex?.base || {};
      opening.style.setProperty('--dl-110-cycle', `${baseFx.cycleSeconds || 12}s`);
      opening.style.setProperty('--dl-110-zoom-from', baseFx.zoomFrom ?? 1);
      opening.style.setProperty('--dl-110-zoom-to', baseFx.zoomTo ?? 1.035);
      opening.style.setProperty('--dl-110-pan', `${baseFx.panPercent ?? 1.2}%`);
      mountFx(opening, profile, chapterId);

      return { ok: true, chapterId, profile: spec.fxProfile, shots: sources.length, reducedMotion: opening.dataset.dlFxMounted === 'reduced' };
    } catch (error) {
      console.error('[DreamLantern110] mountOpening failed', error);
      opening.dataset.dlFxMounted = 'error';
      return { ok: false, reason: String(error?.message || error) };
    }
  }

  function dispose(root) {
    const opening = q(root, '.dl-opening');
    clearRuntime(opening);
    const doors = q(root, '.dl-doors');
    if (doors) {
      doors.querySelectorAll('.dl-110-mirror-glass,.dl-110-mirror-glint,.dl-110-mirror-thread').forEach(n => n.remove());
      doors.classList.remove('dl-110-mirrors');
      delete doors.dataset.dlMirrorsMounted;
    }
  }

  window.DreamLanternRuntime110 = Object.freeze({ mountOpening, mountMirrors, dispose, clearRuntime });
})();
