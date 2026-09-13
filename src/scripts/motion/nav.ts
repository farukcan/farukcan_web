import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import type { Cleanup, MotionEnv } from "./types";

/** Scroll depth (px) after which the header condenses and may hide. */
const CONDENSE_AT = 80;
/** Never hide the header while still this close to the top. */
const HIDE_MIN_SCROLL = 240;

export function initNav(lenis: Lenis, env: MotionEnv): Cleanup {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;

  const progress = document.querySelector<HTMLElement>("[data-scroll-progress]");
  if (progress) {
    gsap.fromTo(
      progress,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      },
    );
  }

  // --- Condense + direction-aware hide/show -------------------------------
  let hidden = false;
  let menuOpen = false;

  const show = () => {
    if (!hidden) return;
    hidden = false;
    gsap.to(header, { yPercent: 0, duration: 0.5, ease: "power3.out", overwrite: true });
  };
  const hide = () => {
    if (hidden || menuOpen) return;
    hidden = true;
    gsap.to(header, { yPercent: -110, duration: 0.5, ease: "power3.in", overwrite: true });
  };

  ScrollTrigger.create({
    start: CONDENSE_AT,
    end: "max",
    toggleClass: { targets: header, className: "is-scrolled" },
    onUpdate: (self) => {
      if (self.scroll() < HIDE_MIN_SCROLL || self.direction === -1) show();
      else hide();
    },
    onLeaveBack: show,
  });

  // --- Active section highlight -------------------------------------------
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
  );
  const setActive = (id: string | null) => {
    for (const link of links) {
      if (id && link.getAttribute("href") === `#${id}`) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };
  const sectionIds = [
    "hero",
    ...new Set(
      links
        .map((l) => l.getAttribute("href") ?? "")
        .filter((h) => h.startsWith("#"))
        .map((h) => h.slice(1)),
    ),
  ];
  for (const id of sectionIds) {
    const section = document.getElementById(id);
    if (!section) continue;
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (self.isActive) setActive(id === "hero" ? null : id);
      },
    });
  }

  // --- Mobile menu ----------------------------------------------------------
  if (env.desktop) return;

  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const panel = document.querySelector<HTMLElement>("[data-menu-panel]");
  if (!toggle || !panel) return;

  const items = panel.querySelectorAll<HTMLElement>("[data-menu-item]");
  panel.inert = true;

  const tl = gsap
    .timeline({ paused: true })
    .to(panel, { autoAlpha: 1, duration: 0.4, ease: "power2.out" })
    .fromTo(
      items,
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.6, ease: "power3.out" },
      "-=0.2",
    );

  const setOpen = (next: boolean) => {
    if (menuOpen === next) return;
    menuOpen = next;
    toggle.setAttribute("aria-expanded", String(next));
    toggle.setAttribute("aria-label", next ? "Close menu" : "Open menu");
    panel.inert = !next;
    document.documentElement.classList.toggle("menu-open", next);
    if (next) {
      show();
      lenis.stop();
      tl.play();
    } else {
      lenis.start();
      tl.reverse();
    }
  };

  const onToggle = () => setOpen(!menuOpen);
  // Runs before Lenis' window-level anchor handler, so scrolling is re-enabled in time.
  const onPanelClick = (event: Event) => {
    if ((event.target as Element).closest("a")) setOpen(false);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
  };

  toggle.addEventListener("click", onToggle);
  panel.addEventListener("click", onPanelClick);
  document.addEventListener("keydown", onKey);

  return () => {
    setOpen(false);
    tl.kill();
    panel.inert = false;
    toggle.removeEventListener("click", onToggle);
    panel.removeEventListener("click", onPanelClick);
    document.removeEventListener("keydown", onKey);
  };
}
