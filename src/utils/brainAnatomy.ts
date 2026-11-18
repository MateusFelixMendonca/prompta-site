import * as THREE from 'three';

export type BrainPart =
  | 'cortex'
  | 'medialBridge'
  | 'cerebellum'
  | 'stem'
  | 'ambientStar';

export interface SampledBrainPoint {
  pos: THREE.Vector3;
  normal: THREE.Vector3;
  fold: number;
  part: BrainPart;
}

export interface SculptedVertex {
  pos: THREE.Vector3;
  normal: THREE.Vector3;
  fold: number;
}

export interface BrainChoreography {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  scale: number;
  disperse: number;
  shatterBurst: number;
}

export function createBrainRng(seed = 73915) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Multi-octave 3D cortical convolution field producing distinct primary gyri,
 * meandering secondary convolutions, and crisp sulci crevices.
 */
export function corticalFolds(x: number, y: number, z: number): number {
  const wx = x + 0.22 * Math.sin(y * 4.4 + z * 3.1) + 0.11 * Math.cos(z * 6.8);
  const wy = y + 0.22 * Math.sin(z * 4.6 + x * 3.3) + 0.11 * Math.cos(x * 6.5);
  const wz = z + 0.22 * Math.sin(x * 4.2 + y * 3.7) + 0.11 * Math.cos(y * 6.9);

  // Primary broad anatomical gyri
  const primaryA = Math.sin(wx * 5.8 + wy * 5.1) + Math.cos(wz * 5.6 - wx * 4.2);
  // Secondary meandering cortical convolutions
  const secondaryB =
    Math.sin(wy * 9.8 - wz * 8.4 + Math.cos(wx * 5.2)) * 0.56 +
    Math.cos(wx * 11.2 + wz * 9.1) * 0.34;
  // Fine tertiary sulci creases
  const microC = Math.sin(wx * 15.6 - wy * 14.2 + wz * 12.8) * 0.22;

  const raw = Math.abs(primaryA * 0.72 + secondaryB * 0.65 + microC);
  // Sharpen crest plateaus and deepen narrow sulci valleys
  return THREE.MathUtils.clamp(Math.pow(raw / 2.2, 0.85) * 2.1, 0, 2.4);
}

/**
 * Sculpts a normalized hemisphere coordinate (side = ±1, uxAbs in [0, 1], uy in [-1, 1], uz in [-1, 1])
 * into an anatomically continuous cerebral lobe with frontal, parietal, temporal, and occipital contours.
 */
