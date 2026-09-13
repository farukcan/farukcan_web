import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { initSmoothScroll } from "./smooth-scroll";
import { initNav } from "./nav";
import { initHeroIntro, initHeroScroll } from "./hero";
import { initTextReveal } from "./text-reveal";
import { initSections } from "./sections";
import { initFeatured } from "./featured";
import { initMarquee } from "./marquee";
import { initPointer } from "./pointer";
import type { Cleanup, MotionEnv } from "./types";

const html = document.documentElement;

/** Drop the `js` opt-in so CSS shows every motion target in its final state. */
function disableMotion() {
  html.classList.remove("js");
}

function boot() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    disableMotion();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Mobile address-bar show/hide fires resize; recomputing every pin is wasteful.
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = initSmoothScroll();
  window.addEventListener("motion:lock", () => lenis.stop());
  window.addEventListener("motion:unlock", () => lenis.start());

  // Runs once; lives outside matchMedia so breakpoint changes never replay it.
  initHeroIntro();

  const mm = gsap.matchMedia();
  mm.add(
    {
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      fine: "(pointer: fine)",
    },
    (ctx) => {
      const c = (ctx.conditions ?? {}) as Record<string, boolean>;
      const env: MotionEnv = { desktop: !!c.desktop, fine: !!c.fine };

      const cleanups: Cleanup[] = [
        initNav(lenis, env),
        initHeroScroll(env),
        initTextReveal(env),
        initSections(),
        initFeatured(env),
        initMarquee(),
        env.fine ? initPointer() : undefined,
      ];

      return () => cleanups.forEach((fn) => fn?.());
    },
  );

  const refresh = () => ScrollTrigger.refresh();
  // Fired by components after they change layout (project filters, load more).
  window.addEventListener("motion:refresh", refresh);
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
  html.dataset.motionReady = "";
}

try {
  boot();
} catch (error) {
  console.error("[motion] init failed, falling back to static content", error);
  disableMotion();
}
