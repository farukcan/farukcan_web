/** Optional teardown returned by a motion module (non-GSAP listeners etc.). */
export type Cleanup = (() => void) | undefined;

/** Resolved gsap.matchMedia() conditions shared by every module. */
export interface MotionEnv {
  /** `(min-width: 768px)` — pinning and heavier choreography allowed. */
  desktop: boolean;
  /** `(pointer: fine)` — mouse present; enables cursor / magnetic / tilt. */
  fine: boolean;
}
