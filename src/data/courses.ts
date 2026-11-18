export type CourseLevel = 'basico' | 'intermediario' | 'avancado' | 'especializacoes';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  levelLabel: string;
  tools: string[];
  outcomes: string[];
}

export interface LearningTrack {
  index: string;
  title: string;
  levelLabel: string;
  description: string;
  accentHex: string;
}

export interface CatalogStat {
  value: string;
  label: string;
  detail: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const CATALOG_STATS: CatalogStat[] = [
  { value: 'Em breve', label: 'Curso de IA', detail: 'Formação do básico ao avançado em produção' },
  { value: '4 fases', label: 'Trilha planejada', detail: 'Dos primeiros prompts até vídeo com IA' },
  { value: '1 kit', label: 'Já disponível', detail: 'Kit Prompo-Constroe para o Claude Code' },
  { value: '7 dias', label: 'Garantia Kiwify', detail: 'Reembolso direto pela plataforma' },
];

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    index: '01',
    title: 'Fundamentos & Engenharia de Prompt',
    levelLabel: 'Fase 1 · Básico',
    description:
      'Comece do zero: entenda como os modelos pensam e escreva prompts estruturados no ChatGPT, no Claude e no Gemini.',
    accentHex: '#2EE6D6',
  },
  {
    index: '02',
    title: 'Automações & Fluxos Reais',
    levelLabel: 'Fase 2 · Intermediário',
    description:
      'Conecte a IA a planilhas, WhatsApp e e-mail com ferramentas como n8n e Make para tirar as tarefas repetitivas do seu dia.',
    accentHex: '#38BDF8',
  },
  {
    index: '03',
    title: 'Agentes & Assistentes',
    levelLabel: 'Fase 3 · Avançado',
    description:
      'Monte assistentes que consultam os seus documentos, usam ferramentas e trabalham por você em projetos reais.',
    accentHex: '#60A5FA',
  },
  {
    index: '04',
    title: 'Vídeo, Imagem & Produção',
    levelLabel: 'Fase 4 · Multimídia',
    description:
      'Produza vídeos, anúncios e imagens com IA mantendo o mesmo estilo do começo ao fim, como os vídeos do nosso kit.',
    accentHex: '#818CF8',
  },
];

export const FLAGSHIP_COURSE: Course = {
  id: 'prompta-ia-completo',
  title: 'Formação Prompta: IA do Básico ao Avançado',
  subtitle:
    'Um curso único que vai levar você do primeiro prompt até automações, agentes e criação de vídeos e imagens com IA. Estamos gravando: as inscrições abrem em breve.',
  levelLabel: 'Básico ao Avançado',
  tools: ['ChatGPT', 'Claude', 'Gemini', 'n8n', 'Vídeo com IA'],
  outcomes: [
    'Escrever prompts que funcionam de primeira, sem saber programar',
    'Automatizar tarefas do dia a dia com IA e ferramentas sem código',
    'Criar assistentes que trabalham com os seus próprios documentos',
    'Produzir vídeos e imagens com IA para o seu negócio ou perfil',
  ],
};

export const FAQS: FaqItem[] = [
  {
    question: 'Quando o curso de IA da Prompta abre?',
    answer:
      'O curso está em produção. Enquanto isso, o primeiro produto da Prompta já está disponível: o Kit Prompo-Constroe, que faz vídeos 3D de obra em corte com o Claude Code.',
  },
  {
    question: 'O que é o Kit Prompo-Constroe?',
    answer:
      'É uma pasta de prompts e ferramentas que você abre no Claude Code. Você conversa com o Claude e ele escreve o roteiro, monta as cenas em 3D, sincroniza com a sua narração e entrega o vídeo vertical pronto para postar. Tem 3 planos: Básico (R$ 37), Melhor Kit (R$ 67) e Avançado (R$ 147).',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'O pagamento é feito no checkout oficial da Kiwify, com PIX, cartão ou boleto. Assim que o pagamento é aprovado, o acesso chega no seu e-mail e o kit fica na área de membros da Kiwify.',
  },
  {
    question: 'E se eu não gostar?',
    answer:
      'Todos os produtos têm 7 dias de garantia. Se não for para você, peça o reembolso pela própria Kiwify e recebe o valor de volta.',
  },
];
