# Migração para 6.0

Visual padrão do shadcn (tema neutral, Geist), textos em inglês e português e nova sidebar.

## Idiomas

Envolva o app com `Preferences` (idioma + tema) ou `LocaleProvider`. Os textos embutidos da biblioteca seguem o idioma ativo. Textos do app vão em `defineMessages({ en, "pt-BR" })` e são lidos com `useMessages`.

## AppShell / AdminDashboard

- `brand`, `brandMark` → `logo` (marca quadrada, fica fixa em todos os modos) e `name` (texto que some em fade no modo compacto).
- `navigation` passa a ser uma lista de grupos: `[{ label?, items: [...] }]`.
- `context` → `header` (ex.: breadcrumb) e `actions` (ex.: `PreferenceControls`).
- `defaultMode` (`open` | `compact` | `closed`) e `defaultWidth` opcionais; o estado é salvo no cookie `sidebar_state` (`parseSidebarCookie` lê no servidor).
- `AdminDashboard`: `actions` da página → `pageActions`; `description` opcional.

## Autenticação

- `AuthLayout`: `title`, `description`, `aside`, `brandMark` removidos; `brand` e `footer` opcionais.
- `LoginForm`/`SignupForm`: títulos e rótulos têm padrão traduzido; props de texto continuam aceitas para sobrescrever.

## Outros

- `PageHeader`: `eyebrow` removido, `description` opcional.
- `DetailsSheet`: `description` opcional.
- `DataTable` agora é a tabela completa da Numa, sobre TanStack Table:
  - `columns` são `ColumnDef` do TanStack (`accessorKey`/`accessorFn`, `cell`, `meta: { label, align, filter }`); `rows` → `data`.
  - Busca global embutida (`searchPlaceholder`, `initialGlobalFilter`); `searchValue`/`searchLabel`/`defaultQuery` saem.
  - `onOpen`/`rowLabel` → `onRowClick`/`getRowLabel`; `filters` → `toolbarStart`/`toolbarEnd`/`toolbarBelow` (recebem a instância da tabela).
  - Filtros por coluna (`text`, `multi` com incluir/excluir, `number-range`, `date-range`, `custom`), ordenação múltipla, colunas reordenáveis/ocultáveis/redimensionáveis, seleção de linhas e persistência em `localStorage` com `storageKey`.
  - Estados mantidos: `loading`, `error` + `onRetry`, `warning`, `unavailable`, `emptyState`/`emptyMessage`.
- Classes `wb-*` removidas.
- `NativeSelect` removido: use `Select` (Base UI) com `items` para o rótulo do valor. O `check:ui` acusa imports de `native-select`. Variante `navigation` do Button removida.