export function sculptCortexVertex(
  side: number,
  uxAbs: number,
  uy: number,
  uz: number,
  shell: number,
  withFoldDisplacement = true,
): SculptedVertex {
  // Proportions matched to anatomical lateral & dorsal profile
  let hx = Math.pow(uxAbs, 0.68) * 1.26;
  let hy = uy * 1.09;
  let hz = uz * 1.52;

  // Broad superior parietal dome
  hx *= 1.0 + 0.11 * Math.max(0, uy);

  // Frontal lobe (+Z) rounding + flat orbital floor
  if (uz > 0.1) {
    const f = Math.min(1, (uz - 0.1) / 0.9);
    hx *= 1.0 - 0.17 * Math.pow(f, 1.4);
    hy *= 1.0 - 0.05 * Math.pow(f, 1.5);
    if (uy < -0.12) {
      const orb = Math.min(1, (-uy - 0.12) * 1.38) * f;
      hy = THREE.MathUtils.lerp(hy, -0.31, orb * 0.7);
    }
  }

  // Occipital pole (-Z, -Y) sloping smoothly above the cerebellum
  if (uz < -0.16 && uy < -0.14) {
    const back = Math.min(1, (-uz - 0.16) * 1.25) * Math.min(1, (-uy - 0.14) * 1.42);
    hy = THREE.MathUtils.lerp(hy, -0.31, back * 0.72);
  }

  // Prominent forward-inferior Temporal lobe
  const tempMask =
    Math.exp(-Math.pow((uz - 0.1) / 0.48, 2)) *
    Math.exp(-Math.pow((uy + 0.42) / 0.36, 2)) *
    Math.min(1, uxAbs * 1.85);
  hy -= tempMask * 0.3;
  hx += tempMask * 0.19;
  hz += tempMask * 0.1;

  // Sylvian fissure (lateral sulcus) carving clean anatomical boundary above temporal lobe
  const sylvianY = -0.04 - uz * 0.17;
  const sylvianDist = Math.abs(uy - sylvianY);
  const sylvianCrease =
    uz > -0.24 && uz < 0.64 && uxAbs > 0.38
      ? Math.exp(-Math.pow(sylvianDist / 0.075, 2)) * (uxAbs - 0.38) * 1.35
      : 0;

  // Central sulcus of Rolando (subtle transverse groove near crown)
  const centralZ = 0.06 - uy * 0.16;
  const centralCrease =
    uy > 0.05 && uxAbs > 0.25
      ? Math.exp(-Math.pow((uz - centralZ) / 0.065, 2)) * Math.min(1, (uy - 0.05) * 1.8) * 0.55
      : 0;

  // Surface-only longitudinal midline cleft (solid interior preserved via medial bridge)
  const longitudinalGroove =
    Math.exp(-Math.pow(uxAbs / 0.16, 2)) * Math.max(0, uy + 0.3) * 0.13;

  const fold = corticalFolds(hx * side, hy, hz);
  const creasePenalty = sylvianCrease * 0.088 + centralCrease * 0.048;
  const ridgeBoost = withFoldDisplacement
    ? (Math.min(2.2, fold) - 0.88) * 0.068 - creasePenalty
    : -creasePenalty * 0.65;

  const finalX = side * ((hx + uxAbs * ridgeBoost * 0.62) * shell + 0.015);
  const finalY = (hy + uy * ridgeBoost * 0.72) * shell + 0.16 - longitudinalGroove;
  const finalZ = (hz + uz * ridgeBoost * 0.6) * shell;

  const pos = new THREE.Vector3(finalX, finalY, finalZ);
  const normal = new THREE.Vector3(side * Math.max(0.08, uxAbs), uy, uz).normalize();
  return {
    pos,
    normal,
    fold: fold - sylvianCrease * 0.95 - centralCrease * 0.55,
  };
}

/**
 * Sculpts a bilateral cerebellum vertex with central vermis continuity and horizontal folia.
 */
export function sculptCerebellumVertex(
  side: number,
  uxAbs: number,
  uy: number,
  uz: number,
  shell: number,
): SculptedVertex {
  const folia = Math.sin(uy * 42.0) * 0.032 + Math.cos(uz * 22.0) * 0.01;
  // Smooth vermis bridge at uxAbs -> 0 so both cerebellar lobes meet seamlessly
  const lobeDip = 1.0 - 0.14 * Math.exp(-Math.pow(uxAbs / 0.16, 2));

  const x = side * (0.012 + Math.pow(uxAbs, 0.82) * (0.88 + folia) * shell);
  const y = -0.66 + uy * 0.42 * lobeDip * shell;
  const z = -0.58 + uz * (0.56 + folia) * lobeDip * shell;

  const pos = new THREE.Vector3(x, y, z);
  const normal = new THREE.Vector3(side * Math.max(0.08, uxAbs), uy, uz).normalize();
  return { pos, normal, fold: 1.15 + folia * 9.0 };
}

/**
 * Sculpts a continuous brainstem vertex (Midbrain + Pons anterior bulge + tapered Medulla).
 */
