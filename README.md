# Prompta

Site da Prompta: página inicial (kits de prompts e curso de IA em breve) e a página de vendas do Kit Prompo-Constroe em `/prompo-constroe/`.

Site estático (React + Vite + Tailwind), publicado pelo GitHub Pages a cada push na branch `main` (`.github/workflows/deploy.yml`).

## Rodar no computador

```bash
npm install
npm run dev
```

## Onde mudar as coisas

- Links de checkout e planos do kit: `src/data/prompts.ts`
- Textos do curso (em breve) e perguntas da home: `src/data/courses.ts`
- Página de vendas do kit: `src/kit/KitPage.tsx`
- Vídeos e imagens da página do kit: `public/media/`
