# Padrão v1 de código e UI/UX

Base atual: shadcn base-luma com @base-ui/react. Os componentes interativos expõem fronteiras use client para uso no Next.js App Router. A migração da API Radix está documentada em MIGRATION-0.2.md.

## Arquitetura e código

TypeScript em modo strict, React com componentes funcionais e composição. APIs genéricas tipadas; sem any para contornar contratos, estado derivado duplicado ou dependências de domínio na UI. Imports públicos por subpath, internos relativos. Dependências e lockfile versionados. Interface, acesso a dados, autorização e operações de infraestrutura permanecem separados. Entradas externas são validadas no servidor; erros e resultados incompletos são explícitos.

## Base visual

`src/styles.css` é a fonte dos tokens de cor, tipografia, raio, bordas, foco, estados e estrutura. Preset base-luma do shadcn (o mesmo da home de ui.shadcn.com: cantos bem arredondados, campos com fundo suave, sombras leves) sobre o tema neutral, fonte Geist, foco visível e espaço consistente. Cores são semânticas: background, foreground, primary, muted, destructive, success e warning. Temas claro/escuro preservam a semântica. Tokens e padrões podem evoluir nesta biblioteca, nunca por overrides locais em um produto.

Primitivos shadcn ficam em src/components/ui (Button, Badge, Card, Input, Table, Sheet, Sidebar, Tooltip, DropdownMenu, ContextMenu, Breadcrumb, Avatar, Checkbox, Collapsible, Alert, Empty, Select, Separator, Skeleton, Tabs, Field e Label). Padrões compostos: AppShell, PageHeader, MetricStrip, StatusBadge, DataTable, DetailsSheet, DetailList, Preferences, PreferenceControls e MajapiLogo. Templates React: AdminDashboard, AuthLayout, LoginForm e SignupForm. Marca, navegação, textos, dados, ações e slots são configuráveis. Todos os apps atuais e futuros devem consumir esta base pública; ela não conhece AWS ou outro domínio.

## Comportamentos de UX

- Ação primária destaca o objetivo; secundária usa outline/secondary; destrutiva usa variante própria e depende das autorizações do app.
- Busca, filtros, ordenação por coluna e paginação seguem DataTable (TanStack Table; origem: tabela da Numa). Filtros por coluna usam `meta.filter`; preferências do usuário persistem por `storageKey`. Telas centradas em uma tabela usam `AppShell fillHeight` + `DataTable fillHeight`: a tabela ocupa a altura restante e rola internamente, com cabeçalho, busca e paginação sempre visíveis.
- Áreas com rolagem interna usam `scroll-fade` do shadcn (só `scroll-fade-b` quando há cabeçalho fixo dentro do contêiner) e as barras de rolagem finas globais, que aparecem com o ponteiro sobre a área e seguem o tema (`color-scheme`).
- Espaçamento da página em uma escala só: padding, gap entre seções e entre cards de 16px no mobile e 24px a partir de md; o cabeçalho da página e o da sidebar têm a mesma altura (56px). Filtros de domínio são slots tipados do app. Não reconstruir tabelas por tela. Persistência não é habilitada por padrão para evitar guardar buscas sensíveis; quando necessária, deve evoluir como capacidade compartilhada com controle explícito.
- Estados com texto e cor: sucesso, aviso, erro e desconhecido. Nunca traduzir ausência de informação em zero ou sucesso.
- Carregamento usa Skeleton, vazio usa Empty, falhas usam Alert e detalhes usam DetailsSheet com título, descrição, foco preso ao overlay, Escape e devolução do foco ao fechar.
- Em telas pequenas, controles têm texto de pelo menos 16px e alvo de 44px, navegação se reorganiza e tabelas têm rolagem interna, sem rolagem horizontal da página.
- Preferência por movimento reduzido é respeitada. A ordem de leitura deve acompanhar a ordem visual. Ícones sozinhos exigem nome acessível.
- Distinguir dados demonstrativos de dados reais; mostrar observação e cobertura em telas de infraestrutura. Todo texto existe em inglês e português (`defineMessages`); texto mínimo, sem descrições que não ajudem a tarefa.

## Evolução sem customizações isoladas

Uma necessidade reutilizável entra na biblioteca por prop, variante, token ou novo padrão documentado. Não adicionar props específicas como awsAccountId a componentes genéricos. Novas variantes preservam defaults; mudanças incompatíveis exigem versão/migração explícitas e atualização coordenada dos consumidores. A versão semântica identifica a API, e o commit Git fixo identifica o código efetivamente consumido.

AGENTS.md nos apps exige contribuição upstream antes de uso. O verificador estático bloqueia primitivas locais e cores avulsas em consumidores; não substitui revisão humana de design, acessibilidade e comportamento. O catálogo e o primeiro consumidor devem ser revisados em navegador.

## Adaptações do upstream

- Imports internos relativos e `"use client"` são aplicados por `npm run normalize:ui` após o CLI do shadcn.
- Sheet traduz o nome acessível do fechamento pelo idioma ativo.
- Sidebar: três modos (open/compact/closed), largura redimensionável (208–448px) com troca de modo por largura, menu de clique direito, tooltip que fecha ao clicar e textos traduzidos.
- use-mobile usa useSyncExternalStore (compatível com SSR e com a regra de hooks).
- Field usa imports relativos. Button assume type=button para evitar submissões acidentais; formulários declaram type=submit. Badge inclui variantes success e warning reutilizadas por StatusBadge.
- Tokens de identidade, estados semânticos e padrões compostos são mantidos aqui.
- Mudanças posteriores no upstream devem ser avaliadas com o diff do CLI, preservando estas decisões e o contrato público.
