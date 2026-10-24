# Workbench Next.js starter

Template independente de aplicativo com **Next.js 16.4.3**, React 19.3.1, TypeScript strict, App Router, Tailwind v4 e **@majapisoftwares/ui 0.2 / shadcn Base UI** já configurados. Gerado inicialmente por create-next-app 16.4.3 e adaptado para consumir a biblioteca compartilhada sem cópias de componentes.

## Executar

Requer Node.js 22 ou 24. O projeto não precisa de secrets nem de outros checkouts locais.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. `/` leva a `/dashboard`; há também `/login` e `/signup`, além de estados de carregamento, erro e página não encontrada. O dashboard tem dados demonstrativos explícitos, tabela com busca/filtro/ordenação/paginação e painel de detalhes.

Os formulários demonstram a UI e não enviam nem persistem credenciais. Dashboard não é uma área autenticada neste starter. O produto deve implementar autenticação, sessão, proteção de rotas, autorização e validação no servidor antes de conectar dados reais. Nunca trate o callback demonstrativo como login concluído.

## Estrutura

- `src/app`: páginas/layout Server Components por padrão, metadata e fronteiras de erro/carregamento.
- `src/components`: composição de domínio em Client Components, importando diretamente `@majapisoftwares/ui`.
- `src/lib/demo.ts`: dataset ilustrativo substituível por dados autorizados no servidor.
- `src/app/globals.css`: importa os tokens/estilos da biblioteca; não contém overrides de componentes.
- `next.config.ts`: `transpilePackages`, cache components e o loader Tailwind/Turbopack gerado pelo Next.js 16.4.3. Root fixo no próprio projeto, independente do diretório pai.
- `AGENTS.md`: regras de contribuição upstream e guias da versão instalada do Next.js.
- `.github/workflows/validate.yml`: CI do app gerado.

## Contribuir ao padrão

Antes de customizar um componente, leia https://github.com/majapisoftwares/workbench-ui/blob/main/AGENTS.md. Se faltar uma capacidade reutilizável, contribua à biblioteca com API genérica, exemplo e documentação; publique e atualize o commit fixo em package.json/lockfile. Não copie shadcn, não crie components/ui local e não adicione CSS overrides nos apps.

A base é Base UI: composição usa `render`, não `asChild`. Para links com Button: `render={<Link href="..." />}` e `nativeButton={false}`. Veja exemplos no starter.

## Verificar

```sh
npm run lint
npm run typecheck
npm run check:ui
npm run build
npm start
```

`next` e `eslint-config-next` estão fixados em 16.4.3; a UI usa um commit público imutável com integridade no lockfile. ESLint 9 corresponde aos peers dos plugins do config oficial desta versão; não force ESLint 10 sem atualizar esses peers. Consulte `node_modules/next/dist/docs/` para as convenções da versão instalada.