export function sculptBrainstemVertex(
  t: number, // 0 (midbrain top) -> 1 (medulla bottom)
  angle: number,
  shell: number,
): SculptedVertex {
  const ponsBulge = Math.exp(-Math.pow((t - 0.28) / 0.17, 2)) * 0.115;
  const baseRadius = THREE.MathUtils.lerp(0.24, 0.135, t);
  const radius = baseRadius + ponsBulge * 0.35;
  const verticalRidges = Math.sin(angle * 10.0) * 0.01;

  const x = Math.cos(angle) * (radius + verticalRidges) * shell;
  const y = -0.44 - t * 0.96;
  const z =
    -0.14 -
    t * 0.1 +
    ponsBulge * (Math.sin(angle) > 0 ? 0.95 : 0.18) +
    Math.sin(angle) * (radius + verticalRidges) * shell;

  const pos = new THREE.Vector3(x, y, z);
  const normal = new THREE.Vector3(Math.cos(angle), -0.14, Math.sin(angle)).normalize();
  return { pos, normal, fold: 1.05 + verticalRidges * 12.0 };
}

/**
 * Samples continuous points across every anatomical sub-part with zero empty gaps.
 */
export function sampleAnatomicalBrain(rng: () => number, part: BrainPart): SampledBrainPoint {
  if (part === 'ambientStar') {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const r = 2.6 + rng() * 2.0;
    const pos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.85,
      r * Math.sin(phi) * Math.sin(theta),
    );
    return { pos, normal: pos.clone().normalize(), fold: 1.0, part };
  }

  if (part === 'medialBridge') {
    // Solid corpus callosum & central thalamic core connecting left & right hemispheres
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const r = 0.32 + 0.68 * Math.pow(rng(), 0.38);
    const x = Math.sin(phi) * Math.cos(theta) * 0.72 * r;
    const y = 0.08 + Math.cos(phi) * 0.66 * r;
    const z = Math.sin(phi) * Math.sin(theta) * 1.04 * r;
    const pos = new THREE.Vector3(x, y, z);
    const normal = new THREE.Vector3(x, y - 0.08, z).normalize();
    return { pos, normal, fold: 0.95 + rng() * 0.45, part };
  }

  if (part === 'stem') {
    const t = rng();
    const angle = rng() * Math.PI * 2;
    const shell = 0.76 + 0.24 * Math.pow(rng(), 0.25);
    const sculpted = sculptBrainstemVertex(t, angle, shell);
    return { pos: sculpted.pos, normal: sculpted.normal, fold: sculpted.fold, part };
  }

  if (part === 'cerebellum') {
    const side = rng() < 0.5 ? 1 : -1;
    const u = rng() * Math.PI * 2;
    const v = Math.acos(2 * rng() - 1);
    const shell = 0.8 + 0.2 * Math.pow(rng(), 0.22);
    const uxAbs = Math.abs(Math.sin(v) * Math.cos(u));
    const uy = Math.cos(v);
    const uz = Math.sin(v) * Math.sin(u);
    const sculpted = sculptCerebellumVertex(side, uxAbs, uy, uz, shell);
    return { pos: sculpted.pos, normal: sculpted.normal, fold: sculpted.fold, part };
  }

  // Cerebral cortex: dense continuous outer gyri + subtle sub-cortical depth
  const side = rng() < 0.5 ? 1 : -1;
  const u = rng() * Math.PI * 2;
  const v = Math.acos(2 * rng() - 1);
  const uxAbs = Math.abs(Math.sin(v) * Math.cos(u));
  const uy = Math.cos(v);
  const uz = Math.sin(v) * Math.sin(u);

  const isOuter = rng() < 0.9;
  const shell = isOuter ? 0.935 + 0.065 * Math.pow(rng(), 0.32) : 0.68 + 0.25 * rng();
  const sculpted = sculptCortexVertex(side, uxAbs, uy, uz, shell, true);
  return { pos: sculpted.pos, normal: sculpted.normal, fold: sculpted.fold, part };
}

// Neural Cyan + Neural Blue + Bright White gyri crests lighting palette
const KEY_LIGHT_DIR = new THREE.Vector3(0.38, 0.72, 0.58).normalize();
export const COL_DEEP_BLUE = new THREE.Color('#1D4ED8');
export const COL_NEURAL_BLUE = new THREE.Color('#0284C7');
export const COL_NEURAL_CYAN = new THREE.Color('#06B6D4');
export const COL_BRIGHT_CYAN = new THREE.Color('#2EE6D6');
export const COL_ICE_CYAN = new THREE.Color('#BAE6FD');
export const COL_CREST_WHITE = new THREE.Color('#F8FDFF');

