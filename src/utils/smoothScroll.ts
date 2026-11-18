import { useEffect } from 'react';
import { stepInertiaScroll, type StageLandmarks } from './scrollChoreography';

export function measureStageLandmarks(): StageLandmarks {
  const vh = window.innerHeight || 900;
  const headerOffset = 74;

  const getSectionTop = (id: string, fallback: number): number => {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.round(rect.top + window.scrollY - headerOffset));
  };

  const heroY = 0;
  const tracksY = getSectionTop('trilhas', vh * 0.95);
  const securityY = getSectionTop('kiwify-seguranca', tracksY + vh * 0.95);
  const prePricingEl = document.getElementById('precos-transicao');
  const prePricingY = prePricingEl
    ? Math.max(
        securityY + 120,
        Math.round(prePricingEl.getBoundingClientRect().top + window.scrollY - vh * 0.16),
      )
    : securityY + vh * 0.65;
  const pricingGridEl = document.getElementById('cursos-conteudo');
  const pricingY = pricingGridEl
    ? Math.max(
        prePricingY + 140,
        Math.round(pricingGridEl.getBoundingClientRect().top + window.scrollY - Math.max(160, vh * 0.28)),
      )
    : getSectionTop('cursos', prePricingY + vh * 0.55);

  return { heroY, tracksY, securityY, prePricingY, pricingY };
}

type SmootherBridge = {
  scrollToY: (y: number) => void;
};

let activeBridge: SmootherBridge | null = null;

/**
 * Programmatic smooth scroll that routes through the active inertial Scroll Smoother
 * whenever enabled, falling back cleanly on touch or reduced-motion devices.
 */
export function smoothScrollToId(id: string) {
  if (typeof window === 'undefined') return;
  const targetId = id.replace(/^#/, '');

  if (targetId === 'topo') {
    if (activeBridge) {
      activeBridge.scrollToY(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  const el =
    targetId === 'cursos'
      ? document.getElementById('cursos-conteudo') || document.getElementById('cursos')
      : document.getElementById(targetId);
  if (!el) return;

  const headerOffset = targetId === 'cursos' ? 92 : 74;
  const rect = el.getBoundingClientRect();
  const destY = Math.max(0, Math.round(rect.top + window.scrollY - headerOffset));

  if (activeBridge) {
    activeBridge.scrollToY(destY);
  } else {
    window.scrollTo({ top: destY, behavior: 'smooth' });
  }
}

/**
 * Fluid continuous inertia Scroll Smoother on desktop with zero magnetic snapping.
 * Yields immediately when modals are open, on touch scrolling, or when reduced motion is active.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;

    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let selfScrolling = false;
    let isAnimating = false;
    let rafId = 0;
    let lastTime = performance.now();

    const getMaxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const isModalOpen = () => Boolean(document.querySelector('[role="dialog"]'));

    const writeScrollY = (y: number) => {
      selfScrolling = true;
      window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
      requestAnimationFrame(() => {
        selfScrolling = false;
      });
    };

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const step = stepInertiaScroll(currentY, targetY, dt, 6.4);
      currentY = step.y;
      writeScrollY(currentY);

      if (step.settled) {
        isAnimating = false;
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isAnimating) return;
      isAnimating = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || isModalOpen()) return;

      // Allow native scrolling inside nested scrollable containers (e.g. modals/selects)
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('[data-native-scroll], [role="dialog"]')) return;

      e.preventDefault();

      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= 36;
      else if (e.deltaMode === 2) deltaY *= window.innerHeight * 0.85;

      targetY = Math.min(getMaxScroll(), Math.max(0, targetY + deltaY));
      startLoop();
    };

    const handleNativeScroll = () => {
      if (selfScrolling) return;
      targetY = window.scrollY;
      currentY = window.scrollY;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen()) return;
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

      const vh = window.innerHeight;
      if (e.key === 'Home') {
        e.preventDefault();
        targetY = 0;
        startLoop();
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        targetY = getMaxScroll();
        startLoop();
        return;
      }

      let step = 0;
      if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) step = vh * 0.82;
      else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) step = -vh * 0.82;
      else if (e.key === 'ArrowDown') step = 120;
      else if (e.key === 'ArrowUp') step = -120;

      if (step !== 0) {
        e.preventDefault();
        targetY = Math.min(getMaxScroll(), Math.max(0, targetY + step));
        startLoop();
      }
    };

    const handleResize = () => {
      const max = getMaxScroll();
      targetY = Math.min(max, targetY);
      currentY = Math.min(max, currentY);
    };

    activeBridge = {
      scrollToY: (y: number) => {
        targetY = Math.min(getMaxScroll(), Math.max(0, y));
        startLoop();
      },
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleNativeScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      activeBridge = null;
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleNativeScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}
