# Workbench UI

Biblioteca pública `@workbench/ui`, base obrigatória de código, interface e experiência de **todos os apps atuais e futuros do Workbench**, baseada em shadcn/ui (**Base UI / base-nova**), React e Tailwind CSS v4. Repositório: https://github.com/majapisoftwares/workbench-ui.

## Regra central

**Contribuir para a biblioteca antes de customizar o app.** Quando um produto precisa de uma variante ou comportamento reutilizável, a mudança deve ser implementada aqui com documentação e exemplo. O produto passa a consumir a versão publicada. Não mantenha cópias, forks ou overrides visuais locais dos componentes.

Composição de páginas, lógica de domínio, dados e permissões pertencem ao app. Primitivos, variantes, tokens e comportamentos reutilizáveis pertencem à biblioteca. Consulte [AGENTS.md](AGENTS.md) e [docs/STANDARDS.md](docs/STANDARDS.md).

## Catálogo visual

```powershell
npm ci
npm run dev
```

Abra http://127.0.0.1:4318. O catálogo permite revisar componentes, temas claro/escuro, tabela com busca/ordenação/paginação/filtro, detalhes e estados de vazio/erro/carregamento. Usa dados demonstrativos explícitos, sem AWS ou credenciais.

## Consumir

Pacote distribuído pelo repositório Git público, com commit fixo no package.json e lockfile do consumidor, sem exigir credenciais para leitura. O campo private no package.json impede publicação acidental no npm e não torna o repositório privado. O pacote exporta fontes TSX para bundlers React/TypeScript (Vite ou Next.js), não para execução direta em Node sem transformação.

```tsx
import { Button } from "@workbench/ui/components/button";
import { DataTable } from "@workbench/ui/patterns/data-table";
import { AdminDashboard } from "@workbench/ui/templates/admin-dashboard";
import { AuthLayout } from "@workbench/ui/templates/auth-layout";
import { LoginForm } from "@workbench/ui/templates/login-form";
import { SignupForm } from "@workbench/ui/templates/signup-form";
import "@workbench/ui/styles.css";
```

O CSS inclui os tokens, fontes locais e o Tailwind, com `@source` da biblioteca. O app precisa processar esse CSS com Tailwind v4. Faça dedupe de react/react-dom no Vite se estiver desenvolvendo com um checkout local. Dependências de catálogo, como Vite, não entram no código executado pelo consumidor.

## Contribuir e validar

Templates iniciais: **AdminDashboard**, **AuthLayout**, **LoginForm** e **SignupForm**. Configure marca, navegação, textos, dados, ações e conteúdo por props/slots React. Variações de tema são definidas e documentadas na biblioteca. Formulários recebem callbacks tipados; autenticação real, validação no servidor, sessões e autorização pertencem ao app. O catálogo demonstra os templates sem enviar ou persistir senhas.

1. Leia o padrão e procure o primitivo/padrão existente.
2. Adicione uma API reutilizável ou variante oficial, com defaults compatíveis.
3. Documente motivos, estados e migração; adicione exemplo no catálogo.
4. Valide tipos, lint, padrões, build, teclado e visual desktop/mobile.
5. Publique o commit e atualize o consumidor para esse commit; registre no plano.

```powershell
npm run typecheck
npm run lint
npm run check:standards
npm run build
git diff --check
```

Os componentes foram instalados pelo CLI shadcn 4.22.1, preset base-nova e Base UI 1.9.0. A versão 0.2 migra a base anterior Radix; veja [docs/MIGRATION-0.2.md](docs/MIGRATION-0.2.md). Atribuição upstream: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). O Cloud Manager é o primeiro consumidor real.
