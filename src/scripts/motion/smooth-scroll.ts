import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/** Matches `scroll-padding-top` (fixed nav height + gap). */
const ANCHOR_OFFSET = -96;

/**
 * Lenis wraps native scroll; driving it from gsap.ticker keeps ScrollTrigger
 * scrub animations frame-accurate instead of fighting a second rAF loop.
 */
export function initSmoothScroll(): Lenis {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    anchors: { offset: ANCHOR_OFFSET },
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    // Keep native touch scrolling; Lenis easing on touch feels laggy on phones.
    syncTouch: false,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
