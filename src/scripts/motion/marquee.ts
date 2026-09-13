import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cleanup } from "./types";

/** How strongly scroll velocity boosts / reverses the base speed. */
const VELOCITY_GAIN = 0.0018;
const MAX_SCALE = 3.5;

/**
 * Endless horizontal loops. Every row tweens `0 → -50`; `data-direction` (±1)
 * is the rest `timeScale` so reverse rows don't get flipped twice.
 * Scroll velocity scales speed and can invert the flow; it eases back to rest.
 */
export function initMarquee(): Cleanup {
  const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-marquee]"));
  if (!rows.length) return;

  const tweens = rows.map((row) => {
    const dir = Number(row.dataset.direction) || 1;
    const duration = Number(row.dataset.duration) || 60;
    const phase = Number(row.dataset.phase) || 0;

    const tween = gsap.fromTo(
      row,
      { xPercent: 0 },
      { xPercent: -50, duration, ease: "none", repeat: -1 },
    );
    tween.progress(phase);
    tween.timeScale(dir);
    return { tween, rest: dir };
  });

  const st = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const boost = gsap.utils.clamp(
        -MAX_SCALE,
        MAX_SCALE,
        self.getVelocity() * VELOCITY_GAIN,
      );
      for (const { tween, rest } of tweens) {
        gsap.to(tween, {
          timeScale: rest + boost,
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
        });
      }
    },
  });

  const idle = () => {
    for (const { tween, rest } of tweens) {
      gsap.to(tween, { timeScale: rest, duration: 1.2, ease: "power3.out" });
    }
  };
  let idleTimer = 0;
  const onScroll = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(idle, 180);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(idleTimer);
    st.kill();
    tweens.forEach(({ tween }) => tween.kill());
  };
}
