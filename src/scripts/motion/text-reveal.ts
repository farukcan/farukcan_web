import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Cleanup, MotionEnv } from "./types";

type Unit = "words" | "chars" | "lines";

/**
 * `[data-split="words|chars|lines"]` headlines rise piece by piece, scrubbed to
 * scroll so they wind back when the user scrolls up. Chars degrade to words on
 * mobile to keep the DOM light.
 */
export function initTextReveal(env: MotionEnv): Cleanup {
  const splits: ReturnType<typeof SplitText.create>[] = [];

  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    const requested = (el.dataset.split || "words") as Unit;
    const unit: Unit = !env.desktop && requested === "chars" ? "words" : requested;

    splits.push(
      SplitText.create(el, {
        type: unit === "chars" ? "words,chars" : unit,
        mask: unit,
        // Lines depend on wrapping, so re-split when the width changes.
        autoSplit: unit === "lines",
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          return gsap.from(self[unit], {
            yPercent: 110,
            ease: "none",
            stagger: unit === "chars" ? 0.008 : 0.018,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              // Short distance so words finish rising before they look clipped.
              end: "+=80",
              scrub: 0.2,
            },
          });
        },
      }),
    );
  });

  return () => splits.forEach((split) => split.revert());
}
