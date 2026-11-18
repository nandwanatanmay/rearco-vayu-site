import { useCallback, useEffect, useRef, useState } from 'react';

export interface View {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.2;
const MAX_K = 8;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Pan & zoom for an SVG viewport.
 * - Mouse wheel / trackpad zoom anchored at the cursor
 * - Drag to pan (pointer events, so mouse, pen and touch all work)
 * - Two-finger pinch zoom on touch screens
 * - `animate` flag lets the consumer apply a CSS transition for button-driven moves
 */
export function usePanZoom(contentW: number, contentH: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [animate, setAnimate] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const moved = useRef(0);

  /** Compute the view that fits the whole plan in the container with a margin. */
  const fitView = useCallback((): View => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0, k: 1 };
    const { width, height } = el.getBoundingClientRect();
    const pad = Math.min(48, width * 0.05);
    const k = clamp(Math.min((width - pad * 2) / contentW, (height - pad * 2) / contentH), MIN_K, MAX_K);
    return { k, x: (width - contentW * k) / 2, y: (height - contentH * k) / 2 };
  }, [contentW, contentH]);

  const go = useCallback((v: View | ((p: View) => View), smooth = true) => {
    setAnimate(smooth);
    setView(v);
  }, []);

  const fit = useCallback(() => go(fitView()), [go, fitView]);

  /** Zoom by factor `f` around a point in container coordinates (defaults to centre). */
  const zoomBy = useCallback(
    (f: number, cx?: number, cy?: number, smooth = true) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = cx ?? r.width / 2;
      const py = cy ?? r.height / 2;
      go((p) => {
        const k = clamp(p.k * f, MIN_K, MAX_K);
        const s = k / p.k;
        return { k, x: px - (px - p.x) * s, y: py - (py - p.y) * s };
      }, smooth);
    },
    [go],
  );

  /** Centre the given plan-space rectangle, zooming so it fills ~60% of the viewport. */
  const focusRect = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const k = clamp(Math.min((r.width * 0.6) / w, (r.height * 0.6) / h), MIN_K, 3);
      go({ k, x: r.width / 2 - (x + w / 2) * k, y: r.height / 2 - (y + h / 2) * k });
    },
    [go],
  );

  // Fit on mount, when the plan changes size, and when the container resizes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setAnimate(false);
    setView(fitView());
    const ro = new ResizeObserver(() => {
      setAnimate(false);
      setView(fitView());
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitView]);

  // Wheel zoom (non-passive so we can preventDefault page scroll).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomBy(Math.exp(-dy * 0.0015), e.clientX - r.left, e.clientY - r.top, false);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // Pointer capture is deferred until the pointer actually moves (see onPointerMove);
    // capturing immediately would retarget the click away from the room under the cursor.
    moved.current = 0;
    last.current = centroid();
    setDragging(true);
    setAnimate(false);
  };

  const centroid = () => {
    const pts = [...pointers.current.values()];
    const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : undefined;
    return { x, y, dist };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const c = centroid();
    const prev = last.current;
    if (!prev) return;
    const dx = c.x - prev.x;
    const dy = c.y - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    if (moved.current > 5) {
      const el0 = e.currentTarget as Element;
      if (!el0.hasPointerCapture?.(e.pointerId)) el0.setPointerCapture?.(e.pointerId);
    }
    const el = containerRef.current!;
    const r = el.getBoundingClientRect();
    setView((p) => {
      let { x, y, k } = p;
      x += dx;
      y += dy;
      if (c.dist && prev.dist) {
        const nk = clamp(k * (c.dist / prev.dist), MIN_K, MAX_K);
        const s = nk / k;
        const px = c.x - r.left;
        const py = c.y - r.top;
        x = px - (px - x) * s;
        y = py - (py - y) * s;
        k = nk;
      }
      return { x, y, k };
    });
    last.current = c;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    last.current = pointers.current.size ? centroid() : null;
    if (!pointers.current.size) setDragging(false);
  };

  /** True if the last pointer gesture moved enough to count as a drag (suppresses click). */
  const wasDrag = () => moved.current > 5;

  return {
    containerRef,
    view,
    animate,
    dragging,
    fit,
    zoomBy,
    focusRect,
    wasDrag,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
