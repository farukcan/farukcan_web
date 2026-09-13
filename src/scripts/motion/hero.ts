import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Cleanup, MotionEnv } from "./types";

const hero = () => document.querySelector<HTMLElement>("[data-hero]");

/**
 * One-shot page-load choreography. Targets [data-hero-item] children only;
 * initHeroScroll() animates the parent layers, so the two never share a property.
 */
export function initHeroIntro(): void {
  const root = hero();
  if (!root) return;

  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-item]"));
  const title = root.querySelector<HTMLElement>("[data-hero-title]");
  const tagline = root.querySelector<HTMLElement>("[data-hero-tagline]");
  const lower = root.querySelectorAll<HTMLElement>("[data-hero-lower] [data-hero-item]");
  const upper = items.filter(
    (el) => el !== title && el !== tagline && !el.closest("[data-hero-lower]"),
  );
  const [badge, ...ctaWrappers] = upper;

  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

  if (badge) {
    tl.fromTo(badge, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 });
  }

  if (title) {
    // Wipe instead of per-char split: keeps the gradient continuous across the headline.
    gsap.set(title, { autoAlpha: 1 });
    tl.fromTo(
      title,
      { clipPath: "inset(0% 0% 100% 0%)", y: 48 },
      { clipPath: "inset(0% 0% -20% 0%)", y: 0, duration: 1.2, clearProps: "clipPath" },
      "-=0.5",
    );
  }

  if (tagline) {
    const split = SplitText.create(tagline, { type: "words", mask: "words" });
    gsap.set(tagline, { autoAlpha: 1 });
    tl.from(split.words, { yPercent: 110, stagger: 0.025, duration: 0.7 }, "-=0.8");
  }

  if (ctaWrappers.length) {
    tl.fromTo(
      ctaWrappers,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8 },
      "-=0.5",
    );
  }

  if (lower.length) {
    tl.fromTo(
      lower,
      { y: 36, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.9 },
      "-=0.5",
    );
  }
}

/**
 * Scroll-linked "curtain": on desktop the hero is pinned (no spacer) while the
 * next sections slide over it; its layers drift apart at different speeds.
 */
export function initHeroScroll(env: MotionEnv): Cleanup {
  const root = hero();
  if (!root) return;

  const content = root.querySelector<HTMLElement>("[data-hero-content]");
  const lower = root.querySelector<HTMLElement>("[data-hero-lower]");
  const glowSlow = root.querySelector<HTMLElement>('[data-hero-glow="slow"]');
  const glowFast = root.querySelector<HTMLElement>('[data-hero-glow="fast"]');
  const grid = root.querySelector<HTMLElement>(".dot-grid");

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "bottom top",
      scrub: true,
      pin: env.desktop,
      pinSpacing: false,
      anticipatePin: 1,
    },
  });

  if (!env.desktop) {
    tl.to([content, lower], { y: -60, autoAlpha: 0.15, ease: "power1.in" }, 0);
    return;
  }

  tl.to(
    content,
    { y: -140, scale: 0.9, autoAlpha: 0, transformOrigin: "0% 0%", ease: "power1.in" },
    0,
  )
    .to(lower, { y: -280, autoAlpha: 0, ease: "power1.in" }, 0)
    .to(glowSlow, { y: -180, x: 140 }, 0)
    .to(glowFast, { y: 240, x: -180 }, 0)
    .to(grid, { autoAlpha: 0 }, 0);
}