export function pickNeuralPaletteColor(
  normal: THREE.Vector3,
  fold: number,
  part: BrainPart,
  rng: () => number,
): THREE.Color {
  if (part === 'ambientStar') {
    const r = rng();
    if (r < 0.55) return COL_CREST_WHITE.clone();
    if (r < 0.85) return COL_ICE_CYAN.clone();
    return COL_BRIGHT_CYAN.clone();
  }

  if (part === 'stem') {
    return rng() < 0.48 ? COL_NEURAL_BLUE.clone() : COL_BRIGHT_CYAN.clone();
  }

  if (part === 'medialBridge') {
    return rng() < 0.58 ? COL_NEURAL_BLUE.clone() : COL_DEEP_BLUE.clone();
  }

  if (part === 'cerebellum') {
    const crest = THREE.MathUtils.clamp((fold - 0.85) / 0.65, 0, 1);
    return COL_NEURAL_BLUE.clone().lerp(COL_CREST_WHITE, 0.18 + crest * 0.68);
  }

  const lightDot = normal.dot(KEY_LIGHT_DIR) * 0.5 + 0.5;
  const crest = THREE.MathUtils.clamp((fold - 0.52) / 1.45, 0, 1);
  const lum = THREE.MathUtils.clamp(crest * 0.74 + lightDot * 0.26 + (rng() - 0.5) * 0.06, 0, 1);

  if (lum < 0.34) {
    return COL_DEEP_BLUE.clone().lerp(COL_NEURAL_BLUE, lum / 0.34);
  }
  if (lum < 0.68) {
    return COL_NEURAL_BLUE.clone().lerp(COL_BRIGHT_CYAN, (lum - 0.34) / 0.34);
  }
  return COL_BRIGHT_CYAN.clone().lerp(COL_CREST_WHITE, (lum - 0.68) / 0.32);
}

