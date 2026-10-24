# Migração 0.1 → 0.2: shadcn sobre Base UI

A base inicial era radix-nova. A versão 0.2 usa base-nova e @base-ui/react 1.9.0, regenerados pelo CLI oficial shadcn em diretório limpo e adaptados para preservar os contratos do Workbench. Tokens, estilos compartilhados, variantes navigation/success/warning e nomes dos padrões permanecem.

## Mudanças de API

- Primitivas com composição usam render, não asChild. Exemplo: `<Button render={<Link href="/dashboard" />} nativeButton={false}>Dashboard</Button>`.
- Sheet usa Dialog de Base UI, com Backdrop/Popup e composição render. Os padrões DetailsSheet e DetailList mantêm suas props.
- Badge usa useRender/mergeProps de Base UI. Button usa ButtonPrimitive.Props. Considere essas mudanças incompatíveis para consumidores diretos das primitivas antigas.
- Componentes e padrões interativos têm use client explícito. Dados vindos do servidor devem ser serializáveis; callbacks de UI e definição de colunas com funções ficam em Client Components.
- Não importe radix-ui ou @radix-ui diretamente nos consumidores. O verificador de padrões detecta esses imports.

## Atualizar um produto

1. Atualize a dependência @majapisoftwares/ui para o commit publicado da versão 0.2 e regenere o lockfile.
2. Substitua asChild por render e nativeButton=false em links/triggers não nativos.
3. Preserve imports dos padrões compostos, evitando reimplementar o comportamento no produto.
4. Execute typecheck, lint/padrões, build e verificações de navegação, foco, overlays, campos e telas menores.

O starter Next.js é o caminho padrão para novos apps. Autenticação real e permissões continuam sendo responsabilidade do produto, sem fallback ou simulação de login.
