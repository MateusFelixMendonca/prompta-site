import type { MouseEvent } from 'react';
import { smoothScrollToId } from '../utils/smoothScroll';

export default function Footer() {
  const handleLink = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollToId(id);
  };

  return (
    <footer className="border-t border-white/[0.08] bg-transparent py-14 lg:py-16">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-14">
        <div className="glass-surface flex flex-col justify-between gap-6 rounded-2xl px-7 py-8 lg:flex-row lg:items-center">
          <div>
            <span className="font-display text-base font-semibold tracking-tight text-white">
              Prompta
            </span>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-300/80">
              Prompts e kits de IA prontos para usar · Curso de IA em breve · Pagamentos pela Kiwify
            </p>
          </div>

          <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-300">
            <a
              href="#trilhas"
              onClick={(e) => handleLink(e, 'trilhas')}
              className="hover:text-white transition-colors whitespace-nowrap py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
            >
              Fases
            </a>
            <a
              href="#kiwify-seguranca"
              onClick={(e) => handleLink(e, 'kiwify-seguranca')}
              className="hover:text-white transition-colors whitespace-nowrap py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
            >
              Como Comprar
            </a>
            <a
              href="#cursos"
              onClick={(e) => handleLink(e, 'cursos')}
              className="hover:text-white transition-colors whitespace-nowrap py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
            >
              Curso
            </a>
            <a
              href="#prompts"
              onClick={(e) => handleLink(e, 'prompts')}
              className="hover:text-white transition-colors whitespace-nowrap py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-sm"
            >
              Prompts
            </a>
            <a
              href="#duvidas"
              onClick={(e) => handleLink(e, 'duvidas')}
              className="hover:text-white transition-colors whitespace-nowrap py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] rounded-sm"
            >
              Dúvidas
            </a>
          </nav>

          <p className="text-xs text-zinc-400 whitespace-nowrap">
            © 2026 Prompta. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
