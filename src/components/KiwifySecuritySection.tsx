import { ChevronDown, CreditCard, Lock, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { FAQS } from '../data/courses';

type FlowTabId = 'pix' | 'card' | 'webhook';

interface FlowTabDetail {
  id: FlowTabId;
  label: string;
  headline: string;
  summary: string;
  guarantees: { label: string; value: string }[];
}

const FLOW_TABS: FlowTabDetail[] = [
  {
    id: 'pix',
    label: 'PIX',
    headline: 'Pague com PIX e receba o acesso na hora',
    summary:
      'No checkout da Kiwify você gera o QR Code ou o código copia e cola. Assim que o pagamento é confirmado, o acesso chega no seu e-mail.',
    guarantees: [
      { label: 'Onde paga', value: 'Checkout Kiwify' },
      { label: 'Confirmação', value: 'Automática' },
      { label: 'Acesso', value: 'Por e-mail' },
    ],
  },
  {
    id: 'card',
    label: 'Cartão',
    headline: 'Cartão de crédito com parcelamento',
    summary:
      'Pague no cartão direto no checkout oficial da Kiwify, com as opções de parcelamento que aparecem na hora da compra. Os dados do cartão ficam só com a Kiwify.',
    guarantees: [
      { label: 'Onde paga', value: 'Checkout Kiwify' },
      { label: 'Parcelamento', value: 'No checkout' },
      { label: 'Dados do cartão', value: 'Só na Kiwify' },
    ],
  },
  {
    id: 'webhook',
    label: 'Garantia',
    headline: '7 dias para testar sem risco',
    summary:
      'Comprou e não era o que esperava? Dentro de 7 dias você pede o reembolso pela própria Kiwify e recebe o valor de volta.',
    guarantees: [
      { label: 'Prazo', value: '7 dias' },
      { label: 'Onde pedir', value: 'Na Kiwify' },
      { label: 'Vale para', value: 'Todos os planos' },
    ],
  },
];

export default function KiwifySecuritySection() {
  const [activeFlow, setActiveFlow] = useState<FlowTabId>('pix');

  const currentFlow = FLOW_TABS.find((t) => t.id === activeFlow) || FLOW_TABS[0];

  return (
    <section
      id="kiwify-seguranca"
      className="border-t border-white/[0.08] bg-transparent py-20 lg:min-h-[94vh] lg:flex lg:items-center lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-10 lg:px-14">
        {/* 3-Zone Split Grid: Left copy & payment explorer | Empty central corridor for top-down Brain | Right security cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Side: Section title + Interactive Kiwify Payment Flow Explorer */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div>
              <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#2EE6D6]">
                COMO COMPRAR
              </p>
              <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl [text-wrap:balance]">
                Pagamento seguro pela Kiwify e acesso na hora
              </h2>
              <p className="mt-2.5 text-xs leading-relaxed text-zinc-300/85 sm:text-sm">
                Ao escolher um plano, você vai para o checkout oficial da Kiwify. Lá você paga com
                PIX, cartão ou boleto, e a Kiwify cuida de todo o pagamento.
              </p>
            </div>

            <div className="glass-surface-featured flex flex-col justify-between rounded-2xl p-6">
              <div>
                <div
                  role="tablist"
                  aria-label="Formas de pagamento e garantia"
                  className="glass-surface flex flex-wrap items-center gap-1.5 rounded-2xl p-1.5"
                >
                  {FLOW_TABS.map((tab) => {
                    const active = activeFlow === tab.id;
                    const Icon =
                      tab.id === 'pix' ? QrCode : tab.id === 'card' ? CreditCard : ShieldCheck;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveFlow(tab.id)}
                        className={`relative inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6] ${
                          active ? 'text-white' : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="kiwifyFlowTab"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            className="glass-btn-primary absolute inset-0 rounded-xl"
                            aria-hidden="true"
                          />
                        )}
                        <Icon className="relative z-10 h-3.5 w-3.5 text-[#2EE6D6]" aria-hidden="true" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-white">
                  {currentFlow.headline}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-200/90 sm:text-[13px]">
                  {currentFlow.summary}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-white/[0.1] pt-4">
                {currentFlow.guarantees.map((item) => (
                  <div key={item.label}>
                    <div className="font-mono text-[10px] leading-tight text-zinc-400">{item.label}</div>
                    <div className="mt-1 font-display text-xs font-semibold text-white tabular-nums sm:text-[13px]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Open Corridor: 100% clear for the top-down centered 3D Brain */}
          <div className="hidden lg:block lg:col-span-4 lg:min-h-[460px]" aria-hidden="true" />

          {/* Right Side: Stacked Server-Side & Instant Member Cards */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <div className="glass-surface rounded-2xl p-6">
              <div className="glass-btn-secondary flex h-10 w-10 items-center justify-center rounded-xl text-[#2EE6D6]">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Checkout oficial da Kiwify
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300/85 sm:text-[13.5px]">
                A Prompta não recebe nem guarda os dados do seu cartão. Todo o pagamento acontece
                dentro da Kiwify, uma das maiores plataformas de produtos digitais do Brasil.
              </p>
            </div>

            <div className="glass-surface rounded-2xl p-6">
              <div className="glass-btn-secondary flex h-10 w-10 items-center justify-center rounded-xl text-[#38BDF8]">
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Acesso na área de membros
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300/85 sm:text-[13.5px]">
                Com o pagamento aprovado, você recebe um e-mail da Kiwify com o acesso. O kit e as
                aulas ficam na área de membros, para baixar quando quiser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function KiwifyFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="duvidas" className="border-t border-white/[0.08] bg-transparent py-20 lg:py-28">
      <div className="mx-auto max-w-[920px] px-6 sm:px-10">
        <div className="flex items-center gap-2 font-mono text-xs font-medium tracking-[0.14em] text-[#2EE6D6]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>DÚVIDAS FREQUENTES</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-white">
          Perguntas sobre a Prompta, o kit e o pagamento
        </h2>

        <div className="glass-surface mt-10 divide-y divide-white/[0.08] rounded-2xl">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-white transition-colors hover:bg-white/[0.04] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2EE6D6]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-300 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2EE6D6]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-zinc-300/90">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
