# Padrão v1 de código e UI/UX

Base atual: shadcn base-nova com @base-ui/react. Os componentes interativos expõem fronteiras use client para uso no Next.js App Router. A migração da API Radix está documentada em MIGRATION-0.2.md.

## Arquitetura e código

TypeScript em modo strict, React com componentes funcionais e composição. APIs genéricas tipadas; sem any para contornar contratos, estado derivado duplicado ou dependências de domínio na UI. Imports públicos por subpath, internos relativos. Dependências e lockfile versionados. Interface, acesso a dados, autorização e operações de infraestrutura permanecem separados. Entradas externas são validadas no servidor; erros e resultados incompletos são explícitos.

## Base visual

`src/styles.css` é a fonte dos tokens de cor, tipografia, raio, bordas, foco, estados e estrutura. Paleta neutra com ação primária terracota; body Geist, títulos Georgia; foco visível e espaço consistente. Cores são semânticas: background, foreground, primary, muted, destructive, success e warning. Temas claro/escuro preservam a semântica. Tokens e padrões podem evoluir nesta biblioteca, nunca por overrides locais em um produto.

Os 13 primitivos shadcn são Button, Badge, Input, Table, Sheet, Alert, Empty, NativeSelect, Separator, Skeleton, Tabs, Field e Label. Os sete padrões compostos são AppShell, PageHeader, MetricStrip, StatusBadge, DataTable, DetailsSheet e DetailList. Os quatro templates React são AdminDashboard, AuthLayout, LoginForm e SignupForm. Marca, navegação, textos, dados, ações e slots são configuráveis. Todos os apps atuais e futuros devem consumir esta base pública; ela não conhece AWS ou outro domínio.

## Comportamentos de UX

- Ação primária destaca o objetivo; secundária usa outline/secondary; destrutiva usa variante própria e depende das autorizações do app.
- Busca, filtros, ordenação por coluna e paginação seguem DataTable. Filtros de domínio são slots tipados do app. Não reconstruir tabelas por tela. Persistência não é habilitada por padrão para evitar guardar buscas sensíveis; quando necessária, deve evoluir como capacidade compartilhada com controle explícito.
- Estados com texto e cor: sucesso, aviso, erro e desconhecido. Nunca traduzir ausência de informação em zero ou sucesso.
- Carregamento usa Skeleton, vazio usa Empty, falhas usam Alert e detalhes usam DetailsSheet com título, descrição, foco preso ao overlay, Escape e devolução do foco ao fechar.
- Em telas pequenas, controles têm texto de pelo menos 16px e alvo de 44px, navegação se reorganiza e tabelas têm rolagem interna, sem rolagem horizontal da página.
- Preferência por movimento reduzido é respeitada. A ordem de leitura deve acompanhar a ordem visual. Ícones sozinhos exigem nome acessível.
- Distinguir dados demonstrativos de dados reais; mostrar observação e cobertura em telas de infraestrutura. Comunicação e labels em português no v1.

## Evolução sem customizações isoladas

Uma necessidade reutilizável entra na biblioteca por prop, variante, token ou novo padrão documentado. Não adicionar props específicas como awsAccountId a componentes genéricos. Novas variantes preservam defaults; mudanças incompatíveis exigem versão/migração explícitas e atualização coordenada dos consumidores. A versão semântica identifica a API, e o commit Git fixo identifica o código efetivamente consumido.

AGENTS.md nos apps exige contribuição upstream antes de uso. O verificador estático bloqueia primitivas locais e cores avulsas em consumidores; não substitui revisão humana de design, acessibilidade e comportamento. O catálogo e o primeiro consumidor devem ser revisados em navegador.

## Adaptações do upstream

- Sheet usa import interno relativo para funcionar como pacote e traduz o nome acessível do fechamento para português.
- Field usa imports relativos. Button assume type=button para evitar submissões acidentais; formulários declaram type=submit. Badge inclui variantes success e warning reutilizadas por StatusBadge.
- Tokens de identidade, estados semânticos e padrões compostos são mantidos aqui.
- Mudanças posteriores no upstream devem ser avaliadas com o diff do CLI, preservando estas decisões e o contrato público.
