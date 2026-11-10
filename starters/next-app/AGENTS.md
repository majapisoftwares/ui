# Padrão obrigatório do app Workbench

- DataTable gerencia resets de paginação após o commit; não reproduza resets agendados durante render em consumidores Suspense/StrictMode. Preserve paginação, busca e ordenação compartilhadas.

- O app é bilíngue (en e pt-BR). Todo texto de UI fica em `src/messages.ts` via `defineMessages`; nada de texto fixo em componentes. Mantenha o texto mínimo.
- Teste localmente com portless: `npm run dev` publica o app em https://<nome-do-diretório>.localhost. Não use portas fixas.
- Use a versão estável mais recente do Next.js e a versão atual de @majapisoftwares/ui.

- A base de UI/UX é a biblioteca pública @majapisoftwares/ui, já instalada neste projeto. Leia https://github.com/majapisoftwares/workbench-ui/blob/main/docs/STANDARDS.md e o AGENTS.md da biblioteca.
- Não copie primitivas shadcn, não crie components/ui e não use overrides locais. Se faltar capacidade reutilizável, contribua primeiro na biblioteca com documentação/exemplo, publique e atualize o commit fixo deste app.
- A base de primitivas é Base UI (base-luma). Use render, não asChild; links via Button exigem nativeButton=false.
- App Router: páginas/layout são Server Components por padrão. Interação e callbacks de UI ficam em Client Components; não envie funções comuns pela fronteira servidor/cliente.
- Não coloque secrets ou dados sensíveis no bundle. Os dados e callbacks demonstrativos não são autenticação: implemente sessão, autorização e validação no servidor antes de conectar dados reais.
- Valide npm run lint, npm run typecheck, npm run check:ui, npm run build e navegador desktop/mobile antes de publicar.
- Publique código e evidências no GitHub, atualizando o plano do projeto. Publicar código não autoriza deploy de produção ou geração de custos.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
