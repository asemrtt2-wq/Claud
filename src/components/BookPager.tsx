"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type BookPagerHandle = {
  next: () => void;
  prev: () => void;
};

const GAP = 56;
const TURN_MS = 380;

/**
 * Apple-Books-style pagination: the whole book text is flowed into CSS multi-columns sized
 * to the page box, so a "page" is exactly what fits on screen — never a fixed character
 * count that overflows and forces scrolling. Columns re-flow automatically when the
 * viewport, font size, line height or margins change.
 *
 * The rest of the app still tracks progress, highlights, chapters and bookmarks by the
 * canonical page index from paginateContent(). Each canonical page is wrapped in a
 * [data-cpage] anchor, and after layout we read each anchor's offsetLeft to build an exact
 * two-way map between canonical pages and rendered columns — so nothing downstream has to
 * care that the visible pagination is device-dependent.
 */
const BookPager = forwardRef<
  BookPagerHandle,
  {
    pageCount: number;
    currentPage: number;
    onCanonicalChange: (page: number) => void;
    renderCanonicalPage: (index: number) => React.ReactNode;
    paperBg: string;
    paperText: string;
    contentClassName?: string;
    /** Bumped by the caller whenever a typography setting changes, to force a re-measure. */
    layoutKey: string;
    onTapCenter?: () => void;
    /** Fired when the reader turns past the last page. */
    onReachEnd?: () => void;
  }
