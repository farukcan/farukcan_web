import gsap from "gsap";
import type { Cleanup, MotionEnv } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Desktop: pin the featured section and scrub the track horizontally.
 * Mobile: native scroll-snap; we only keep the index / progress bar in sync.
 */
export function initFeatured(env: MotionEnv): Cleanup {
  const root = document.querySelector<HTMLElement>("[data-featured]");
  if (!root) return;

  const viewport = root.querySelector<HTMLElement>("[data-featured-viewport]");
  const track = root.querySelector<HTMLElement>("[data-featured-track]");
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("[data-featured-card]"),
  );
  const covers = root.querySelectorAll<HTMLElement>("[data-featured-cover]");
  const indexEl = root.querySelector<HTMLElement>("[data-featured-index]");
  const progressEl = root.querySelector<HTMLElement>("[data-featured-progress]");
  if (!viewport || !track || !cards.length) return;

  const total = cards.length;
  let lastIndex = 1;

  const setIndex = (index: number, progress: number) => {
    const next = Math.min(total, Math.max(1, index));
    if (indexEl && next !== lastIndex) {
      lastIndex = next;
      indexEl.textContent = pad(next);
    }
    if (progressEl) gsap.set(progressEl, { scaleX: progress });
  };

  const indexFromProgress = (progress: number) =>
    Math.round(progress * Math.max(total - 1, 1)) + 1;

  if (!env.desktop) {
    const updateFromScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const progress = max > 0 ? viewport.scrollLeft / max : 0;
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const mid = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setIndex(best + 1, progress);
    };

    viewport.addEventListener("scroll", updateFromScroll, { passive: true });
    updateFromScroll();
    return () => viewport.removeEventListener("scroll", updateFromScroll);
  }

  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top 88px",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => setIndex(indexFromProgress(self.progress), self.progress),
    },
  });

  tl.to(track, { x: () => -distance() }, 0);
  if (covers.length) {
    tl.fromTo(covers, { xPercent: -8 }, { xPercent: 8 }, 0);
  }
}
