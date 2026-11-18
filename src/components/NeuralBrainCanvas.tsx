import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  COL_BRIGHT_CYAN,
  COL_ICE_CYAN,
  COL_NEURAL_CYAN,
  computeBrainChoreography,
  createBrainRng,
  pickNeuralPaletteColor,
  sampleAnatomicalBrain,
  sculptBrainstemVertex,
  sculptCerebellumVertex,
  sculptCortexVertex,
  type BrainPart,
  type SampledBrainPoint,
} from '../utils/brainAnatomy';
import {
  computeCrimsonShift,
  computeStageProgress,
  type StageLandmarks,
} from '../utils/scrollChoreography';
import { measureStageLandmarks } from '../utils/smoothScroll';

interface NeuralBrainCanvasProps {
  className?: string;
}

/**
 * Watertight sculpted inner shell for one cerebral hemisphere (side = -1 or +1)
 * with flat medial face and full lateral gyri/sulci relief.
 */
function buildHemisphereInnerShell(side: -1 | 1): THREE.BufferGeometry {
  const baseGeo = new THREE.SphereGeometry(1, 64, 48);
  const posAttr = baseGeo.attributes.position as THREE.BufferAttribute;
  const normAttr = baseGeo.attributes.normal as THREE.BufferAttribute;
  const foldAttr = new Float32Array(posAttr.count);

  for (let i = 0; i < posAttr.count; i++) {
    const ux = posAttr.getX(i);
    const uy = posAttr.getY(i);
    const uz = posAttr.getZ(i);
    const signedSideMatch = ux * side;
    const isOuterWall = signedSideMatch >= 0;
    const uxAbs = isOuterWall
      ? Math.abs(ux)
      : 0.002 * Math.max(0, 1 + signedSideMatch);

    const sculpted = sculptCortexVertex(side, uxAbs, uy, uz, 0.955, isOuterWall);
    const medialPullX = isOuterWall ? sculpted.pos.x : side * 0.002;
    posAttr.setXYZ(i, medialPullX, sculpted.pos.y, sculpted.pos.z);
    normAttr.setXYZ(i, sculpted.normal.x, sculpted.normal.y, sculpted.normal.z);
    foldAttr[i] = isOuterWall ? sculpted.fold : 0.25;
  }

  baseGeo.setAttribute('aFold', new THREE.BufferAttribute(foldAttr, 1));
  baseGeo.computeVertexNormals();
  return baseGeo;
}

/**
 * Watertight sculpted inner shell for one cerebellar lobe (side = -1 or +1).
 */
function buildCerebellumInnerShell(side: -1 | 1): THREE.BufferGeometry {
  const baseGeo = new THREE.SphereGeometry(1, 32, 24);
  const posAttr = baseGeo.attributes.position as THREE.BufferAttribute;
  const normAttr = baseGeo.attributes.normal as THREE.BufferAttribute;
  const foldAttr = new Float32Array(posAttr.count);

  for (let i = 0; i < posAttr.count; i++) {
    const ux = posAttr.getX(i);
    const uy = posAttr.getY(i);
    const uz = posAttr.getZ(i);
    const signedSideMatch = ux * side;
    const uxAbs = signedSideMatch >= 0 ? Math.abs(ux) : 0.02 * Math.max(0, 1 + signedSideMatch);
    const sculpted = sculptCerebellumVertex(side, uxAbs, uy, uz, 0.945);
    posAttr.setXYZ(i, sculpted.pos.x, sculpted.pos.y, sculpted.pos.z);
    normAttr.setXYZ(i, sculpted.normal.x, sculpted.normal.y, sculpted.normal.z);
    foldAttr[i] = sculpted.fold;
  }

  baseGeo.setAttribute('aFold', new THREE.BufferAttribute(foldAttr, 1));
  baseGeo.computeVertexNormals();
  return baseGeo;
}

/**
 * Sculpted solid inner envelope for the brainstem (pons + medulla) so the base reads cleanly.
 */
function buildBrainstemInnerShell(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 24, 16, false);
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const normAttr = geo.attributes.normal as THREE.BufferAttribute;
  const foldAttr = new Float32Array(posAttr.count);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // in [-0.5, 0.5]
    const z = posAttr.getZ(i);
    const t = THREE.MathUtils.clamp(0.5 - y, 0, 1);
    const radial = Math.hypot(x, z);
    const angle = Math.atan2(z, x);
    const shell = radial < 0.01 ? 0.0 : 0.94;
    const sculpted = sculptBrainstemVertex(t, angle, shell);
    posAttr.setXYZ(i, sculpted.pos.x, sculpted.pos.y, sculpted.pos.z);
    normAttr.setXYZ(i, sculpted.normal.x, sculpted.normal.y, sculpted.normal.z);
    foldAttr[i] = sculpted.fold;
  }

  geo.setAttribute('aFold', new THREE.BufferAttribute(foldAttr, 1));
  geo.computeVertexNormals();
  return geo;
}