function smooth01(t: number): number {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * Pure 4-stage scroll choreography calibrated for FOV 35° (Z = 9.6 desktop / 12.2 mobile):
 * - stage 0.0 (Hero): Brain aligned right, text aligned left
 * - stage 1.0 (Tracks): Brain rotates +180 deg across to left, text aligned right
 * - stage 2.0 (Kiwify Security): Brain centered, pitched into top-down dorsal view, text split sides
 * - stage 2.65 (Pre-Pricing): Brain aligns front-on facing the viewer's gaze
 * - stage 2.68..3.10 (Pricing Reveal): Brain shatters radially into cosmic starfield
 */
export function computeBrainChoreography(
  stageProgress: number,
  aspect: number,
  elapsed: number,
  pointerTiltX = 0,
  pointerTiltY = 0,
  prefersReducedMotion = false,
): BrainChoreography {
  const s = THREE.MathUtils.clamp(stageProgress, 0, 3.5);
  const isNarrow = aspect < 1.0;

  const HERO_YAW = 1.04;
  const HERO_PITCH = 0.14;
  const TRACKS_YAW = HERO_YAW + Math.PI; // Exact +180° rotation
  const CENTER_YAW = Math.PI * 2.0; // Symmetric frontal / longitudinal axis
  const TOP_DOWN_PITCH = 1.5; // ~86° dorsal view from above
  const FRONTAL_PITCH = 0.04;

  const halfWidth = Math.max(3.6, aspect * 3.027);
  const rightX = isNarrow ? 0.0 : Math.min(2.65, Math.max(1.96, halfWidth * 0.5));
  const leftX = isNarrow ? 0.0 : -Math.min(2.68, Math.max(2.12, halfWidth * 0.52));

  let x = rightX;
  let y = isNarrow ? -1.58 : 0.05;
  let z = 0.0;
  let rotX = HERO_PITCH;
  let rotY = HERO_YAW;
  let scale = isNarrow ? 0.98 : 1.54;

  if (s <= 1.0) {
    // Stage 0 -> Stage 1: Sweep Right Half -> Left Half while spinning exactly 180 degrees
    const t = smooth01(s);
    x = THREE.MathUtils.lerp(rightX, leftX, t);
    y = THREE.MathUtils.lerp(isNarrow ? -1.58 : 0.05, isNarrow ? -1.48 : 0.02, t);
    z = -Math.sin(t * Math.PI) * 0.45;
    rotY = THREE.MathUtils.lerp(HERO_YAW, TRACKS_YAW, t);
    rotX = HERO_PITCH + Math.sin(t * Math.PI) * 0.08;
    scale = isNarrow ? 0.96 : THREE.MathUtils.lerp(1.54, 1.32, t);
  } else if (s <= 2.0) {
    // Stage 1 -> Stage 2: Sweep Left -> Center and pitch into dorsal top-down view
    const t = smooth01(s - 1.0);
    x = THREE.MathUtils.lerp(leftX, 0.0, t);
    y = THREE.MathUtils.lerp(isNarrow ? -1.48 : 0.02, isNarrow ? -0.35 : 0.02, t);
    z = THREE.MathUtils.lerp(0.0, 0.15, t);
    rotY = THREE.MathUtils.lerp(TRACKS_YAW, CENTER_YAW, t);
    rotX = THREE.MathUtils.lerp(HERO_PITCH, TOP_DOWN_PITCH, t);
    // Sized cleanly to fit inside the unobstructed center corridor between left & right Kiwify columns
    scale = isNarrow ? 0.88 : THREE.MathUtils.lerp(1.32, 0.98, t);
  } else if (s <= 2.65) {
    // Stage 2 -> Stage 2.65: Hold center and tilt upright into direct frontal gaze alignment
    const t = smooth01((s - 2.0) / 0.65);
    x = 0.0;
    y = THREE.MathUtils.lerp(isNarrow ? -0.35 : 0.02, isNarrow ? 0.06 : 0.24, t);
    z = THREE.MathUtils.lerp(0.15, 0.45, t);
    rotY = CENTER_YAW;
    rotX = THREE.MathUtils.lerp(TOP_DOWN_PITCH, FRONTAL_PITCH, t);
    scale = isNarrow ? 0.96 : THREE.MathUtils.lerp(0.98, 1.52, t);
  } else {
    // Stage 2.65+: Aligned straight-on, then shatters radially into stars before pricing cards
    x = 0.0;
    y = isNarrow ? 0.06 : 0.24;
    z = THREE.MathUtils.lerp(0.45, -0.35, smooth01((s - 2.65) / 0.45));
    rotY = CENTER_YAW;
    rotX = FRONTAL_PITCH;
    scale = isNarrow ? 0.96 : 1.52;
  }

  // Radial shatter transition happens between stage 2.68 and 3.08 (right before pricing cards)
  const disperse = THREE.MathUtils.smoothstep(s, 2.68, 3.08);
  const shatterBurst = Math.sin(disperse * Math.PI);

  const idleWeight = 1.0 - disperse * 0.78;
  const idleY = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.028 * idleWeight;
  const idleYaw = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.28) * 0.06 * idleWeight;
  const idlePitch = prefersReducedMotion ? 0 : Math.cos(elapsed * 0.22) * 0.025 * idleWeight;

  // Attenuate pointer tilt in top-down view so central symmetry stays crisp
  const pointerScale = s > 1.7 && s < 2.3 ? 0.45 : 1.0;

  return {
    x,
    y: y + idleY,
    z,
    rotX: rotX + (idlePitch + pointerTiltX * pointerScale) * idleWeight,
    rotY: rotY + (idleYaw + pointerTiltY * pointerScale) * idleWeight,
    scale,
    disperse,
    shatterBurst,
  };
}
