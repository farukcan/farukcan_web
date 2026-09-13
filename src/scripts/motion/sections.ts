import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cleanup } from "./types";

const HIDDEN = { y: 48, autoAlpha: 0 };
const SHOWN = { y: 0, autoAlpha: 1 };
const START = "top 90%";

/**
 * Generic reveal + parallax layer.
 * - [data-reveal] inside [data-reveal-group]: batched, staggered, reversible.
 * - standalone [data-reveal]: plays on enter, reverses when scrolled back above.
 * - [data-parallax="<px>"]: drifts by <px> while its section crosses the viewport.
 * Only y / autoAlpha are touched here; magnetic (xPercent/yPercent) and tilt
 * (rotateX/rotateY) own different transform channels, so they never collide.
 */
export function initSections(): Cleanup {
  const grouped = new Set<Element>();

  document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
    const targets = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!targets.length) return;
    targets.forEach((t) => grouped.add(t));

    gsap.set(targets, HIDDEN);
    ScrollTrigger.batch(targets, {
      start: START,
      onEnter: (batch) =>
        gsap.to(batch, {
          ...SHOWN,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: "auto",
        }),
      onLeaveBack: (batch) =>
        gsap.to(batch, {
          ...HIDDEN,
          duration: 0.5,
          ease: "power2.in",
          stagger: 0.04,
          overwrite: "auto",
        }),
    });
  });

  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    if (grouped.has(el)) return;
    gsap.fromTo(el, HIDDEN, {
      ...SHOWN,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: START,
        toggleActions: "play none none reverse",
      },
    });
  });

  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const distance = Number(el.dataset.parallax) || -120;
    const scope = el.closest("section") ?? el.parentElement ?? el;
    gsap.fromTo(
      el,
      { y: -distance / 2 },
      {
        y: distance / 2,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}