export default function NeuralBrainCanvas({ className = '' }: NeuralBrainCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const isSoftwareGl = (() => {
      try {
        const gl = renderer.getContext();
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    document.documentElement.classList.toggle('has-gpu', !isSoftwareGl);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const aspect = width / height;
    // Narrower 35deg FOV + farther camera distance gives sharp architectural depth & rich detail
    const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 120);
    camera.position.set(0, 0, aspect < 1.0 ? 12.2 : 9.6);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    const rng = createBrainRng(202611);

    const sharedUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 99) },
      uPulseTime: { value: -10 },
      uPulseOrigin: { value: new THREE.Vector3(0, 0, 1.2) },
      uDisperse: { value: 0 },
      uShatterBurst: { value: 0 },
      uCrimsonShift: { value: 0 },
    };

    // =========================================================================
    // PIECE GROUP 0: Complete Multi-Part Translucent Inner Anatomical Shells
    // (Left/Right Cortex, Corpus Callosum, Bilateral Cerebellum, Brainstem)
    // =========================================================================
    const shellMaterial = new THREE.ShaderMaterial({
      uniforms: sharedUniforms,
      transparent: true,
      depthWrite: true,
      vertexShader: `
        attribute float aFold;
        uniform float uTime;
        uniform float uDisperse;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying float vFold;

        void main() {
          float breath = 1.0 + 0.008 * sin(uTime * 1.4);
          float shrink = 1.0 - smoothstep(0.05, 0.55, uDisperse);
          vec3 pos = position * breath * mix(0.25, 1.0, shrink);
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPos = -mvPos.xyz;
          vFold = aFold;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uDisperse;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying float vFold;

        void main() {
          float fade = 1.0 - smoothstep(0.04, 0.46, uDisperse);
          if (fade <= 0.01) discard;
          vec3 viewDir = normalize(vViewPos);
          vec3 n = normalize(vNormal);
          float fresnel = pow(1.0 - abs(dot(n, viewDir)), 2.2);
          float keyLight = clamp(dot(n, normalize(vec3(0.35, 0.7, 0.6))) * 0.5 + 0.5, 0.0, 1.0);
          float ridge = smoothstep(0.68, 1.65, vFold);

          vec3 sulcusCol = vec3(0.008, 0.028, 0.088);
          vec3 gyrusCol = vec3(0.035, 0.24, 0.54);
          vec3 crestGlow = vec3(0.18, 0.85, 0.92);

          vec3 col = mix(sulcusCol, gyrusCol, ridge * (0.45 + keyLight * 0.55));
          col = mix(col, crestGlow, pow(ridge, 2.0) * 0.34 + fresnel * 0.42);
          gl_FragColor = vec4(col, 0.9 * fade);
        }
      `,
    });

    const leftCortexShellGeo = buildHemisphereInnerShell(-1);
    const rightCortexShellGeo = buildHemisphereInnerShell(1);
    const corpusCallosumGeo = new THREE.SphereGeometry(1, 32, 24);
    corpusCallosumGeo.scale(0.48, 0.82, 1.24);
    corpusCallosumGeo.translate(0, 0.14, 0);
    corpusCallosumGeo.setAttribute(
      'aFold',
      new THREE.BufferAttribute(new Float32Array(corpusCallosumGeo.attributes.position.count).fill(0.52), 1),
    );
    const leftCerebShellGeo = buildCerebellumInnerShell(-1);
    const rightCerebShellGeo = buildCerebellumInnerShell(1);
    const stemShellGeo = buildBrainstemInnerShell();

    for (const geo of [
      leftCortexShellGeo,
      rightCortexShellGeo,
      corpusCallosumGeo,
      leftCerebShellGeo,
      rightCerebShellGeo,
      stemShellGeo,
    ]) {
      const m = new THREE.Mesh(geo, shellMaterial);
      m.renderOrder = 0;
      m.frustumCulled = false;
      brainGroup.add(m);
    }

    // =========================================================================
    // PIECE GROUP 1: High-Density Multi-Polygon Wireframe Shards + Folia
    // =========================================================================
    interface SegmentRecord {
      p0: THREE.Vector3;
      p1: THREE.Vector3;
      center: THREE.Vector3;
      star: THREE.Vector3;
      color: THREE.Color;
      seed: number;
    }
    const wireSegments: SegmentRecord[] = [];
    const tmpTangent = new THREE.Vector3();
    const tmpBitangent = new THREE.Vector3();
    const upVec = new THREE.Vector3(0, 1, 0);
    const altUp = new THREE.Vector3(1, 0, 0);

    const makeStarTarget = () =>
      new THREE.Vector3(
        (rng() - 0.5) * 9.0,
        (rng() - 0.5) * 5.2,
        (rng() - 0.5) * 2.8,
      );

    const POLY_SHARD_COUNT = 5200;
    const corticalSamples: SampledBrainPoint[] = [];

    for (let i = 0; i < POLY_SHARD_COUNT; i++) {
      const part: BrainPart =
        i < 300
          ? 'medialBridge'
          : i < 1100
            ? 'cerebellum'
            : i < 1380
              ? 'stem'
              : 'cortex';
      const sample = sampleAnatomicalBrain(rng, part);
      if (part === 'cortex' && corticalSamples.length < 2400) {
        corticalSamples.push(sample);
      }

      const center = sample.pos;
      const normal = sample.normal;
      const color = pickNeuralPaletteColor(normal, sample.fold, part, rng);

      const refUp = Math.abs(normal.y) > 0.9 ? altUp : upVec;
      tmpTangent.crossVectors(refUp, normal).normalize();
      tmpBitangent.crossVectors(normal, tmpTangent).normalize();

      // Mix of triangles (54%), diamonds (24%), and hexagons (22%) scaled crisp for farther camera
      const shapeRoll = rng();
      const sides = shapeRoll < 0.54 ? 3 : shapeRoll < 0.78 ? 4 : 6;
      const radius =
        sides === 6
          ? 0.015 + rng() * 0.018
          : sides === 4
            ? 0.014 + rng() * 0.02
            : 0.013 + rng() * 0.022;

      const rot = rng() * Math.PI * 2;
      const tilt = (rng() - 0.5) * 0.35;
      const ringVerts: THREE.Vector3[] = [];

      for (let s = 0; s < sides; s++) {
        const a = rot + (s * Math.PI * 2) / sides;
        const rx = Math.cos(a) * radius;
        const ry = Math.sin(a) * radius * (sides === 4 ? 1.25 : 1.0);
        const v = center
          .clone()
          .addScaledVector(tmpTangent, rx)
          .addScaledVector(tmpBitangent, ry)
          .addScaledVector(normal, Math.sin(a * 2.0) * radius * tilt);
        ringVerts.push(v);
      }

      const star = makeStarTarget();
      const seed = rng();

      for (let s = 0; s < sides; s++) {
        wireSegments.push({
          p0: ringVerts[s],
          p1: ringVerts[(s + 1) % sides],
          center,
          star,
          color,
          seed,
        });
      }
    }

    // =========================================================================
    // PIECE GROUP 2: Synaptic Axon Filaments & Gyri Crest Contours
    // =========================================================================
    const crestSamples = corticalSamples.filter((s) => s.fold > 0.96);
    const AXON_COUNT = 2600;
    for (let i = 0; i < AXON_COUNT && corticalSamples.length > 20; i++) {
      const useCrestPool = i < 1200 && crestSamples.length > 20;
      const pool = useCrestPool ? crestSamples : corticalSamples;
      const a = pool[Math.floor(rng() * pool.length)];
      let partner = pool[Math.floor(rng() * pool.length)];
      let bestDist = a.pos.distanceTo(partner.pos);
      for (let k = 0; k < 14; k++) {
        const candidate = pool[Math.floor(rng() * pool.length)];
        const d = a.pos.distanceTo(candidate.pos);
        if (d > 0.04 && d < bestDist) {
          bestDist = d;
          partner = candidate;
        }
      }
      if (bestDist < 0.34) {
        const mid = a.pos.clone().lerp(partner.pos, 0.5);
        const col = useCrestPool
          ? COL_ICE_CYAN.clone()
          : rng() < 0.6
            ? COL_NEURAL_CYAN.clone()
            : COL_ICE_CYAN.clone();
        wireSegments.push({
          p0: a.pos,
          p1: partner.pos,
          center: mid,
          star: makeStarTarget(),
          color: col,
          seed: rng(),
        });
      }
    }

    // =========================================================================
    // PIECE GROUP 2B: Cerebellar Horizontal Folia & Brainstem Fiber Striations
    // =========================================================================
    for (const side of [-1, 1] as const) {
      for (let row = 0; row < 14; row++) {
        const uy = -0.78 + (row / 13) * 1.56;
        let prevPt: THREE.Vector3 | null = null;
        for (let step = 0; step <= 18; step++) {
          const t = step / 18;
          const u = -Math.PI * 0.45 + t * Math.PI * 0.9;
          const uxAbs = Math.max(0.06, Math.cos(u) * Math.sqrt(Math.max(0.08, 1 - uy * uy)));
          const uz = Math.sin(u) * Math.sqrt(Math.max(0.08, 1 - uy * uy));
          const pt = sculptCerebellumVertex(side, uxAbs, uy, uz, 1.005).pos;
          if (prevPt) {
            wireSegments.push({
              p0: prevPt,
              p1: pt,
              center: prevPt.clone().lerp(pt, 0.5),
              star: makeStarTarget(),
              color: row % 2 === 0 ? COL_BRIGHT_CYAN.clone() : COL_ICE_CYAN.clone(),
              seed: rng(),
            });
          }
          prevPt = pt;
        }
      }
    }

    for (let colIdx = 0; colIdx < 16; colIdx++) {
      const angle = (colIdx / 16) * Math.PI * 2;
      let prevPt: THREE.Vector3 | null = null;
      for (let seg = 0; seg <= 12; seg++) {
        const t = seg / 12;
        const pt = sculptBrainstemVertex(t, angle, 1.01).pos;
        if (prevPt) {
          wireSegments.push({
            p0: prevPt,
            p1: pt,
            center: prevPt.clone().lerp(pt, 0.5),
            star: makeStarTarget(),
            color: COL_BRIGHT_CYAN.clone(),
            seed: rng(),
          });
        }
        prevPt = pt;
      }
    }

    const wireVertCount = wireSegments.length * 2;
    const wirePos = new Float32Array(wireVertCount * 3);
    const wireCenters = new Float32Array(wireVertCount * 3);
    const wireStars = new Float32Array(wireVertCount * 3);
    const wireColors = new Float32Array(wireVertCount * 3);
    const wireSeeds = new Float32Array(wireVertCount);

    for (let i = 0; i < wireSegments.length; i++) {
      const seg = wireSegments[i];
      const pts = [seg.p0, seg.p1];
      for (let k = 0; k < 2; k++) {
        const idx = i * 2 + k;
        wirePos[idx * 3] = pts[k].x;
        wirePos[idx * 3 + 1] = pts[k].y;
        wirePos[idx * 3 + 2] = pts[k].z;

        wireCenters[idx * 3] = seg.center.x;
        wireCenters[idx * 3 + 1] = seg.center.y;
        wireCenters[idx * 3 + 2] = seg.center.z;

        wireStars[idx * 3] = seg.star.x;
        wireStars[idx * 3 + 1] = seg.star.y;
        wireStars[idx * 3 + 2] = seg.star.z;

        wireColors[idx * 3] = seg.color.r;
        wireColors[idx * 3 + 1] = seg.color.g;
        wireColors[idx * 3 + 2] = seg.color.b;

        wireSeeds[idx] = seg.seed;
      }
    }

    const wireGeometry = new THREE.BufferGeometry();
    wireGeometry.setAttribute('position', new THREE.BufferAttribute(wirePos, 3));
    wireGeometry.setAttribute('aCenter', new THREE.BufferAttribute(wireCenters, 3));
    wireGeometry.setAttribute('aStarPos', new THREE.BufferAttribute(wireStars, 3));
    wireGeometry.setAttribute('aColor', new THREE.BufferAttribute(wireColors, 3));
    wireGeometry.setAttribute('aSeed', new THREE.BufferAttribute(wireSeeds, 1));

    const wireMaterial = new THREE.ShaderMaterial({
      uniforms: sharedUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aCenter;
        attribute vec3 aStarPos;
        attribute vec3 aColor;
        attribute float aSeed;

        uniform float uTime;
        uniform vec3 uMouse;
        uniform float uPulseTime;
        uniform vec3 uPulseOrigin;
        uniform float uDisperse;
        uniform float uShatterBurst;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec3 localOffset = position - aCenter;
          float breath = 1.0 + 0.008 * sin(uTime * 1.4 + aSeed * 6.2831);

          float stagger = clamp((uDisperse - aSeed * 0.25) / 0.75, 0.0, 1.0);
          float eased = stagger * stagger * (3.0 - 2.0 * stagger);

          vec3 brainCenter = aCenter * breath;
          vec3 radialDir = normalize(brainCenter + vec3(0.001, 0.002, 0.001));
          vec3 burstOffset = radialDir * uShatterBurst * (0.95 + aSeed * 1.45) * sin(eased * 3.14159);
          vec3 c = mix(brainCenter, aStarPos, eased) + burstOffset;

          float distToMouse = distance(c, uMouse);
          float mouseInfluence = smoothstep(1.15, 0.0, distToMouse) * (1.0 - eased);

          float pulseAge = uTime - uPulseTime;
          float waveRadius = pulseAge * 3.6;
          float waveDist = abs(distance(brainCenter, uPulseOrigin) - waveRadius);
          float pulseWave = (pulseAge >= 0.0 && pulseAge < 2.2)
            ? smoothstep(0.58, 0.0, waveDist) * (1.0 - pulseAge / 2.2) * (1.0 - eased)
            : 0.0;

          float shrink = 1.0 - smoothstep(0.15, 0.72, eased);
          float scale = (1.0 + mouseInfluence * 0.55 + pulseWave * 0.45) * shrink;
          vec3 finalPos = c + localOffset * scale;
          finalPos += normalize(c + vec3(0.001)) * (mouseInfluence * 0.055 + pulseWave * 0.045);

          float twinkle = 0.72 + 0.28 * sin(uTime * (1.4 + aSeed * 2.2) + aSeed * 19.0);
          vColor = mix(aColor, vec3(0.96, 0.99, 1.0), mouseInfluence * 0.55 + pulseWave * 0.65);
          vAlpha = clamp((twinkle * 0.66 + mouseInfluence * 0.35 + pulseWave * 0.45) * shrink, 0.0, 0.86);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          if (vAlpha <= 0.01) discard;
          gl_FragColor = vec4(vColor, vAlpha);
        }
      `,
    });

    const wireMesh = new THREE.LineSegments(wireGeometry, wireMaterial);
    wireMesh.renderOrder = 2;
    wireMesh.frustumCulled = false;
    brainGroup.add(wireMesh);

    // =========================================================================
    // PIECE GROUP 3: Translucent Neural-Blue & Cyan Micro-Facets
    // =========================================================================
    const FACET_COUNT = 1600;
    const facetPos = new Float32Array(FACET_COUNT * 3 * 3);
    const facetCenters = new Float32Array(FACET_COUNT * 3 * 3);
    const facetStars = new Float32Array(FACET_COUNT * 3 * 3);
    const facetColors = new Float32Array(FACET_COUNT * 3 * 3);
    const facetSeeds = new Float32Array(FACET_COUNT * 3);

    for (let i = 0; i < FACET_COUNT; i++) {
      const part: BrainPart =
        i < 130 ? 'medialBridge' : i < 420 ? 'cerebellum' : i < 510 ? 'stem' : 'cortex';
      const sample = sampleAnatomicalBrain(rng, part);
      const center = sample.pos;
      const normal = sample.normal;
      const color = pickNeuralPaletteColor(normal, sample.fold, part, rng);

      const refUp = Math.abs(normal.y) > 0.9 ? altUp : upVec;
      tmpTangent.crossVectors(refUp, normal).normalize();
      tmpBitangent.crossVectors(normal, tmpTangent).normalize();

      const radius = 0.014 + rng() * 0.022;
      const rot = rng() * Math.PI * 2;
      const star = makeStarTarget();
      const seed = rng();

      for (let k = 0; k < 3; k++) {
        const a = rot + (k * Math.PI * 2) / 3;
        const v = center
          .clone()
          .addScaledVector(tmpTangent, Math.cos(a) * radius)
          .addScaledVector(tmpBitangent, Math.sin(a) * radius);
        const idx = i * 3 + k;
        facetPos[idx * 3] = v.x;
        facetPos[idx * 3 + 1] = v.y;
        facetPos[idx * 3 + 2] = v.z;

        facetCenters[idx * 3] = center.x;
        facetCenters[idx * 3 + 1] = center.y;
        facetCenters[idx * 3 + 2] = center.z;

        facetStars[idx * 3] = star.x;
        facetStars[idx * 3 + 1] = star.y;
        facetStars[idx * 3 + 2] = star.z;

        facetColors[idx * 3] = color.r;
        facetColors[idx * 3 + 1] = color.g;
        facetColors[idx * 3 + 2] = color.b;

        facetSeeds[idx] = seed;
      }
    }

    const facetGeometry = new THREE.BufferGeometry();
    facetGeometry.setAttribute('position', new THREE.BufferAttribute(facetPos, 3));
    facetGeometry.setAttribute('aCenter', new THREE.BufferAttribute(facetCenters, 3));
    facetGeometry.setAttribute('aStarPos', new THREE.BufferAttribute(facetStars, 3));
    facetGeometry.setAttribute('aColor', new THREE.BufferAttribute(facetColors, 3));
    facetGeometry.setAttribute('aSeed', new THREE.BufferAttribute(facetSeeds, 1));

    const facetMaterial = new THREE.ShaderMaterial({
      uniforms: sharedUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: wireMaterial.vertexShader,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          if (vAlpha <= 0.01) discard;
          gl_FragColor = vec4(vColor, vAlpha * 0.22);
        }
      `,
    });

    const facetMesh = new THREE.Mesh(facetGeometry, facetMaterial);
    facetMesh.renderOrder = 1;
    facetMesh.frustumCulled = false;
    brainGroup.add(facetMesh);

    // =========================================================================
    // PIECE GROUP 4: Ultra-Dense Cortical Nodes & Cosmic Starfield
    // =========================================================================
    const POINT_COUNT = 9600;
    const ptPositions = new Float32Array(POINT_COUNT * 3);
    const ptStarPositions = new Float32Array(POINT_COUNT * 3);
    const ptColors = new Float32Array(POINT_COUNT * 3);
    const ptStarColors = new Float32Array(POINT_COUNT * 3);
    const ptSizes = new Float32Array(POINT_COUNT);
    const ptSeeds = new Float32Array(POINT_COUNT);

    const starPalette = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#E0F7FF'),
      new THREE.Color('#BAE6FD'),
      new THREE.Color('#7DD3FC'),
      new THREE.Color('#F0F9FF'),
    ];

    for (let i = 0; i < POINT_COUNT; i++) {
      const part: BrainPart =
        i < 850
          ? 'ambientStar'
          : i < 1350
            ? 'medialBridge'
            : i < 1900
              ? 'stem'
              : i < 3200
                ? 'cerebellum'
                : 'cortex';
      const sample = sampleAnatomicalBrain(rng, part);
      const color = pickNeuralPaletteColor(sample.normal, sample.fold, part, rng);

      ptPositions[i * 3] = sample.pos.x;
      ptPositions[i * 3 + 1] = sample.pos.y;
      ptPositions[i * 3 + 2] = sample.pos.z;

      // Calibrated local starfield spread for enlarged scale (1.56) & Z=9.6 camera
      ptStarPositions[i * 3] = (rng() - 0.5) * 9.2;
      ptStarPositions[i * 3 + 1] = (rng() - 0.5) * 5.4;
      ptStarPositions[i * 3 + 2] = (rng() - 0.5) * 3.0;

      ptColors[i * 3] = color.r;
      ptColors[i * 3 + 1] = color.g;
      ptColors[i * 3 + 2] = color.b;

      const sCol = starPalette[Math.floor(rng() * starPalette.length)];
      ptStarColors[i * 3] = sCol.r;
      ptStarColors[i * 3 + 1] = sCol.g;
      ptStarColors[i * 3 + 2] = sCol.b;

      ptSizes[i] =
        part === 'ambientStar'
          ? 1.7 + rng() * 2.3
          : part === 'stem'
            ? 2.4 + rng() * 2.6
            : part === 'cortex' && sample.fold > 1.0
              ? 2.8 + rng() * 3.8
              : 1.9 + rng() * 3.0;

      ptSeeds[i] = rng();
    }

    const ptGeometry = new THREE.BufferGeometry();
    ptGeometry.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3));
    ptGeometry.setAttribute('aStarPos', new THREE.BufferAttribute(ptStarPositions, 3));
    ptGeometry.setAttribute('aColor', new THREE.BufferAttribute(ptColors, 3));
    ptGeometry.setAttribute('aStarColor', new THREE.BufferAttribute(ptStarColors, 3));
    ptGeometry.setAttribute('aSize', new THREE.BufferAttribute(ptSizes, 1));
    ptGeometry.setAttribute('aSeed', new THREE.BufferAttribute(ptSeeds, 1));

    const ptMaterial = new THREE.ShaderMaterial({
      uniforms: sharedUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aStarPos;
        attribute vec3 aColor;
        attribute vec3 aStarColor;
        attribute float aSize;
        attribute float aSeed;

        uniform float uTime;
        uniform vec3 uMouse;
        uniform float uPulseTime;
        uniform vec3 uPulseOrigin;
        uniform float uDisperse;
        uniform float uShatterBurst;
        uniform float uCrimsonShift;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float breath = 1.0 + 0.008 * sin(uTime * 1.4 + aSeed * 6.2831);
          float stagger = clamp((uDisperse - aSeed * 0.25) / 0.75, 0.0, 1.0);
          float eased = stagger * stagger * (3.0 - 2.0 * stagger);

          vec3 brainPos = position * breath;
          vec3 radialDir = normalize(brainPos + vec3(0.001, 0.002, 0.001));
          vec3 burstOffset = radialDir * uShatterBurst * (1.1 + aSeed * 1.6) * sin(eased * 3.14159);
          vec3 starDrift = aStarPos + vec3(
            sin(uTime * 0.25 + aSeed * 20.0) * 0.07,
            cos(uTime * 0.2 + aSeed * 15.0) * 0.07,
            0.0
          );
          vec3 pos = mix(brainPos, starDrift, eased) + burstOffset;

          float distToMouse = distance(pos, uMouse);
          float mouseInfluence = smoothstep(1.15, 0.0, distToMouse);

          float pulseAge = uTime - uPulseTime;
          float waveRadius = pulseAge * 3.6;
          float waveDist = abs(distance(brainPos, uPulseOrigin) - waveRadius);
          float pulseWave = (pulseAge >= 0.0 && pulseAge < 2.2)
            ? smoothstep(0.58, 0.0, waveDist) * (1.0 - pulseAge / 2.2) * (1.0 - eased)
            : 0.0;

          pos += normalize(pos + vec3(0.001)) * (mouseInfluence * 0.055 * (1.0 - eased) + pulseWave * 0.045);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float starScale = mix(1.0, (0.54 + 0.44 * aSeed) * (1.0 + uCrimsonShift * 0.16), eased);
          gl_PointSize = aSize * starScale * (1.0 + mouseInfluence * 0.55 + pulseWave * 0.55) * (10.2 / max(1.5, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;

          float twinkle = 0.52 + 0.48 * sin(uTime * (1.8 + aSeed * 3.2) + aSeed * 29.0);
          vec3 crimsonStar = mix(vec3(0.86, 0.08, 0.18), vec3(0.98, 0.34, 0.38), aSeed);
          crimsonStar = mix(crimsonStar, vec3(1.0, 0.84, 0.86), smoothstep(0.86, 1.0, aSeed));
          vec3 targetStarColor = mix(aStarColor, crimsonStar, uCrimsonShift);
          vec3 baseCol = mix(aColor, targetStarColor, eased * mix(0.9, 1.0, uCrimsonShift));
          vColor = mix(baseCol, vec3(1.0), mouseInfluence * 0.5 + pulseWave * 0.6);

          float brainAlpha = twinkle * 0.84 + mouseInfluence * 0.35 + pulseWave * 0.45;
          float starAlpha = (0.38 + 0.62 * twinkle) * (0.68 + 0.32 * aSeed) * (1.0 + uCrimsonShift * 0.24);
          vAlpha = clamp(mix(brainAlpha, starAlpha, eased), 0.16, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float strength = pow(smoothstep(0.5, 0.02, d), 1.35);
          gl_FragColor = vec4(vColor, strength * vAlpha);
        }
      `,
    });

    const pointsCloud = new THREE.Points(ptGeometry, ptMaterial);
    pointsCloud.renderOrder = 3;
    pointsCloud.frustumCulled = false;
    brainGroup.add(pointsCloud);

    // Scroll & Pointer Choreography
    const pointerNDC = new THREE.Vector2(99, 99);
    const pointerTilt = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3(99, 99, 99);
    const localMousePoint = new THREE.Vector3(99, 99, 99);
    let pointerActive = false;

    let landmarks: StageLandmarks = measureStageLandmarks();
    let promptsBounds = { top: 0, bottom: 0 };
    let targetStageProgress = 0;
    let smoothStageProgress = 0;
    let targetCrimsonShift = 0;

    const measurePromptsBounds = () => {
      const el = document.getElementById('prompts');
      if (!el) return { top: 0, bottom: 0 };
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      };
    };

    let frameId = 0;
    let disposed = false;
    let contextLost = false;
    const startTime = performance.now();
    let lastTime = startTime;

    const applyReducedMotionSnapshot = () => {
      if (disposed || contextLost) return;
      smoothStageProgress = targetStageProgress;
      const pose = computeBrainChoreography(
        smoothStageProgress,
        camera.aspect,
        0,
        pointerTilt.x,
        pointerTilt.y,
        true,
      );
      sharedUniforms.uDisperse.value = pose.disperse;
      sharedUniforms.uShatterBurst.value = pose.shatterBurst;
      sharedUniforms.uCrimsonShift.value = targetCrimsonShift;
      brainGroup.position.set(pose.x, pose.y, pose.z);
      brainGroup.rotation.set(pose.rotX, pose.rotY, 0);
      brainGroup.scale.setScalar(pose.scale);
      renderer.render(scene, camera);
    };

    const refreshLandmarksAndTarget = () => {
      landmarks = measureStageLandmarks();
      promptsBounds = measurePromptsBounds();
      targetStageProgress = computeStageProgress(window.scrollY, landmarks);
      targetCrimsonShift = computeCrimsonShift(
        window.scrollY,
        promptsBounds.top,
        promptsBounds.bottom,
        window.innerHeight,
      );
      if (prefersReducedMotion) {
        applyReducedMotionSnapshot();
      }
    };

    const updateScrollTarget = () => {
      targetStageProgress = computeStageProgress(window.scrollY, landmarks);
      targetCrimsonShift = computeCrimsonShift(
        window.scrollY,
        promptsBounds.top,
        promptsBounds.bottom,
        window.innerHeight,
      );
      if (prefersReducedMotion) {
        applyReducedMotionSnapshot();
      }
    };
    refreshLandmarksAndTarget();
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    document.fonts?.ready?.then(() => {
      if (!disposed) refreshLandmarksAndTarget();
    });

    let lastContainerWidth = width;
    let lastContainerHeight = height;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      lastContainerWidth = w;
      lastContainerHeight = h;
      const nextAspect = w / h;
      camera.aspect = nextAspect;
      camera.position.z = nextAspect < 1.0 ? 12.2 : 9.6;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      refreshLandmarksAndTarget();
    };
    window.addEventListener('resize', handleResize);

    const layoutObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            if (Math.abs(w - lastContainerWidth) > 1 || Math.abs(h - lastContainerHeight) > 1) {
              handleResize();
            } else {
              refreshLandmarksAndTarget();
            }
          })
        : null;
    layoutObserver?.observe(document.body);
    layoutObserver?.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerActive = true;
      pointerTilt.y = pointerNDC.x * 0.22;
      pointerTilt.x = -pointerNDC.y * 0.14;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('[role="dialog"], button, a, input, select, textarea')) return;

      pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      if (raycaster.ray.intersectPlane(interactionPlane, intersectPoint)) {
        localMousePoint.copy(intersectPoint);
        brainGroup.worldToLocal(localMousePoint);
        sharedUniforms.uPulseOrigin.value.copy(localMousePoint);
        sharedUniforms.uPulseTime.value = (performance.now() - startTime) / 1000;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
    };

    const handleContextRestored = () => {
      contextLost = false;
      lastTime = performance.now();
      if (prefersReducedMotion) {
        applyReducedMotionSnapshot();
      } else {
        renderFrame();
      }
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Initialize initial pose immediately from current scroll stage
    smoothStageProgress = targetStageProgress;
    const initialPose = computeBrainChoreography(
      smoothStageProgress,
      aspect,
      0,
      0,
      0,
      Boolean(prefersReducedMotion),
    );
    brainGroup.position.set(initialPose.x, initialPose.y, initialPose.z);
    brainGroup.rotation.set(initialPose.rotX, initialPose.rotY, 0);
    brainGroup.scale.setScalar(initialPose.scale);
    sharedUniforms.uDisperse.value = initialPose.disperse;
    sharedUniforms.uShatterBurst.value = initialPose.shatterBurst;
    sharedUniforms.uCrimsonShift.value = targetCrimsonShift;

    function afterDraw(cb: () => void) {
      if (disposed || contextLost) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed || contextLost) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function renderFrame() {
      if (disposed || contextLost) return;
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      smoothStageProgress = THREE.MathUtils.damp(
        smoothStageProgress,
        targetStageProgress,
        6.2,
        delta,
      );

      const pose = computeBrainChoreography(
        smoothStageProgress,
        camera.aspect,
        elapsed,
        pointerTilt.x,
        pointerTilt.y,
        Boolean(prefersReducedMotion),
      );

      sharedUniforms.uDisperse.value = THREE.MathUtils.damp(
        sharedUniforms.uDisperse.value,
        pose.disperse,
        7.5,
        delta,
      );
      sharedUniforms.uShatterBurst.value = THREE.MathUtils.damp(
        sharedUniforms.uShatterBurst.value,
        pose.shatterBurst,
        7.5,
        delta,
      );
      sharedUniforms.uCrimsonShift.value = THREE.MathUtils.damp(
        sharedUniforms.uCrimsonShift.value,
        targetCrimsonShift,
        4.2,
        delta,
      );

      brainGroup.position.x = THREE.MathUtils.damp(brainGroup.position.x, pose.x, 5.4, delta);
      brainGroup.position.y = THREE.MathUtils.damp(brainGroup.position.y, pose.y, 5.4, delta);
      brainGroup.position.z = THREE.MathUtils.damp(brainGroup.position.z, pose.z, 5.4, delta);
      const nextScale = THREE.MathUtils.damp(brainGroup.scale.x, pose.scale, 5.4, delta);
      brainGroup.scale.setScalar(nextScale);

      if (!prefersReducedMotion) {
        sharedUniforms.uTime.value = elapsed;
        brainGroup.rotation.y = THREE.MathUtils.damp(brainGroup.rotation.y, pose.rotY, 5.2, delta);
        brainGroup.rotation.x = THREE.MathUtils.damp(brainGroup.rotation.x, pose.rotX, 5.2, delta);
      } else {
        brainGroup.rotation.set(pose.rotX, pose.rotY, 0);
      }

      if (pointerActive) {
        raycaster.setFromCamera(pointerNDC, camera);
        if (raycaster.ray.intersectPlane(interactionPlane, intersectPoint)) {
          localMousePoint.copy(intersectPoint);
          brainGroup.worldToLocal(localMousePoint);
          sharedUniforms.uMouse.value.lerp(localMousePoint, 0.22);
        }
      }

      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(renderFrame);
      } else {
        frameId = requestAnimationFrame(renderFrame);
      }
    }

    if (prefersReducedMotion) {
      applyReducedMotionSnapshot();
    } else {
      renderFrame();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      layoutObserver?.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      leftCortexShellGeo.dispose();
      rightCortexShellGeo.dispose();
      corpusCallosumGeo.dispose();
      leftCerebShellGeo.dispose();
      rightCerebShellGeo.dispose();
      stemShellGeo.dispose();
      shellMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      facetGeometry.dispose();
      facetMaterial.dispose();
      ptGeometry.dispose();
      ptMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div
        data-testid="neural-brain-fallback"
        className={`fixed inset-0 z-0 pointer-events-none flex items-center justify-end opacity-60 ${className}`}
      >
        <img
          src="assets/cerebro.png"
          alt="Modelo anatômico do cérebro neural"
          className="h-[74vh] w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      data-testid="neural-brain-canvas"
      aria-label="Cérebro neural 3D anatômico ampliado com alta densidade de dobras em ciano e azul"
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
}
