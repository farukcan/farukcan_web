import gsap from "gsap";
import type { Cleanup } from "./types";

const TILT_MAX = 6;
const MAGNETIC_STRENGTH = 0.28;
const INTERACTIVE = "a, button, [data-cursor], [data-magnetic], [data-tilt]";
const MAGNETIC = "[data-magnetic], .btn-primary, .btn-ghost";

/**
 * Fine-pointer only: custom cursor, magnetic buttons, 3D tilt + spotlight.
 * Magnetic uses xPercent/yPercent so it never fights reveal (y) or tilt (rotate).
 */
export function initPointer(): Cleanup {
  const root = document.querySelector<HTMLElement>("[data-cursor-root]");
  const dot = document.querySelector<HTMLElement>("[data-cursor-dot]");
  const ring = document.querySelector<HTMLElement>("[data-cursor-ring]");
  const label = document.querySelector<HTMLElement>("[data-cursor-label]");
  if (!root || !dot || !ring) return;

  const html = document.documentElement;
  html.classList.add("has-cursor");

  const moveDotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
  const moveDotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
  const moveRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
  const moveRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

  let visible = false;
  const show = () => {
    if (visible) return;
    visible = true;
    root.classList.add("is-visible");
  };
  const hide = () => {
    visible = false;
    root.classList.remove("is-visible", "is-hover", "is-label");
  };

  const onMove = (event: PointerEvent) => {
    show();
    moveDotX(event.clientX);
    moveDotY(event.clientY);
    moveRingX(event.clientX);
    moveRingY(event.clientY);

    const target = event.target;
    if (!(target instanceof Element)) return;
    const mag = target.closest<HTMLElement>(MAGNETIC);
    if (mag) moveMagnetic(mag, event);
    const tilt = target.closest<HTMLElement>("[data-tilt]");
    if (tilt) moveTilt(tilt, event);
  };

  const setHover = (el: Element | null) => {
    if (!el) {
      root.classList.remove("is-hover", "is-label");
      if (label) label.textContent = "";
      return;
    }
    const text = (el as HTMLElement).dataset.cursor
      || (el.closest("[data-cursor]") as HTMLElement | null)?.dataset.cursor
      || "";
    root.classList.toggle("is-label", Boolean(text));
    root.classList.toggle("is-hover", !text);
    if (label) label.textContent = text;
  };

  const onOver = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    setHover(target.closest(INTERACTIVE));
  };

  // --- Magnetic -----------------------------------------------------------
  const magnetics = Array.from(document.querySelectorAll<HTMLElement>(MAGNETIC));
  const leaveMagnetic = (el: HTMLElement) => {
    gsap.to(el, {
      xPercent: 0,
      yPercent: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });
  };
  const moveMagnetic = (el: HTMLElement, event: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    gsap.to(el, {
      xPercent: (dx / rect.width) * 100 * MAGNETIC_STRENGTH,
      yPercent: (dy / rect.height) * 100 * MAGNETIC_STRENGTH,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // --- Tilt + spotlight ---------------------------------------------------
  const tilts = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
  const leaveTilt = (el: HTMLElement) => {
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
    });
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };
  const moveTilt = (el: HTMLElement, event: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    gsap.to(el, {
      rotateX: (0.5 - py) * TILT_MAX * 2,
      rotateY: (px - 0.5) * TILT_MAX * 2,
      transformPerspective: 900,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onPointerOver = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const mag = target.closest<HTMLElement>(MAGNETIC);
    if (mag) moveMagnetic(mag, event);
    const tilt = target.closest<HTMLElement>("[data-tilt]");
    if (tilt) moveTilt(tilt, event);
  };
  const onPointerOut = (event: PointerEvent) => {
    const related = event.relatedTarget;
    const mag = (event.target as Element | null)?.closest?.(MAGNETIC);
    if (mag instanceof HTMLElement && !(related instanceof Node && mag.contains(related))) {
      leaveMagnetic(mag);
    }
    const tilt = (event.target as Element | null)?.closest?.("[data-tilt]");
    if (tilt instanceof HTMLElement && !(related instanceof Node && tilt.contains(related))) {
      leaveTilt(tilt);
    }
  };

  const pauseCursor = () => html.classList.add("cursor-paused");
  const resumeCursor = () => html.classList.remove("cursor-paused");

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerover", onOver);
  document.addEventListener("pointerover", onPointerOver);
  document.addEventListener("pointerout", onPointerOut);
  document.documentElement.addEventListener("pointerleave", hide);
  window.addEventListener("motion:lock", pauseCursor);
  window.addEventListener("motion:unlock", resumeCursor);

  return () => {
    html.classList.remove("has-cursor", "cursor-paused");
    hide();
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    document.removeEventListener("pointerover", onPointerOver);
    document.removeEventListener("pointerout", onPointerOut);
    document.documentElement.removeEventListener("pointerleave", hide);
    window.removeEventListener("motion:lock", pauseCursor);
    window.removeEventListener("motion:unlock", resumeCursor);
    magnetics.forEach((el) => gsap.set(el, { xPercent: 0, yPercent: 0 }));
    tilts.forEach((el) => {
      gsap.set(el, { rotateX: 0, rotateY: 0 });
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    });
  };
}
