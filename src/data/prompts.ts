export interface KitPlan {
  id: 'basico' | 'melhor' | 'avancado';
  name: string;
  tagline: string;
  priceCents: number;
  checkoutUrl: string;
  recommended?: boolean;
  features: string[];
  cta: string;
}

export interface PromptPack {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  categoryLabel: string;
  tools: string[];
  fromPriceCents: number;
}

export const KIT_PLANS: KitPlan[] = [
  {
    id: 'basico',
    name: 'Básico',
    tagline: 'Para testar o formato',
    priceCents: 3700,
    checkoutUrl: 'https://pay.kiwify.com.br/JOQztmx',
    cta: 'Quero o Básico',
    features: [
      'Kit para o Claude Code',
      'Motor 3D, ferramentas de render e conferência',
      '6 personagens prontos',
      'Fórmula do roteiro + 30 ganchos',
      '3 projetos de exemplo completos',
      'Efeitos sonoros automáticos',
      'Guia em PDF da instalação ao primeiro post',
    ],
  },
  {
    id: 'melhor',
    name: 'Melhor Kit',
    tagline: 'O kit inteiro + 3 temas de bônus',
    priceCents: 6700,
    checkoutUrl: 'https://pay.kiwify.com.br/UKJXjcO',
    recommended: true,
    cta: 'Quero o Melhor Kit',
    features: [
      'Tudo do Básico',
      'Vô Prompo animado: anda, aponta e comemora',
      'Trilha completa com música e efeitos',
      'Lugares reais e estádios',
      '+3 projetos de estádio prontos',
      '100 ganchos separados por tema',
      'Bônus: Mar, História e Corpo em Corte',
    ],
  },
  {
    id: 'avancado',
    name: 'Avançado',
    tagline: 'Para transformar o perfil em canal',
    priceCents: 14700,
    checkoutUrl: 'https://pay.kiwify.com.br/MShzKxj',
    cta: 'Quero o Avançado',
    features: [
      'Tudo do Melhor Kit',
      '8 videoaulas do zero ao primeiro post',
      'Vídeo longo para o YouTube',
      'Cortes: 1 vídeo longo vira vários curtos',
      'Plano de postagem de 30 dias',
      'Guia de monetização',
      'Receita para criar o seu próprio tema',
    ],
  },
];

export const PROMPT_PACKS: PromptPack[] = [
  {
    id: 'kit-prompo-constroe',
    href: 'prompo-constroe/',
    title: 'Kit Prompo-Constroe',
    subtitle:
      'Vídeos 3D de obra em corte feitos conversando com o Claude Code. Roteiro, cenas, narração sincronizada, sons, capa e legenda saem prontos para postar, sem programar e sem editar vídeo.',
    categoryLabel: 'Geração de Vídeo',
    tools: ['Claude Code', 'ElevenLabs'],
    fromPriceCents: 3700,
  },
];