>(function BookPager(
  {
    pageCount,
    currentPage,
    onCanonicalChange,
    renderCanonicalPage,
    paperBg,
    paperText,
    contentClassName,
    layoutKey,
    onTapCenter,
    onReachEnd,
  },
  ref
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const [box, setBox] = useState({ width: 0, height: 0 });
  const [spread, setSpread] = useState(1);
  const [columnCount, setColumnCount] = useState(1);
  /** box.height rounded down to a whole number of text lines — see the layout effect. */
  const [flowHeight, setFlowHeight] = useState(0);
  const [columnIndex, setColumnIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [animating, setAnimating] = useState(true);

  // Column index each canonical page starts in; rebuilt after every layout pass.
  const canonicalCols = useRef<number[]>([]);

  const pageWidth = spread === 2 ? (box.width - GAP) / 2 : box.width;
  const step = pageWidth + GAP;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setBox({ width: rect.width, height: rect.height });
      setSpread(rect.width >= 900 ? 2 : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // After the text re-flows, recount columns and rebuild the canonical page → column map.
  useLayoutEffect(() => {
    const flow = flowRef.current;
    if (!flow || pageWidth <= 0) return;

    /* Snap the column box to a whole number of lines. A column whose height isn't an exact
       multiple of the line box leaves a partial line at the bottom, and the browser renders
       its top half then clips it — the sliced-off last line that made pages look broken. */
    const lineHeight = parseFloat(window.getComputedStyle(flow).lineHeight);
    const snapped =
      Number.isFinite(lineHeight) && lineHeight > 0
        ? Math.max(lineHeight, Math.floor(box.height / lineHeight) * lineHeight)
        : box.height;
    setFlowHeight(snapped);

    const total = Math.max(1, Math.round((flow.scrollWidth + GAP) / step));
    setColumnCount(total);

    const cols: number[] = [];
    for (let i = 0; i < pageCount; i += 1) {
      const anchor = flow.querySelector<HTMLElement>(`[data-cpage="${i}"]`);
      cols[i] = anchor ? Math.max(0, Math.round(anchor.offsetLeft / step)) : cols[i - 1] ?? 0;
    }
    canonicalCols.current = cols;

    // Keep the reader on the page it was on when the layout changes under it.
    const target = cols[currentPage] ?? 0;
    setAnimating(false);
    setColumnIndex(Math.min(target - (target % spread), Math.max(0, total - spread)));
    // flowHeight is in the deps so the column count is recounted once the snapped height has
    // actually been applied; it is derived from box.height, so the second pass is a no-op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey, pageWidth, box.height, flowHeight, spread, pageCount]);

  useEffect(() => {
    if (!animating) {
      const id = requestAnimationFrame(() => setAnimating(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animating]);

  const canonicalAt = useCallback((col: number) => {
    const cols = canonicalCols.current;
    let page = 0;
    for (let i = 0; i < cols.length; i += 1) {
      if (cols[i] <= col) page = i;
      else break;
    }
    return page;
  }, []);

  // Jump when something outside (chapter link, search hit, bookmark) moves the page.
  useEffect(() => {
    const target = canonicalCols.current[currentPage];
    if (target === undefined) return;
    const aligned = Math.min(target - (target % spread), Math.max(0, columnCount - spread));
    if (canonicalAt(columnIndex) === currentPage) return;
    setColumnIndex(aligned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const maxIndex = Math.max(0, columnCount - spread);
  /**
   * Every user-initiated turn goes through here, and this is the only place that reports a
   * page change upward. Doing it in an effect on columnIndex instead would also fire for
   * layout-driven moves — including the one on mount, which raced ahead of the measured
   * columns and reported page 0, wiping the reader's saved position.
   */
  const goTo = useCallback(
    (index: number) => {
      if (index > maxIndex && columnIndex >= maxIndex) {
        onReachEnd?.();
        return;
      }
      const next = Math.min(Math.max(index, 0), maxIndex);
      if (next === columnIndex) return;
      setColumnIndex(next);
      const page = canonicalAt(next);
      if (page !== currentPage) onCanonicalChange(page);
    },
    [maxIndex, columnIndex, onReachEnd, canonicalAt, currentPage, onCanonicalChange]
  );

  useImperativeHandle(ref, () => ({
    next: () => goTo(columnIndex + spread),
    prev: () => goTo(columnIndex - spread),
  }));

  // Drag / swipe, unified across mouse and touch.
  const dragState = useRef<{ x: number; active: boolean }>({ x: 0, active: false });

  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("a,button")) return;
    // A live text selection means the reader is highlighting, not turning a page.
    if (!window.getSelection()?.isCollapsed) return;
    dragState.current = { x: e.clientX, active: true };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current.active) return;
    let dx = e.clientX - dragState.current.x;
    // Past the first or last page there is nothing to reveal, so the drag goes rubbery
    // instead of pulling blank paper across the screen.
    const atStart = columnIndex <= 0 && dx > 0;
    const atEnd = columnIndex >= maxIndex && dx < 0;
    if (atStart || atEnd) dx *= 0.25;
    if (Math.abs(dx) > 4) {
      setAnimating(false);
      setDrag(dx);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.x;
    dragState.current.active = false;
    setAnimating(true);
    setDrag(0);

    if (Math.abs(dx) > Math.min(90, pageWidth * 0.18)) {
      goTo(columnIndex + (dx < 0 ? spread : -spread));
      return;
    }
    if (Math.abs(dx) > 6) return;

    // A tap: left third goes back, right third goes forward, the middle toggles the chrome.
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.28) goTo(columnIndex - spread);
    else if (x > rect.width * 0.72) goTo(columnIndex + spread);
    else onTapCenter?.();
  }

  const flowStyle = useMemo<React.CSSProperties>(
    () => ({
      height: flowHeight ? `${flowHeight}px` : box.height ? `${box.height}px` : undefined,
      width: box.width ? `${box.width}px` : undefined,
      columnWidth: pageWidth > 0 ? `${pageWidth}px` : undefined,
      columnGap: `${GAP}px`,
      columnFill: "auto",
      color: paperText,
      transform: `translateX(${-columnIndex * step + drag}px)`,
      transition: animating ? `transform ${TURN_MS}ms cubic-bezier(0.22,0.61,0.36,1)` : "none",
    }),
    [box.height, box.width, flowHeight, pageWidth, paperText, columnIndex, step, drag, animating]
  );

  const pageNumber = columnIndex + 1;

  return (
    <div className="relative flex h-full w-full items-stretch justify-center">
      <div
        className="relative h-full w-full overflow-hidden rounded-[20px] px-7 pb-9 pt-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:px-12 sm:pb-10 sm:pt-10"
        style={{
          background: paperBg,
          maxWidth: 1180,
          // A page always fits, so there is nothing here to scroll: let the browser hand us
          // every touch instead of stealing horizontal swipes for a scroll it can't perform.
          touchAction: "none",
          overscrollBehavior: "contain",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragState.current.active = false;
          setDrag(0);
        }}
      >
        {/* Measured separately from the padded frame so the columns are sized to the text
            area itself, not the paper edge. */}
        <div ref={viewportRef} className="h-full w-full overflow-hidden">
          <div ref={flowRef} className={`relative ${contentClassName ?? ""}`} style={flowStyle}>
            {Array.from({ length: pageCount }, (_, i) => (
              <div key={i} data-cpage={i}>
                {renderCanonicalPage(i)}
              </div>
            ))}
          </div>
        </div>

        {/* A soft shadow follows the edge the reader is pulling, so a drag reads as paper
            lifting rather than a panel sliding. */}
        {drag !== 0 && (
          <div
            className="pointer-events-none absolute inset-y-0 w-24"
            style={{
              [drag < 0 ? "right" : "left"]: 0,
              opacity: Math.min(0.5, Math.abs(drag) / (pageWidth || 1)),
              background: `linear-gradient(to ${drag < 0 ? "left" : "right"}, rgba(0,0,0,0.28), transparent)`,
            }}
          />
        )}

        {/* Centre spine, only on the two-page spread */}
        {spread === 2 && (
          <>
            <div className="pointer-events-none absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-black/10" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06),transparent_70%)]" />
          </>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[0.7rem] tracking-wide"
          style={{ color: paperText, opacity: 0.4 }}
        >
          {spread === 2 && columnIndex + 1 < columnCount
            ? `${pageNumber}–${Math.min(pageNumber + 1, columnCount)} / ${columnCount}`
            : `${Math.min(pageNumber, columnCount)} / ${columnCount}`}
        </div>
      </div>
    </div>
  );
});

export default BookPager;
