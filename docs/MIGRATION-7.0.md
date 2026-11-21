# Migração para 7.0 (Base UI → ui-sdk)

A 7.0 troca a base de comportamento de todos os componentes: sai `@base-ui/react`, entra o **ui-sdk da Vercel** (`@ui-sdk/react` + `@ui-sdk/core`, Apache-2.0, ainda **beta** `0.1.0-beta.10`, versão fixada exata). Os nomes dos exports e as variantes visuais foram mantidos; mudam callbacks, alguns props e os atributos de estado. É um **major**: a publicação não é automática (veja docs/VERSIONING.md: commit com `Release-As: major`).

## Em todo app

- `@base-ui/react` deixa de ser dependência. Não importe mais de `@base-ui/*` (o `check:standards` bloqueia).
- O CSS global deve declarar `@layer ui-sdk;` antes de tudo (o `styles.css` da biblioteca já faz isso).
- `Button`: remova `nativeButton`; o ui-sdk detecta `render={<Link/>}` sozinho.
- Callbacks `onXChange(valor, detalhes)`: `detalhes` agora é o `ChangeDetails` do ui-sdk (`reason`, `cancel()`), não os eventDetails do Base UI. Os `reason` são outros.
- `render` continua (elemento ou função); a função recebe `(props, state)` do ui-sdk. Filhos em forma de função (`children={(state) => ...}`) só onde o ui-sdk os aceita.
- Seletores Tailwind de estado: `data-popup-open`, `data-checked`, `data-active`, `data-horizontal/vertical`, `data-[state=on]`, `data-panel-open` → `data-open`/`data-closed`, `data-selected`, `data-pressed`, `data-[orientation=...]`, `data-highlighted` (no lugar de `focus:` em itens de menu). Animações de overlay usam `data-starting-style`/`data-ending-style`.
- `*Portal`, `Positioner` e wrappers equivalentes viraram passthrough ou sumiram: o conteúdo faz portal sozinho.

## Por componente

- **Dialog / AlertDialog / Popover / HoverCard / Tooltip**: `onOpenChange(open, details)` com detalhes do ui-sdk. `DialogContent` já inclui o overlay. `TooltipTrigger` perde `delay`/`closeDelay` (use no `Tooltip` ou `TooltipProvider`); `HoverCardTrigger` idem (use no `HoverCard`). Filhos de conteúdo não aceitam função.
- **Sheet**: `side` passa de `SheetContent` para o `Sheet`; agora é um drawer (arrasta para fechar).
- **DropdownMenu / ContextMenu**: item `onClick` → `onSelect(event)` (ou `onAction(value)` na raiz); `closeOnClick` → `closeOnSelect`; `CheckboxItem` e `RadioItem` exigem `value`; raízes e `Sub` não renderizam elemento DOM; itens desabilitados continuam focáveis (`aria-disabled`).
- **Select**: reexporta o Select do ui-sdk. `items` só no formato array (`{value,label}[]`, strings, `{type:"separator"}`, `{type:"group"}`); sem `Record`; `SelectValue` não aceita função como filho (use `placeholder`); `SelectScrollUp/DownButton` não renderizam nada; `data-checked` → `data-selected`; valores que são objetos exigem `itemToValue`.
- **Checkbox**: `onCheckedChange` pode receber `"indeterminate"`; o prop `indeterminate` some (use `checked="indeterminate"`).
- **Slider**: `thumbAlignment` removido; `onValueChange` recebe `details.thumb` no lugar de `activeThumbIndex`; novo `onValueCommit`.
- **Toggle / ToggleGroup**: `data-[state=on]` → `data-pressed`; `children` só ReactNode.
- **Progress**: `ProgressValue` com filho em função muda de assinatura.
- **Tabs**: `onValueChange(value: string | null, details)`; `group-data-horizontal/tabs` → `group-data-[orientation=horizontal]/tabs`; `data-active` → `data-selected`.
- **Accordion / Collapsible**: sem as keyframes `animate-accordion-*`; a altura vem de `--accordion-panel-height` / `--collapsible-panel-height`.
- **Toast**: removidos `ToastProvider`, `ToastPortal`, `useToastManager`; `Toaster` recebe `toaster` (não `toastManager`); `Toast` não recebe mais `toast={item}`; prioridades `high`/`low` mapeiam para `assertive`/`polite`; só a pilha inferior está estilizada. `toast.add`, `toast.close`, `toastError` e `errorMessage` seguem iguais; `toast(...)`, `success`, `error`, `promise` etc. são novos.
- **Badge, Item, Marker, Bubble, Breadcrumb, Attachment, ButtonGroup, Sidebar**: `render` agora tipado como `RenderProp` do ui-sdk; props de elemento comuns; sem `useRender.ComponentProps`.
- **Command** (novo): paleta de comandos sobre o ui-sdk.

## Riscos conhecidos

- O ui-sdk é beta (`0.1.0-beta.x`): a API dele pode mudar entre versões; por isso fica fixado exato.
- A refatoração foi validada por typecheck, lint, testes e build (`npm run verify`); a revisão visual em desktop/mobile dos componentes trocados ainda deve ser feita no catálogo antes de atualizar os apps.
