# Padrão obrigatório da Majapi

- Apps e catálogo usam a versão estável mais recente do Next.js (confira com `npm view next version` antes de mudar dependências). O catálogo (`catalog/`) é um app Next.js como qualquer outro, com a mesma estrutura do starter; não use Vite nem outro framework.
- Toda mudança na biblioteca que afete apps entra no mesmo commit no starter (`starters/next-app`) e no catálogo. O starter sempre depende da versão atual da biblioteca (o teste `npm run test:starter` falha se divergir) e deve compilar e passar lint/typecheck/build com ela.
- Todo app é bilíngue: inglês (`en`) e português (`pt-BR`). Textos de UI ficam em catálogos `defineMessages` com as duas línguas; nada de texto fixo em componentes. Use `Preferences`/`PreferenceControls` da biblioteca para idioma e tema.
- Mantenha o texto mínimo: sem descrições, avisos ou rótulos que não ajudem a tarefa.
- `patterns/data-table` (TanStack Table, vindo da Numa) é a única tabela de dados: filtros por coluna, ordenação múltipla, colunas reordenáveis/ocultáveis/redimensionáveis, seleção, persistência e estados. Melhorias de tabela são feitas aqui e chegam a todos os apps por versão; apps não mantêm cópias próprias.
- Ao trazer componentes de outros apps, remova sobrescritas visuais (arredondamento, altura, sombra, padding, cores) e deixe os primitivos da biblioteca definirem o visual; containers usam os raios já adotados aqui (ex.: rounded-2xl em tabelas e listas).
- Seleção usa sempre o Select (Base UI) da biblioteca; não use select nativo nem NativeSelect (o check:standards bloqueia).
- Versionamento segue docs/VERSIONING.md (SemVer sobre a API pública). Prefira mudanças aditivas e deprecação a remoções; major só com aprovação explícita do responsável.
- Teste localmente com portless (`npm run dev` já roda via portless; o catálogo abre em https://majapi-ui.localhost). Não use portas fixas nem localhost:PORT nas instruções.

- Novos apps web devem partir de starters/next-app, criado por npm run create:app -- <diretorio-novo>. O starter usa a versão estável do Next.js fixada e validada no manifesto; atualizações devem manter lockfile, CI e revisão de compatibilidade.

- A base de primitivas é shadcn sobre Base UI (base-luma), não Radix. Use render para composição e nativeButton=false quando Button renderizar Link/a. Preserve as fronteiras use client da biblioteca em consumidores Next.js.

- Esta biblioteca pública é a base obrigatória de todos os apps atuais e futuros da Majapi, incluindo administrativos, dashboards, login e cadastro. Leia README.md e docs/STANDARDS.md antes de alterar interfaces.
- Antes de criar UI em um app, procure o componente, variante ou padrão existente aqui. Reutilize-o diretamente como dependência.
- Se faltar uma capacidade reutilizável, contribua primeiro para esta biblioteca: adicione uma API genérica, documente o comportamento e mostre o uso no catálogo. Depois atualize o app para o commit publicado.
- Não copie componentes shadcn para apps, não faça forks locais e não use CSS, classes ou wrappers locais para corrigir cores, tipografia, tamanho, estados ou comportamento de um componente compartilhado.
- Adaptações específicas de domínio e composição de layout ficam no app; capacidades compartilhadas, tokens e variantes ficam aqui. Não traga AWS, autenticação, secrets ou modelos de negócio para a biblioteca.
- Use o CLI oficial shadcn para adicionar componentes. Preserve a licença upstream e registre adaptações em docs/STANDARDS.md. Imports internos da biblioteca devem ser relativos, sem aliases particulares do consumidor.
- className nos apps é para layout. Mudanças visuais precisam de tokens, variantes ou padrões oficiais. Evite controles HTML crus quando houver um componente da biblioteca.
- Todos os fluxos devem incluir estados carregando, vazio, erro, parcial e indisponível quando aplicáveis. Não esconda falhas ou altere dados para o exemplo parecer funcionar.
- Preserve acessibilidade: nome acessível, foco visível, navegação por teclado, título e descrição de overlays, labels em campos, e texto junto aos estados.
- Antes de publicar: npm run typecheck, npm run lint, npm run check:standards, npm run build, git diff --check e revisão visual em desktop/mobile. Teste comportamentos novos de risco, sem testes que apenas espelhem markup.
- Publique código e evidências no GitHub e vincule os commits ao PLAN.md central. Registre breaking changes e migração antes de atualizar consumidores.
