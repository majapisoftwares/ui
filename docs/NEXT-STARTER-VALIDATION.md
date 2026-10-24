# Validação do starter Next.js e Base UI

- Next.js e create-next-app 16.4.3 conferidos no registry npm e na documentação oficial; React 19.3.1; UI 0.2 com shadcn base-nova e @base-ui/react 1.9.0.
- Biblioteca regenerada pelo CLI oficial shadcn em diretório limpo, preservando tokens e variantes compartilhadas. Imports diretos de Radix removidos; fronteiras use client explícitas nas primitivas e padrões interativos.
- Biblioteca: typecheck, ESLint, verificação de padrões e build Vite aprovados.
- Starter: lint, typegen/TypeScript, check:ui e build Next.js de produção aprovados para /dashboard, /login e /signup.
- Um projeto independente foi criado pelo comando create:app e validado com npm ci, lint, tipos, padrões e build. O projeto não depende de um checkout local da biblioteca.
- Teste do gerador confirma nome/lockfile coerentes, rotas, regras de agentes, workflow, ausência de node_modules e recusa de sobrescrita de diretório existente.
- npm pack --dry-run foi inspecionado: starter incluído, sem node_modules, .next, tsbuildinfo ou arquivos de ambiente no pacote.
- Navegador com build de produção: dashboard, navegação para login/cadastro, painel de detalhes Base UI, devolução de foco ao fechar, console sem erros/warnings e revisão de cadastro em viewport mobile de 500px.
- As telas usam dados demonstrativos explícitos. Nenhuma credencial foi enviada nem conta criada; autenticação real e proteção das rotas são integração do produto consumidor.
- Cloud Manager atualizado para a mesma UI Base UI: build, types, padrões e 20 testes passaram.

A CI pública valida tanto a biblioteca quanto o starter Next.js. O processo de produção local do starter foi aberto em http://127.0.0.1:4319 para revisão. Não houve deploy público nem provisionamento de infraestrutura.
