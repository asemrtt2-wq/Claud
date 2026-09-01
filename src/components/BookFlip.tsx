"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type BookFlipHandle = {
  next: () => void;
  prev: () => void;
};

type FlipState = {
  dir: "forward" | "backward";
  slot: "left" | "right";
  angle: number;
  animating: boolean;
  frontIndex: number;
  backIndex: number;
  targetIndex: number;
};

function shadowOpacity(angle: number) {
  const a = Math.min(1, Math.abs(angle) / 180);
  return Math.sin(a * Math.PI) * 0.38;
}

const BookFlip = forwardRef<
  BookFlipHandle,
  {
    pageCount: number;
    currentIndex: number;
    onCommit: (nextIndex: number) => void;
    renderPage: (index: number) => ReactNode;
    paperBg: string;
    paperText: string;
  }
>(function BookFlip({ pageCount, currentIndex, onCommit, renderPage, paperBg, paperText }, ref) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number } | null>(null);
  const commitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setFlip(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  useEffect(() => {
    return () => {
      if (commitTimeout.current) clearTimeout(commitTimeout.current);
    };
  }, []);

  const stride = isDesktop ? 2 : 1;

  function beginFlip(dir: "forward" | "backward"): FlipState | null {
    if (dir === "forward") {
      if (currentIndex >= pageCount - 1) return null;
      const targetIndex = Math.min(pageCount - 1, currentIndex + stride);
      return {
        dir,
        slot: "right",
        angle: 0,
        animating: false,
        frontIndex: isDesktop ? currentIndex + 1 : currentIndex,
        backIndex: targetIndex,
        targetIndex,
      };
    }
    if (currentIndex <= 0) return null;
    const targetIndex = Math.max(0, currentIndex - stride);
    return {
      dir,
      slot: "left",
      angle: 0,
      animating: false,
      frontIndex: currentIndex,
      backIndex: isDesktop ? targetIndex + 1 : targetIndex,
      targetIndex,
    };
  }

  function finishFlip(f: FlipState, commit: boolean) {
    const targetAngle = commit ? (f.slot === "right" ? -180 : 180) : 0;
    setFlip({ ...f, angle: targetAngle, animating: true });
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    commitTimeout.current = setTimeout(() => {
      if (commit) onCommit(f.targetIndex);
      setFlip(null);
    }, 640);
  }

  useImperativeHandle(ref, () => ({
    next: () => {
      if (flip) return;
      const started = beginFlip("forward");
      if (!started) return;
      setFlip(started);
      requestAnimationFrame(() => finishFlip(started, true));
    },
    prev: () => {
      if (flip) return;
      const started = beginFlip("backward");
      if (!started) return;
      setFlip(started);
      requestAnimationFrame(() => finishFlip(started, true));
    },
  }));

  function handlePointerDown(e: React.PointerEvent) {
    if (flip?.animating) return;
    dragRef.current = { startX: e.clientX };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const ds = dragRef.current;
    if (!ds) return;
    const deltaX = e.clientX - ds.startX;
    if (Math.abs(deltaX) < 4) return;
    const dir: "forward" | "backward" = deltaX < 0 ? "forward" : "backward";

    if (!flip) {
      const started = beginFlip(dir);
      if (!started) return;
      setFlip(started);
      return;
    }
    if (flip.animating || flip.dir !== dir) return;

    const width = (containerRef.current?.clientWidth ?? 600) * (isDesktop ? 0.5 : 1);
    const raw = (deltaX / width) * 180;
    const angle = dir === "forward" ? Math.max(-180, Math.min(0, raw)) : Math.min(180, Math.max(0, raw));
    setFlip((f) => (f ? { ...f, angle, animating: false } : f));
  }

  function handlePointerUp() {
    const wasDragging = dragRef.current !== null;
    dragRef.current = null;
    if (!wasDragging || !flip || flip.animating) return;
    finishFlip(flip, Math.abs(flip.angle) > 70);
  }

  function pageOrBlank(index: number) {
    if (index < 0 || index >= pageCount) return <div className="h-full w-full" />;
    return renderPage(index);
  }

  // On mobile there's only one slot, and the flip layer fully occludes it at
  // rest — so as it peels away it must reveal the upcoming page, not a
  // duplicate of the current one (which is what the desktop split avoids by
  // only swapping the slot the flip doesn't cover).
  const staticLeftIndex = !isDesktop
    ? flip
      ? flip.targetIndex
      : currentIndex
    : flip && flip.dir === "backward"
      ? flip.targetIndex
      : currentIndex;
  const staticRightIndex = flip && flip.dir === "forward" ? flip.targetIndex + 1 : currentIndex + 1;

  return (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <div
        className="relative h-full"
        style={{ perspective: "2200px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* soft shadow beneath the book */}
        <div
          className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-[80%] -translate-x-1/2 rounded-full blur-2xl"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
        <div
          ref={containerRef}
          className="relative flex touch-pan-y select-none"
          style={{
            width: isDesktop ? "min(1000px, 88vw)" : "min(480px, 90vw)",
            // Fills the reader's page area (the parent is a flex row of definite height)
            // so the book reads full-screen like Apple Books instead of floating in it.
            height: "100%",
            maxHeight: "860px",
          }}
        >
          {/* LEFT PAGE (static) */}
          <div
            className="relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
            style={{
              width: isDesktop ? "50%" : "100%",
              height: "100%",
              background: paperBg,
              color: paperText,
              borderRadius: isDesktop ? "18px 0 0 18px" : "18px",
            }}
          >
            <div className="h-full overflow-y-auto p-7 sm:p-10">{pageOrBlank(staticLeftIndex)}</div>
            {isDesktop && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent" />
            )}
          </div>

          {isDesktop && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-px -translate-x-1/2 bg-black/15" />
              {/* RIGHT PAGE (static) */}
              <div
                className="relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
                style={{
                  width: "50%",
                  height: "100%",
                  background: paperBg,
                  color: paperText,
                  borderRadius: "0 18px 18px 0",
                }}
              >
                <div className="h-full overflow-y-auto p-7 sm:p-10">{pageOrBlank(staticRightIndex)}</div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent" />
              </div>
            </>
          )}

          {flip && (
            <div
              className="absolute inset-y-0 z-40"
              style={{
                left: flip.slot === "right" ? (isDesktop ? "50%" : 0) : 0,
                width: isDesktop ? "50%" : "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transformOrigin: flip.slot === "right" ? "left center" : "right center",
                transform: `rotateY(${flip.angle}deg)`,
                transition: flip.animating ? "transform 640ms cubic-bezier(0.45, 0, 0.2, 1)" : "none",
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden shadow-2xl"
                style={{
                  backfaceVisibility: "hidden",
                  background: paperBg,
                  color: paperText,
                  borderRadius: isDesktop
                    ? flip.slot === "right"
                      ? "0 18px 18px 0"
                      : "18px 0 0 18px"
                    : "18px",
                }}
              >
                <div className="h-full overflow-y-auto p-7 sm:p-10">{pageOrBlank(flip.frontIndex)}</div>
              </div>
              <div
                className="absolute inset-0 overflow-hidden shadow-2xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: paperBg,
                  color: paperText,
                  borderRadius: isDesktop
                    ? flip.slot === "right"
                      ? "18px 0 0 18px"
                      : "0 18px 18px 0"
                    : "18px",
                }}
              >
                <div className="h-full overflow-y-auto p-7 sm:p-10">{pageOrBlank(flip.backIndex)}</div>
              </div>
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(${
                    flip.slot === "right" ? "to left" : "to right"
                  }, rgba(0,0,0,${shadowOpacity(flip.angle)}), transparent 60%)`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default BookFlip;
