import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { smoothScrollToId } from '../utils/smoothScroll';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      if (!progressRef.current) return;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string, closeMobile = false) => {
    e.preventDefault();
    if (closeMobile) setMobileOpen(false);
    smoothScrollToId(id);
  };

  return (
    <header className="glass-nav sticky top-0 z-40 w-full">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-6 py-4 sm:px-10 lg:px-14">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#topo"
          onClick={(e) => handleNavClick(e, 'topo')}
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
        >
          Prompta
        </a>

        {/* Zone 2: 4 concise single-line navigation links matching page order */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300"
        >
          <a
            href="#trilhas"
            onClick={(e) => handleNavClick(e, 'trilhas')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
          >
            Fases
          </a>
          <a
            href="#kiwify-seguranca"
            onClick={(e) => handleNavClick(e, 'kiwify-seguranca')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
          >
            Como Comprar
          </a>
          <a
            href="#cursos"
            onClick={(e) => handleNavClick(e, 'cursos')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
          >
            Curso (em breve)
          </a>
          <a
            href="#prompts"
            onClick={(e) => handleNavClick(e, 'prompts')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-sm"
          >
            Prompts
          </a>
          <a
            href="#duvidas"
            onClick={(e) => handleNavClick(e, 'duvidas')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
          >
            Dúvidas
          </a>
        </nav>

        {/* Zone 3: Single primary glass CTA + Mobile toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="prompo-constroe/"
            className="glass-btn-primary hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide text-white transition-all duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Conhecer o Kit
          </a>
          <button
            type="button"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="glass-btn-secondary inline-flex md:hidden items-center justify-center rounded-xl p-2 text-zinc-200 min-w-[44px] min-h-[44px]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass-surface border-t border-white/10 px-6 py-4 md:hidden">
          <nav
            aria-label="Menu mobile"
            className="flex flex-col gap-3 text-sm font-medium text-zinc-200"
          >
            <a href="#trilhas" onClick={(e) => handleNavClick(e, 'trilhas', true)} className="py-2 hover:text-white">
              Fases do Curso
            </a>
            <a
              href="#kiwify-seguranca"
              onClick={(e) => handleNavClick(e, 'kiwify-seguranca', true)}
              className="py-2 hover:text-white"
            >
              Como Comprar
            </a>
            <a href="#cursos" onClick={(e) => handleNavClick(e, 'cursos', true)} className="py-2 hover:text-white">
              Curso de IA (em breve)
            </a>
            <a href="#prompts" onClick={(e) => handleNavClick(e, 'prompts', true)} className="py-2 hover:text-white">
              Prompts de IA
            </a>
            <a href="#duvidas" onClick={(e) => handleNavClick(e, 'duvidas', true)} className="py-2 hover:text-white">
              Dúvidas Frequentes
            </a>
            <a
              href="prompo-constroe/"
              className="glass-btn-primary mt-2 w-full rounded-full px-5 py-3 text-center text-xs font-semibold text-white"
            >
              Conhecer o Kit Prompo-Constroe
            </a>
          </nav>
        </div>
      )}

      {/* Subtle compositor-only scroll progress indicator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-white/[0.04]"
      >
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-gradient-to-r from-[#2563EB] via-[#2EE6D6] to-[#BAE6FD]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </header>
  );
}
