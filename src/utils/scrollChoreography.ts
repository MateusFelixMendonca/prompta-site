export interface StageLandmarks {
  heroY: number;
  tracksY: number;
  securityY: number;
  prePricingY: number;
  pricingY: number;
}

export interface InertiaStepResult {
  y: number;
  settled: boolean;
}

/**
 * Maps current scrollY to a continuous 4-stage narrative progress:
 * - 0.0: Stage 1 Hero (text left, brain right)
 * - 1.0: Stage 2 Tracks (brain rotated +180 deg on left, text right)
 * - 2.0: Stage 3 Kiwify Security (brain centered top-down, text split left & right)
 * - 2.65: Stage 4a Pre-Pricing Alignment (brain centered facing viewer straight-on)
 * - 3.05+: Stage 4b Shatter into starfield + Pricing tables revealed
 */
export function computeStageProgress(scrollY: number, landmarks: StageLandmarks): number {
  const { heroY, tracksY, securityY, prePricingY, pricingY } = landmarks;

  if (scrollY <= heroY) return 0;

  if (scrollY <= tracksY) {
    const span = Math.max(1, tracksY - heroY);
    return (scrollY - heroY) / span;
  }

  if (scrollY <= securityY) {
    const span = Math.max(1, securityY - tracksY);
    return 1.0 + (scrollY - tracksY) / span;
  }

  if (scrollY <= prePricingY) {
    const span = Math.max(1, prePricingY - securityY);
    return 2.0 + ((scrollY - securityY) / span) * 0.65;
  }

  if (scrollY <= pricingY) {
    const span = Math.max(1, pricingY - prePricingY);
    return 2.65 + ((scrollY - prePricingY) / span) * 0.45;
  }

  const tailSpan = Math.max(1, pricingY - prePricingY);
  return Math.min(3.5, 3.1 + ((scrollY - pricingY) / tailSpan) * 0.4);
}

/**
 * Advances a frame-rate independent inertial scroll position toward targetY
 * using continuous exponential damping without any magnetic snapping.
 */
export function stepInertiaScroll(
  currentY: number,
  targetY: number,
  dt: number,
  damping = 6.4,
): InertiaStepResult {
  const safeDt = Math.max(0, Math.min(dt, 0.06));
  const diff = targetY - currentY;
  if (Math.abs(diff) < 0.35) {
    return { y: targetY, settled: true };
  }
  const alpha = 1 - Math.exp(-damping * safeDt);
  return { y: currentY + diff * alpha, settled: false };
}

function smoothstepRange(edge0: number, edge1: number, x: number): number {
  const span = Math.max(1, edge1 - edge0);
  const t = Math.min(1, Math.max(0, (x - edge0) / span));
  return t * t * (3 - 2 * t);
}

/**
 * Computes a smooth [0..1] transition weight for shifting the starfield
 * from cool cyan-ice to crimson red while the user is inside the Prompts section.
 */
export function computeCrimsonShift(
  scrollY: number,
  promptsTop: number,
  promptsBottom: number,
  viewportHeight: number,
): number {
  if (promptsBottom <= promptsTop || viewportHeight <= 0) return 0;
  const viewCenter = scrollY + viewportHeight * 0.52;
  const enter = smoothstepRange(
    promptsTop - viewportHeight * 0.32,
    promptsTop + viewportHeight * 0.08,
    viewCenter,
  );
  const exit =
    1 -
    smoothstepRange(
      promptsBottom - viewportHeight * 0.04,
      promptsBottom + viewportHeight * 0.42,
      viewCenter,
    );
  return Math.min(1, Math.max(0, enter * exit));
}
