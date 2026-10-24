"use client";
"use no memo";

// Ported from the Numa app's data table (majapisoftwares/numa); this is now the
// canonical copy. Effects below intentionally sync restored localStorage
// preferences and incoming props into table state.
/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CircleAlertIcon,
  InboxIcon,
  LockIcon,
  RotateCwIcon,
  TriangleAlertIcon,
  ArrowDownWideNarrowIcon,
  ArrowUpDownIcon,
  ArrowUpNarrowWideIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  EyeOffIcon,
  FunnelIcon,
  FunnelXIcon,
  GripVerticalIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import {
  createTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnSizingState,
  type FilterFn,
  type Header,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type TableOptions,
  type TableOptionsResolved,
  type VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { FilterTabs } from "./filter-tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../components/ui/input-group";
import { Label } from "../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { cn } from "cn";
import { defineMessages, useMessages, useUiMessages } from "../lib/i18n";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/ui/empty";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "../components/ui/alert";

export type DataTableColumnAlign = "left" | "center" | "right";
type DataTableSortDirection = false | "asc" | "desc";

export type DataTableFilterOption = {
  label: string;
  value: string;
};

export type DataTableRangeFilter = {
  min?: string;
  max?: string;
};

export type DataTableDateRangeFilter = {
  from?: string;
  to?: string;
};

// Multi-select filter value: an array keeps the matching rows; the object form
// hides the selected values instead. Server-filtered tables only receive arrays.
export type DataTableMultiFilterValue =
  string[] | { exclude: true; values: string[] };

export type DataTableColumnFilter<TData extends RowData> =
  | {
      placeholder?: string;
      type: "text";
    }
  | {
      options: DataTableFilterOption[];
      type: "multi";
    }
  | {
      max?: number;
      maxPlaceholder?: string;
      min?: number;
      minPlaceholder?: string;
      type: "number-range";
    }
  | {
      type: "date-range";
    }
  | {
      render: (column: Column<TData, unknown>) => React.ReactNode;
      type: "custom";
    };

export type DataTableColumnMeta<TData extends RowData> = {
  align?: DataTableColumnAlign;
  cellClassName?: string;
  filter?: DataTableColumnFilter<TData>;
  headerClassName?: string;
  label?: string;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: DataTableColumnAlign;
    cellClassName?: string;
    filter?: DataTableColumnFilter<TData>;
    headerClassName?: string;
    label?: string;
    valueType?: TValue;
  }

  interface TableMeta<TData extends RowData> {
    enableExcludeFilters?: boolean;
    rowType?: TData;
  }
}

/** Window event that clears a table's search and filters (detail: { storageKey? }). */
export const DATA_TABLE_RESET_FILTERS_EVENT =
  "majapi-ui:data-table:reset-filters";

/** Clears search and filters of every table, or only the one with `storageKey`. */
export function resetDataTableFilters(storageKey?: string) {
  window.dispatchEvent(
    new CustomEvent(DATA_TABLE_RESET_FILTERS_EVENT, { detail: { storageKey } }),
  );
}

const dataTableMessages = defineMessages({
  en: {
    search: "Search...",
    resultCount: (count: number) =>
      `${count} ${count === 1 ? "result" : "results"}`,
    rowCount: (count: number) => `${count} ${count === 1 ? "row" : "rows"}`,
    // English needs no plural form here; pt-BR uses count.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selected: (rows: string, count: number) => `${rows} selected`,
    clearSelection: "Clear selection",
    clearFilters: "Clear filters",
    open: "Open",
    resizeColumn: (label: string) => `Resize column ${label}`,
    filterActive: ", filter active",
    excludeFilterActive: ", exclusion filter active",
    sortCriterion: (n: number) => `Sort #${n}`,
    sortCriterionTitle: (n: number) => `Sort criterion #${n}`,
    clearAll: "Clear all",
    hide: "Hide",
    toggleSort: (label: string) => `Toggle sorting for ${label}`,
    reorderColumn: (label: string) => `Reorder column ${label}`,
    sort: "Sort",
    removeSort: "Remove sort",
    ascending: "Ascending",
    descending: "Descending",
    filter: "Filter",
    min: "Min.",
    max: "Max.",
    filterBy: (label: string) => `Filter by ${label}`,
    filterMode: "Filter mode",
    show: "Show",
    exclude: "Exclude",
    valuesToExclude: "Values to exclude",
    valuesToShow: "Values to show",
    customizeColumns: "Customize columns",
    columnsTooltip: "Show, hide and reset columns",
    columns: "Columns",
    resetColumns: "Reset columns",
    rowsPerPage: "Rows",
    page: (page: number, total: number) => `Page ${page} of ${total}`,
    ofSummary: (part: string, total: string) => `${part} of ${total}.`,
    firstPage: "First page",
    previousPage: "Previous page",
    nextPage: "Next page",
    lastPage: "Last page",
  },
  "pt-BR": {
    search: "Buscar...",
    resultCount: (count: number) =>
      `${count} resultado${count === 1 ? "" : "s"}`,
    rowCount: (count: number) => `${count} registro${count === 1 ? "" : "s"}`,
    selected: (rows: string, count: number) =>
      `${rows} selecionado${count === 1 ? "" : "s"}`,
    clearSelection: "Limpar seleção",
    clearFilters: "Limpar filtros",
    open: "Abrir",
    resizeColumn: (label: string) => `Redimensionar coluna ${label}`,
    filterActive: ", filtro ativo",
    excludeFilterActive: ", filtro de exclusão ativo",
    sortCriterion: (n: number) => `${n}º critério`,
    sortCriterionTitle: (n: number) => `${n}º critério de ordenação`,
    clearAll: "Limpar tudo",
    hide: "Ocultar",
    toggleSort: (label: string) => `Alternar ordenação da coluna ${label}`,
    reorderColumn: (label: string) => `Reordenar coluna ${label}`,
    sort: "Ordenar",
    removeSort: "Remover ordem",
    ascending: "Crescente",
    descending: "Decrescente",
    filter: "Filtrar",
    min: "Mín.",
    max: "Máx.",
    filterBy: (label: string) => `Filtrar por ${label}`,
    filterMode: "Modo do filtro",
    show: "Mostrar",
    exclude: "Excluir",
    valuesToExclude: "Valores a excluir",
    valuesToShow: "Valores a mostrar",
    customizeColumns: "Personalizar colunas",
    columnsTooltip: "Mostrar, ocultar e restaurar colunas",
    columns: "Colunas",
    resetColumns: "Restaurar colunas",
    rowsPerPage: "Linhas",
    page: (page: number, total: number) => `Página ${page} de ${total}`,
    ofSummary: (part: string, total: string) => `${part} de ${total}.`,
    firstPage: "Primeira página",
    previousPage: "Página anterior",
    nextPage: "Próxima página",
    lastPage: "Última página",
  },
});

type StoredDataTableSettings = {
  columnFilters?: ColumnFiltersState;
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnVisibility?: VisibilityState;
  globalFilter?: string;
  pageSize?: number;
  sorting?: SortingState;
};

export type DataTableProps<TData extends RowData> = {
  activeRowId?: string | null;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Text when there are no rows; defaults to a translated message. */
  emptyMessage?: string;
  /** Rich empty state (e.g. with a create action), shown when nothing is filtered. */
  emptyState?: React.ReactNode;
  /**
   * Fills the parent's height and scrolls rows inside the table (sticky
   * header, toolbar and pagination stay visible). The parent must be a flex
   * column with a bounded height, e.g. `AppShell fillHeight`.
   */
  fillHeight?: boolean;
  /** Shows skeleton rows instead of data. */
  loading?: boolean;
  /** Load failure. With rows it shows as stale data; without, replaces the table. */
  error?: string;
  onRetry?: () => void;
  /** Non-blocking notice, e.g. partial coverage. */
  warning?: string;
  /** Data can't be shown at all, e.g. missing permission. */
  unavailable?: string;
  enablePersistence?: boolean;
  enableRowSelection?: boolean;
  // Offers "Excluir" in multi-select column filters. Defaults to off for
  // server-backed tables (onStateChange), whose APIs only read include arrays.
  enableExcludeFilters?: boolean;
  filterFns?: Record<string, FilterFn<TData>>;
  formatResultCount?: (count: number) => string;
  formatRowCount?: (count: number) => string;
  formatSelectedRowCount?: (count: number) => string;
  getRowId: (row: TData) => string;
  globalFilterFn?: FilterFn<TData>;
  initialColumnFilters?: ColumnFiltersState;
  /** Initial search text. */
  initialGlobalFilter?: string;
  /** Makes rows clickable (and Enter/Space activatable), e.g. to open details. */
  onRowClick?: (row: TData) => void;
  /** Accessible name for a clickable row; defaults to its id. */
  getRowLabel?: (row: TData) => string;
  initialColumnOrder?: ColumnOrderState;
  initialColumnVisibility?: VisibilityState;
  initialPageSize?: number;
  initialSorting?: SortingState;
  lockedEndColumnIds?: string[];
  lockedStartColumnIds?: string[];
  manualFiltering?: boolean;
  manualPagination?: boolean;
  manualSorting?: boolean;
  onStateChange?: (state: DataTableStateSnapshot) => void;
  pageCount?: number;
  pageSizeOptions?: number[];
  rowCount?: number;
  rowSelectionActions?: (table: TanstackTable<TData>) => React.ReactNode;
  searchPlaceholder?: string;
  /** Persists sorting, filters, columns and page size in localStorage under this key. */
  storageKey?: string;
  toolbarBelow?: (table: TanstackTable<TData>) => React.ReactNode;
  toolbarEnd?: (table: TanstackTable<TData>) => React.ReactNode;
  toolbarStart?: (table: TanstackTable<TData>) => React.ReactNode;
};

export type DataTableStateSnapshot = {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
  sorting: SortingState;
};

export type DataTableFilterTab = {
  count?: number;
  label: string;
  value: string;
};

type DataTableObjectFilter = DataTableRangeFilter & DataTableDateRangeFilter;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStringProperty(value: unknown, key: string) {
  if (!isRecord(value)) {
    return undefined;
  }

  const property = value[key];
  return typeof property === "string" ? property : undefined;
}

function readStringArrayFilter(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function readMultiFilterValue(value: unknown): {
  exclude: boolean;
  values: string[];
} {
  if (isRecord(value) && value.exclude === true) {
    return { exclude: true, values: readStringArrayFilter(value.values) };
  }

  return { exclude: false, values: readStringArrayFilter(value) };
}

function toMultiFilterValue(
  exclude: boolean,
  values: string[],
): DataTableMultiFilterValue | undefined {
  if (values.length === 0) {
    return undefined;
  }

  return exclude ? { exclude: true, values } : values;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function readRangeFilterValue(value: unknown): DataTableRangeFilter {
  return {
    max: readStringProperty(value, "max"),
    min: readStringProperty(value, "min"),
  };
}

function readDateRangeFilterValue(value: unknown): DataTableDateRangeFilter {
  return {
    from: readStringProperty(value, "from"),
    to: readStringProperty(value, "to"),
  };
}

function readObjectFilterValue(value: unknown): Partial<DataTableObjectFilter> {
  return {
    ...readRangeFilterValue(value),
    ...readDateRangeFilterValue(value),
  };
}

export function createArrayIncludesSomeFilter<
  TData extends RowData,
>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    const { exclude, values } = readMultiFilterValue(filterValue);

    if (values.length === 0) {
      return true;
    }

    return values.includes(row.getValue(columnId)) !== exclude;
  };
}

export function createNumberInRangeFilter<
  TData extends RowData,
>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    const range = readRangeFilterValue(filterValue);
    const min = range?.min ? Number(range.min) : null;
    const max = range?.max ? Number(range.max) : null;
    const value = Number(row.getValue(columnId));

    if (min !== null && Number.isFinite(min) && value < min) {
      return false;
    }

    if (max !== null && Number.isFinite(max) && value > max) {
      return false;
    }

    return true;
  };
}

export function createDateInRangeFilter<
  TData extends RowData,
>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    const range = readDateRangeFilterValue(filterValue);
    const value = new Date(row.getValue<string>(columnId)).getTime();
    const from = range?.from
      ? new Date(`${range.from}T00:00:00`).getTime()
      : null;
    const to = range?.to ? new Date(`${range.to}T23:59:59`).getTime() : null;

    if (from !== null && Number.isFinite(from) && value < from) {
      return false;
    }

    if (to !== null && Number.isFinite(to) && value > to) {
      return false;
    }

    return true;
  };
}

export function getSingleArrayFilterValue(
  filterValue: unknown,
): "all" | "custom" | string {
  const { exclude, values } = readMultiFilterValue(filterValue);

  if (exclude && values.length > 0) {
    return "custom";
  }

  if (values.length === 0) {
    return "all";
  }

  if (values.length === 1) {
    return values[0] ?? "all";
  }

  return "custom";
}

export function DataTableColumnFilterTabs<TData extends RowData>({
  className,
  columnId,
  options,
  table,
}: {
  className?: string;
  columnId: string;
  options: DataTableFilterTab[];
  table: TanstackTable<TData>;
}) {
  const column = table.getColumn(columnId);
  const value = getSingleArrayFilterValue(column?.getFilterValue());

  const handleValueChange = (nextValue: string) => {
    column?.setFilterValue(nextValue === "all" ? undefined : [nextValue]);
  };

  return (
    <FilterTabs
      className={className}
      onValueChange={handleValueChange}
      options={options}
      value={value}
    />
  );
}

export function createDataTableFilterTabOptions<TItem>(
  items: TItem[],
  filters: Array<Pick<DataTableFilterTab, "label" | "value">>,
  getItemValue: (item: TItem) => string,
) {
  return filters.map((filter) => ({
    ...filter,
    count:
      filter.value === "all"
        ? undefined
        : items.filter((item) => getItemValue(item) === filter.value).length,
  }));
}

function getColumnId<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): string | null {
  if ("id" in column && column.id) {
    return column.id;
  }

  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return column.accessorKey;
  }

  return null;
}

function normalizeColumnOrder(
  columnOrder: ColumnOrderState | undefined,
  defaultColumnOrder: ColumnOrderState,
  lockedStartColumnIds: string[],
  lockedEndColumnIds: string[],
) {
  const validColumns = new Set(defaultColumnOrder);
  const lockedStart = lockedStartColumnIds.filter((columnId) =>
    validColumns.has(columnId),
  );
  const lockedEnd = lockedEndColumnIds.filter((columnId) =>
    validColumns.has(columnId),
  );
  const lockedColumns = new Set([...lockedStart, ...lockedEnd]);
  const movableColumns = (columnOrder ?? []).filter(
    (columnId) => validColumns.has(columnId) && !lockedColumns.has(columnId),
  );

  for (const columnId of defaultColumnOrder) {
    if (!lockedColumns.has(columnId) && !movableColumns.includes(columnId)) {
      movableColumns.push(columnId);
    }
  }

  return [...lockedStart, ...movableColumns, ...lockedEnd];
}

function areColumnOrdersEqual(left: ColumnOrderState, right: ColumnOrderState) {
  return (
    left.length === right.length &&
    left.every((columnId, index) => columnId === right[index])
  );
}

function getColumnMeta<TData extends RowData>(column: Column<TData, unknown>) {
  return column.columnDef.meta;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>) {
  const header = column.columnDef.header;

  return (
    getColumnMeta(column)?.label ??
    (typeof header === "string" ? header : column.id)
  );
}

function getColumnAlign<TData extends RowData>(column: Column<TData, unknown>) {
  return getColumnMeta(column)?.align ?? "left";
}

function getColumnAlignClass<TData extends RowData>(
  column: Column<TData, unknown>,
) {
  const align = getColumnAlign(column);

  return cn(
    align === "center" && "text-center",
    align === "right" && "text-right",
  );
}

function getColumnAriaSort(
  isSorted: DataTableSortDirection,
): "ascending" | "descending" | undefined {
  if (!isSorted) {
    return undefined;
  }

  return isSorted === "asc" ? "ascending" : "descending";
}

function getHeaderControlVisibilityClass(isVisible: boolean) {
  if (isVisible) {
    return "pointer-events-auto opacity-100";
  }

  return "pointer-events-none opacity-0 group-focus-within/header:pointer-events-auto group-focus-within/header:opacity-100 group-hover/header:pointer-events-auto group-hover/header:opacity-100";
}

function hasRangeFilter(value: unknown) {
  const range = readObjectFilterValue(value);
  return Boolean(range.min || range.max || range.from || range.to);
}

function isFilterValueActive(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (isRecord(value) && value.exclude === true) {
    return readMultiFilterValue(value).values.length > 0;
  }

  if (typeof value === "object") {
    return hasRangeFilter(value);
  }

  return Boolean(value);
}

function setObjectFilterValue<TData extends RowData>(
  column: Column<TData, unknown>,
  key: keyof DataTableObjectFilter,
  value: string,
) {
  const next = {
    ...readObjectFilterValue(column.getFilterValue()),
    [key]: value,
  };

  if (!hasRangeFilter(next)) {
    column.setFilterValue(undefined);
    return;
  }

  column.setFilterValue(next);
}

function setColumnSorting<TData extends RowData>(
  table: TanstackTable<TData>,
  columnId: string,
  desc: boolean,
) {
  table.setSorting((current) => {
    const next = [
      ...current.filter((sort) => sort.id !== columnId),
      { id: columnId, desc },
    ];

    return next.slice(-5);
  });
}

function clearColumnSorting<TData extends RowData>(
  table: TanstackTable<TData>,
  columnId: string,
) {
  table.setSorting((current) => current.filter((sort) => sort.id !== columnId));
}

function toggleColumnSorting<TData extends RowData>(
  table: TanstackTable<TData>,
  columnId: string,
) {
  table.setSorting((current) => {
    const currentSort = current.find((sort) => sort.id === columnId);
    const next = current.filter((sort) => sort.id !== columnId);

    if (!currentSort) {
      return [...next, { id: columnId, desc: false }].slice(-5);
    }

    if (!currentSort.desc) {
      return [...next, { id: columnId, desc: true }].slice(-5);
    }

    return next;
  });
}

function isColumnOrderState(value: unknown): value is ColumnOrderState {
  return (
    Array.isArray(value) &&
    value.every((columnId) => typeof columnId === "string")
  );
}

function isColumnFiltersState(value: unknown): value is ColumnFiltersState {
  return (
    Array.isArray(value) &&
    value.every((filter) => isRecord(filter) && typeof filter.id === "string")
  );
}

function isVisibilityState(value: unknown): value is VisibilityState {
  return (
    isRecord(value) &&
    Object.values(value).every((visible) => typeof visible === "boolean")
  );
}

function isSortingState(value: unknown): value is SortingState {
  return (
    Array.isArray(value) &&
    value.every(
      (sort) =>
        isRecord(sort) &&
        typeof sort.id === "string" &&
        typeof sort.desc === "boolean",
    )
  );
}

function parseStoredDataTableSettings(
  value: string,
): StoredDataTableSettings | null {
  const parsed = JSON.parse(value);

  if (!isRecord(parsed)) {
    return null;
  }

  const settings: StoredDataTableSettings = {};

  if (isColumnFiltersState(parsed.columnFilters)) {
    settings.columnFilters = parsed.columnFilters;
  }

  if (isColumnOrderState(parsed.columnOrder)) {
    settings.columnOrder = parsed.columnOrder;
  }

  if (isVisibilityState(parsed.columnVisibility)) {
    settings.columnVisibility = parsed.columnVisibility;
  }

  if (typeof parsed.globalFilter === "string") {
    settings.globalFilter = parsed.globalFilter;
  }

  if (typeof parsed.pageSize === "number" && Number.isFinite(parsed.pageSize)) {
    settings.pageSize = parsed.pageSize;
  }

  if (isSortingState(parsed.sorting)) {
    settings.sorting = parsed.sorting;
  }

  return settings;
}

function getStoredDataTableSettings(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? parseStoredDataTableSettings(value) : null;
  } catch {
    return null;
  }
}

function pickKnownColumnEntries<TValue>(
  record: Record<string, TValue> | undefined,
  columnIds: string[],
) {
  if (!record) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(record).filter(([columnId]) => columnIds.includes(columnId)),
  );
}

function retainKnownColumnSettings(
  settings: StoredDataTableSettings | null,
  columnIds: string[],
): StoredDataTableSettings | null {
  if (!settings) {
    return null;
  }

  const sorting = settings.sorting?.filter((sort) =>
    columnIds.includes(sort.id),
  );

  return {
    ...settings,
    columnFilters: settings.columnFilters?.filter((filter) =>
      columnIds.includes(filter.id),
    ),
    columnSizing: pickKnownColumnEntries(settings.columnSizing, columnIds),
    columnVisibility: pickKnownColumnEntries(
      settings.columnVisibility,
      columnIds,
    ),
    sorting: sorting?.length ? sorting : undefined,
  };
}

function getResetFiltersStorageKey(event: Event) {
  if (!(event instanceof CustomEvent)) {
    return null;
  }

  const detail = event.detail;
  if (!isRecord(detail)) {
    return null;
  }

  const storageKey = detail.storageKey;
  return typeof storageKey === "string" ? storageKey : null;
}

function isLockedColumn(
  columnId: string,
  lockedStartColumnIds: string[],
  lockedEndColumnIds: string[],
) {
  return (
    lockedStartColumnIds.includes(columnId) ||
    lockedEndColumnIds.includes(columnId)
  );
}

function getStorageSafeId(storageKey: string) {
  return storageKey.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function getOptionalColumnOrderKey(columnOrder?: ColumnOrderState) {
  return columnOrder?.join("|") ?? "";
}

function getColumnFiltersKey(columnFilters: ColumnFiltersState) {
  return JSON.stringify(columnFilters);
}

function getVisibilityStateKey(visibility: VisibilityState) {
  const entries = Object.entries(visibility).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return JSON.stringify(entries);
}

function getSortingKey(sorting: SortingState) {
  return JSON.stringify(sorting);
}

function useStableValueByKey<TValue>(value: TValue, key: string) {
  const [stored, setStored] = React.useState({ key, value });

  React.useEffect(() => {
    setStored((current) => (current.key === key ? current : { key, value }));
  }, [key, value]);

  return stored.value;
}

function useDataTableInstance<TData extends RowData>(
  options: TableOptions<TData>,
) {
  const resolvedOptions: TableOptionsResolved<TData> = {
    onStateChange: () => undefined,
    renderFallbackValue: null,
    state: {},
    ...options,
  };

  const [table] = React.useState(() => createTable<TData>(resolvedOptions));
  const [state, setState] = React.useState(() => table.initialState);

  table.setOptions((previous) => ({
    ...previous,
    ...options,
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange?.(updater);
    },
    state: {
      ...state,
      ...options.state,
    },
  }));

  return table;
}

const emptyColumnFilters: ColumnFiltersState = [];
const emptyColumnSizing: ColumnSizingState = {};
const emptyColumnVisibility: VisibilityState = {};
const emptySorting: SortingState = [];
const emptyLockedColumnIds: string[] = [];
const defaultPageSizeOptions = [10, 20, 30, 50, 100];

function resolvePageSize(
  pageSize: number | undefined,
  fallbackPageSize: number,
  pageSizeOptions: number[],
) {
  if (typeof pageSize === "number" && pageSizeOptions.includes(pageSize)) {
    return pageSize;
  }

  if (pageSizeOptions.includes(fallbackPageSize)) {
    return fallbackPageSize;
  }

  return pageSizeOptions[0] ?? fallbackPageSize;
}

export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  const {
    activeRowId,
    columns,
    data,
    emptyMessage,
    emptyState,
    fillHeight = false,
    loading = false,
    error,
    onRetry,
    warning,
    unavailable,
    enablePersistence: enablePersistenceProp,
    enableRowSelection = false,
    filterFns,
    formatResultCount: formatResultCountProp,
    formatRowCount: formatRowCountProp,
    formatSelectedRowCount,
    getRowId,
    globalFilterFn,
    initialColumnFilters = emptyColumnFilters,
    initialGlobalFilter = "",
    onRowClick,
    getRowLabel,
    initialColumnOrder,
    initialColumnVisibility = emptyColumnVisibility,
    initialPageSize = 10,
    initialSorting = emptySorting,
    lockedEndColumnIds = emptyLockedColumnIds,
    lockedStartColumnIds = emptyLockedColumnIds,
    manualFiltering = false,
    enableExcludeFilters,
    manualPagination = false,
    manualSorting = false,
    onStateChange,
    pageCount,
    pageSizeOptions = defaultPageSizeOptions,
    rowCount,
    rowSelectionActions,
    searchPlaceholder,
    storageKey: storageKeyProp,
    toolbarBelow,
    toolbarEnd,
    toolbarStart,
  } = props;
  const t = useMessages(dataTableMessages);
  const ui = useUiMessages();
  // Persistence needs a key; without one the table keeps state in memory only.
  const storageKey = storageKeyProp ?? "";
  const enablePersistence =
    Boolean(storageKeyProp) && enablePersistenceProp !== false;
  const formatResultCount = formatResultCountProp ?? t.resultCount;
  const formatRowCount = formatRowCountProp ?? t.rowCount;

  const defaultColumnOrder = React.useMemo(
    () => columns.map(getColumnId).filter(isString),
    [columns],
  );
  const defaultColumnOrderKey = defaultColumnOrder.join("|");
  const pageSizeOptionsKey = pageSizeOptions.join("|");
  const lockedStartColumnKey = lockedStartColumnIds.join("|");
  const lockedEndColumnKey = lockedEndColumnIds.join("|");
  const stablePageSizeOptions = useStableValueByKey(
    pageSizeOptions,
    pageSizeOptionsKey,
  );
  const stableDefaultColumnOrder = useStableValueByKey(
    defaultColumnOrder,
    defaultColumnOrderKey,
  );
  const stableInitialColumnFilters = useStableValueByKey(
    initialColumnFilters,
    getColumnFiltersKey(initialColumnFilters),
  );
  const stableInitialColumnOrder = useStableValueByKey(
    initialColumnOrder,
    getOptionalColumnOrderKey(initialColumnOrder),
  );
  const stableInitialColumnVisibility = useStableValueByKey(
    initialColumnVisibility,
    getVisibilityStateKey(initialColumnVisibility),
  );
  const stableInitialSorting = useStableValueByKey(
    initialSorting,
    getSortingKey(initialSorting),
  );
  const stableLockedStartColumnIds = useStableValueByKey(
    lockedStartColumnIds,
    lockedStartColumnKey,
  );
  const stableLockedEndColumnIds = useStableValueByKey(
    lockedEndColumnIds,
    lockedEndColumnKey,
  );
  const [preferencesReady, setPreferencesReady] =
    React.useState(!enablePersistence);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(stableInitialColumnVisibility);
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    normalizeColumnOrder(
      stableInitialColumnOrder ?? stableDefaultColumnOrder,
      stableDefaultColumnOrder,
      stableLockedStartColumnIds,
      stableLockedEndColumnIds,
    ),
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    stableInitialColumnFilters,
  );
  const [columnSizing, setColumnSizing] =
    React.useState<ColumnSizingState>(emptyColumnSizing);
  const [sorting, setSorting] =
    React.useState<SortingState>(stableInitialSorting);
  const [globalFilter, setGlobalFilter] = React.useState(initialGlobalFilter);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: resolvePageSize(
      initialPageSize,
      initialPageSize,
      stablePageSizeOptions,
    ),
  });
  const resetPaginationPage = React.useCallback(() => {
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    );
  }, []);
  const handleColumnFiltersChange = React.useCallback<
    OnChangeFn<ColumnFiltersState>
  >(
    (updater) => {
      setColumnFilters(updater);
      resetPaginationPage();
    },
    [resetPaginationPage],
  );
  const handleGlobalFilterChange = React.useCallback<OnChangeFn<string>>(
    (updater) => {
      setGlobalFilter(updater);
      resetPaginationPage();
    },
    [resetPaginationPage],
  );
  const handleSortingChange = React.useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      setSorting(updater);
      resetPaginationPage();
    },
    [resetPaginationPage],
  );

  const dndContextId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor),
  );

  React.useEffect(() => {
    if (!enablePersistence) {
      return;
    }

    const settings = retainKnownColumnSettings(
      getStoredDataTableSettings(storageKey),
      stableDefaultColumnOrder,
    );

    setColumnVisibility(
      settings?.columnVisibility ?? stableInitialColumnVisibility,
    );
    setColumnOrder(
      normalizeColumnOrder(
        settings?.columnOrder ??
          stableInitialColumnOrder ??
          stableDefaultColumnOrder,
        stableDefaultColumnOrder,
        stableLockedStartColumnIds,
        stableLockedEndColumnIds,
      ),
    );
    setColumnFilters(settings?.columnFilters ?? stableInitialColumnFilters);
    setColumnSizing(settings?.columnSizing ?? emptyColumnSizing);
    setSorting(settings?.sorting ?? stableInitialSorting);
    setGlobalFilter(settings?.globalFilter ?? "");
    setPagination({
      pageIndex: 0,
      pageSize: resolvePageSize(
        settings?.pageSize,
        initialPageSize,
        stablePageSizeOptions,
      ),
    });
    setPreferencesReady(true);
  }, [
    enablePersistence,
    initialPageSize,
    stableDefaultColumnOrder,
    stableInitialColumnFilters,
    stableInitialColumnOrder,
    stableInitialColumnVisibility,
    stableInitialSorting,
    stableLockedEndColumnIds,
    stableLockedStartColumnIds,
    stablePageSizeOptions,
    storageKey,
  ]);

  React.useEffect(() => {
    if (!preferencesReady) {
      return;
    }

    setColumnOrder((currentOrder) =>
      normalizeColumnOrder(
        currentOrder,
        stableDefaultColumnOrder,
        stableLockedStartColumnIds,
        stableLockedEndColumnIds,
      ),
    );
  }, [
    preferencesReady,
    stableDefaultColumnOrder,
    stableLockedEndColumnIds,
    stableLockedStartColumnIds,
  ]);

  React.useEffect(() => {
    if (!enablePersistence || !preferencesReady) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        columnFilters,
        columnOrder,
        columnSizing,
        columnVisibility,
        globalFilter,
        pageSize: pagination.pageSize,
        sorting,
      } satisfies StoredDataTableSettings),
    );
  }, [
    columnFilters,
    columnOrder,
    columnSizing,
    columnVisibility,
    enablePersistence,
    globalFilter,
    pagination.pageSize,
    preferencesReady,
    sorting,
    storageKey,
  ]);

  React.useEffect(() => {
    if (!preferencesReady) {
      return;
    }

    onStateChange?.({
      columnFilters,
      globalFilter,
      pagination,
      sorting,
    });
  }, [
    columnFilters,
    globalFilter,
    onStateChange,
    pagination,
    preferencesReady,
    sorting,
  ]);

  const table = useDataTableInstance<TData>({
    autoResetPageIndex: !manualPagination,
    columnResizeMode: "onChange",
    columns,
    data,
    enableColumnResizing: true,
    enableMultiSort: true,
    enableRowSelection,
    filterFns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    // An explicit undefined would replace TanStack's default and disable search.
    globalFilterFn: globalFilterFn ?? "includesString",
    isMultiSortEvent: () => true,
    manualFiltering,
    manualPagination,
    manualSorting,
    maxMultiSortColCount: 5,
    meta: {
      enableExcludeFilters:
        enableExcludeFilters ?? (!manualFiltering && !onStateChange),
    },
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    pageCount,
    rowCount,
    state: {
      columnFilters,
      columnOrder,
      columnSizing,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
      sorting,
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    if (
      isLockedColumn(
        String(active.id),
        stableLockedStartColumnIds,
        stableLockedEndColumnIds,
      )
    ) {
      return;
    }

    setColumnOrder((currentOrder) => {
      const oldIndex = currentOrder.indexOf(String(active.id));
      const newIndex = currentOrder.indexOf(String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return currentOrder;
      }

      return normalizeColumnOrder(
        arrayMove(currentOrder, oldIndex, newIndex),
        stableDefaultColumnOrder,
        stableLockedStartColumnIds,
        stableLockedEndColumnIds,
      );
    });
  };

  const resetColumns = () => {
    setColumnVisibility(stableInitialColumnVisibility);
    setColumnOrder(
      normalizeColumnOrder(
        stableInitialColumnOrder ?? stableDefaultColumnOrder,
        stableDefaultColumnOrder,
        stableLockedStartColumnIds,
        stableLockedEndColumnIds,
      ),
    );
    setColumnSizing(emptyColumnSizing);
  };

  const resetFilters = React.useCallback(() => {
    setColumnFilters(stableInitialColumnFilters);
    setGlobalFilter("");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [stableInitialColumnFilters]);

  React.useEffect(() => {
    const handleResetFilters = (event: Event) => {
      const resetStorageKey = getResetFiltersStorageKey(event);

      if (resetStorageKey && resetStorageKey !== storageKey) {
        return;
      }

      resetFilters();
    };

    window.addEventListener(DATA_TABLE_RESET_FILTERS_EVENT, handleResetFilters);

    return () => {
      window.removeEventListener(
        DATA_TABLE_RESET_FILTERS_EVENT,
        handleResetFilters,
      );
    };
  }, [resetFilters, storageKey]);

  if (!preferencesReady) {
    return <DataTableSkeleton />;
  }

  const retry = onRetry ? (
    <Button variant="outline" size="sm" onClick={onRetry}>
      <RotateCwIcon data-icon="inline-start" />
      {ui.retry}
    </Button>
  ) : null;

  if (unavailable) {
    return (
      <Empty className="rounded-3xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockIcon />
          </EmptyMedia>
          <EmptyTitle>{unavailable}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  if (error && !data.length && !loading) {
    return (
      <Empty className="rounded-3xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>{ui.loadFailed}</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        {retry ? <EmptyContent>{retry}</EmptyContent> : null}
      </Empty>
    );
  }

  const isFiltered = Boolean(globalFilter) || columnFilters.length > 0;

  const filteredRowCount = rowCount ?? table.getFilteredRowModel().rows.length;
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsLabel =
    formatSelectedRowCount ??
    ((count: number) => t.selected(formatRowCount(count), count));
  const toolbarStartContent = toolbarStart?.(table);
  const toolbarEndContent = toolbarEnd?.(table);
  const toolbarBelowContent = toolbarBelow?.(table);
  const rowSelectionActionsContent = rowSelectionActions?.(table);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-4",
        fillHeight && "min-h-0 flex-1",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {toolbarStartContent}
        <div className="flex min-w-0 flex-1 basis-80 items-center gap-2">
          <InputGroup className="flex-1">
            <InputGroupInput
              value={globalFilter}
              onChange={(event) => handleGlobalFilterChange(event.target.value)}
              placeholder={searchPlaceholder ?? t.search}
            />
            <InputGroupAddon className="pl-2">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end" className="pr-2">
              {formatResultCount(filteredRowCount)}
            </InputGroupAddon>
          </InputGroup>
          {toolbarEndContent}
          <ColumnSettings
            defaultColumnOrder={defaultColumnOrder}
            lockedEndColumnIds={lockedEndColumnIds}
            lockedStartColumnIds={lockedStartColumnIds}
            onResetColumns={resetColumns}
            table={table}
          />
        </div>
      </div>

      {toolbarBelowContent}

      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{ui.staleData}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          {retry ? <AlertAction>{retry}</AlertAction> : null}
        </Alert>
      ) : null}
      {warning ? (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>{warning}</AlertTitle>
        </Alert>
      ) : null}

      {enableRowSelection && selectedRowCount > 0 && (
        <div className="bg-muted/40 flex flex-col gap-2 rounded-2xl border p-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-foreground px-1 text-sm font-medium">
            {selectedRowsLabel(selectedRowCount)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {rowSelectionActionsContent}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.resetRowSelection()}
            >
              <XIcon data-icon="inline-start" />
              {t.clearSelection}
            </Button>
          </div>
        </div>
      )}

      <DndContext
        // Stable id: dnd-kit's global counter differs between server and client.
        id={dndContextId}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div
          className={cn(
            "bg-card overflow-hidden rounded-2xl border",
            fillHeight && "flex min-h-0 flex-1 flex-col",
          )}
        >
          <Table
            containerClassName={
              // Bottom-only fade: a top fade would dissolve the sticky header.
              fillHeight
                ? "min-h-0 flex-1 overflow-auto scroll-fade-b"
                : undefined
            }
            style={{ minWidth: "100%", width: table.getTotalSize() }}
          >
            {/* Solid background: rows scroll underneath the sticky header. */}
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DataTableHead
                        key={header.id}
                        header={header}
                        lockedEndColumnIds={lockedEndColumnIds}
                        lockedStartColumnIds={lockedStartColumnIds}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }, (_, index) => (
                  <TableRow key={index}>
                    {table.getVisibleLeafColumns().map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-active={row.id === activeRowId || undefined}
                    aria-current={row.id === activeRowId ? "true" : undefined}
                    data-state={row.getIsSelected() && "selected"}
                    className={onRowClick ? "cursor-pointer" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-label={
                      onRowClick
                        ? `${t.open}: ${getRowLabel?.(row.original) ?? row.id}`
                        : undefined
                    }
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row.original);
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "whitespace-nowrap",
                          getColumnAlignClass(cell.column),
                          getColumnMeta(cell.column)?.cellClassName,
                        )}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="text-muted-foreground h-24 text-center"
                  >
                    {isFiltered ? (
                      <Empty>
                        <EmptyHeader>
                          <EmptyTitle>
                            {emptyMessage ?? ui.noResults}
                          </EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                          >
                            {t.clearFilters}
                          </Button>
                        </EmptyContent>
                      </Empty>
                    ) : (
                      (emptyState ?? (
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <InboxIcon />
                            </EmptyMedia>
                            <EmptyTitle>{emptyMessage ?? ui.noData}</EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      ))
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      <DataTablePagination
        formatRowCount={formatRowCount}
        formatSelectedRowCount={formatSelectedRowCount}
        pageSizeOptions={stablePageSizeOptions}
        rowCount={rowCount}
        storageKey={storageKey}
        table={table}
      />
    </div>
  );
}

function DataTableHead<TData extends RowData>({
  header,
  lockedEndColumnIds,
  lockedStartColumnIds,
}: {
  header: Header<TData, unknown>;
  lockedEndColumnIds: string[];
  lockedStartColumnIds: string[];
}) {
  const t = useMessages(dataTableMessages);
  const column = header.column;
  const table = header.getContext().table;
  const align = getColumnAlign(column);
  const isSorted = column.getIsSorted();
  const sortIndex = table
    .getState()
    .sorting.findIndex((sort) => sort.id === column.id);
  const isLocked = isLockedColumn(
    column.id,
    lockedStartColumnIds,
    lockedEndColumnIds,
  );
  const canOpenColumnMenu = !header.isPlaceholder && !isLocked;
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: column.id,
    disabled: isLocked,
  });
  const [menuOpen, setMenuOpen] = React.useState(false);

  const columnControls =
    column.getCanSort() || !isLocked ? (
      <div
        className={cn(
          "flex shrink-0 items-center gap-1",
          align === "right" ? "order-first mr-1" : "ml-1",
        )}
      >
        {column.getCanSort() && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              "transition-opacity",
              isSorted ? "text-foreground bg-accent" : "text-muted-foreground",
              getHeaderControlVisibilityClass(Boolean(isSorted)),
            )}
            onClick={() => toggleColumnSorting(table, column.id)}
            aria-label={t.toggleSort(getColumnLabel(column))}
          >
            <ColumnSortIcon isSorted={isSorted} />
          </Button>
        )}
        {sortIndex >= 0 && table.getState().sorting.length > 1 && (
          <Badge
            variant="secondary"
            className="px-1"
            title={t.sortCriterionTitle(sortIndex + 1)}
          >
            {sortIndex + 1}
          </Badge>
        )}
        {!isLocked && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              "text-muted-foreground cursor-grab transition-opacity active:cursor-grabbing",
              getHeaderControlVisibilityClass(isDragging),
            )}
            aria-label={t.reorderColumn(getColumnLabel(column))}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon />
          </Button>
        )}
      </div>
    ) : null;

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      aria-sort={getColumnAriaSort(isSorted)}
      className={cn(
        "relative whitespace-nowrap",
        getColumnAlignClass(column),
        getColumnMeta(column)?.headerClassName,
        isDragging && "bg-muted relative z-20 opacity-80",
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        width: header.getSize(),
      }}
    >
      {header.isPlaceholder ? null : (
        <div
          className={cn(
            "group/header flex w-full items-center",
            align === "center" && "justify-center",
            align === "right" && "justify-end",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center">
            {canOpenColumnMenu ? (
              <ColumnHeaderMenu
                header={header}
                open={menuOpen}
                onOpenChange={setMenuOpen}
              />
            ) : (
              <div className="flex h-8 items-center px-0">
                {flexRender(column.columnDef.header, header.getContext())}
              </div>
            )}
          </div>
          {columnControls}
        </div>
      )}
      {column.getCanResize() && !isLocked ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t.resizeColumn(getColumnLabel(column))}
          className={cn(
            "hover:bg-primary/50 absolute inset-y-0 right-0 z-10 w-1 cursor-col-resize touch-none bg-transparent select-none",
            column.getIsResizing() && "bg-primary",
          )}
          onDoubleClick={() => column.resetSize()}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
        />
      ) : null}
    </TableHead>
  );
}

function ColumnHeaderMenuTrigger<TData extends RowData>({
  className,
  header,
}: {
  className?: string;
  header: Header<TData, unknown>;
}) {
  const t = useMessages(dataTableMessages);
  const column = header.column;
  const align = getColumnAlign(column);
  const isFiltered = isFilterValueActive(column.getFilterValue());
  const isExcluding =
    isFiltered && readMultiFilterValue(column.getFilterValue()).exclude;
  const ActiveFilterIcon = isExcluding ? FunnelXIcon : FunnelIcon;

  return (
    <PopoverTrigger
      render={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "relative -mx-2.5 h-8 w-[calc(100%+1.25rem)] min-w-0 justify-start px-2.5",
            align === "center" && "justify-center",
            align === "right" && "justify-end",
            className,
          )}
        />
      }
    >
      <span className="truncate">{getColumnLabel(column)}</span>
      {isFiltered && (
        <>
          <ActiveFilterIcon data-icon="inline-end" aria-hidden />
          <span className="sr-only">
            {isExcluding ? t.excludeFilterActive : t.filterActive}
          </span>
        </>
      )}
    </PopoverTrigger>
  );
}

function ColumnSortIcon({ isSorted }: { isSorted: DataTableSortDirection }) {
  if (isSorted === "asc") {
    return <ArrowUpNarrowWideIcon data-icon="inline-end" />;
  }

  if (isSorted === "desc") {
    return <ArrowDownWideNarrowIcon data-icon="inline-end" />;
  }

  return <ArrowUpDownIcon data-icon="inline-end" />;
}

function ColumnHeaderMenu<TData extends RowData>({
  header,
  onOpenChange,
  open,
}: {
  header: Header<TData, unknown>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const t = useMessages(dataTableMessages);
  const column = header.column;
  const table = header.getContext().table;
  const isSorted = column.getIsSorted();
  const isFiltered = isFilterValueActive(column.getFilterValue());
  const sorting = table.getState().sorting;
  const sortIndex = sorting.findIndex((sort) => sort.id === column.id);
  const sortCount = sorting.length;
  const hasColumnState = Boolean(isSorted) || isFiltered;

  const clearColumnState = () => {
    column.setFilterValue(undefined);
    clearColumnSorting(table, column.id);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <ColumnHeaderMenuTrigger header={header} />
      <PopoverContent align="start" className="w-72 p-0">
        <div className="flex flex-col gap-3 p-3">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {getColumnLabel(column)}
              </div>
            </div>
            {sortIndex >= 0 && sortCount > 1 && (
              <Badge variant="outline" className="shrink-0">
                {t.sortCriterion(sortIndex + 1)}
              </Badge>
            )}
          </div>

          {column.getCanSort() && (
            <ColumnSortControls
              column={column}
              isSorted={isSorted}
              table={table}
            />
          )}

          <ColumnFilterControls
            allowExclude={Boolean(table.options.meta?.enableExcludeFilters)}
            column={column}
          />

          {(hasColumnState || column.getCanHide()) && (
            <>
              <Separator />
              <div className="flex gap-2">
                {hasColumnState && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={clearColumnState}
                  >
                    <XIcon data-icon="inline-start" />
                    {t.clearAll}
                  </Button>
                )}
                {column.getCanHide() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => column.toggleVisibility(false)}
                  >
                    <EyeOffIcon data-icon="inline-start" />
                    {t.hide}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Pressed option inside the column menu; the selected state uses the primary
// fill plus a check so it stays distinguishable in both themes.
function ColumnMenuOption({
  buttonRef,
  children,
  onClick,
  selected,
}: {
  buttonRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <Button
      ref={buttonRef}
      variant={selected ? "default" : "outline"}
      size="sm"
      className="justify-start"
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
      {selected && <CheckIcon data-icon="inline-end" className="ml-auto" />}
    </Button>
  );
}

function ColumnSortControls<TData extends RowData>({
  column,
  isSorted,
  table,
}: {
  column: Column<TData, unknown>;
  isSorted: false | "asc" | "desc";
  table: TanstackTable<TData>;
}) {
  const t = useMessages(dataTableMessages);
  const ascendingRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <Label className="text-muted-foreground text-xs">{t.sort}</Label>
        {isSorted && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              clearColumnSorting(table, column.id);
              ascendingRef.current?.focus();
            }}
          >
            <XIcon data-icon="inline-start" />
            {t.removeSort}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={t.sort}>
        <ColumnMenuOption
          buttonRef={ascendingRef}
          selected={isSorted === "asc"}
          onClick={() => setColumnSorting(table, column.id, false)}
        >
          <ArrowUpNarrowWideIcon data-icon="inline-start" />
          {t.ascending}
        </ColumnMenuOption>
        <ColumnMenuOption
          selected={isSorted === "desc"}
          onClick={() => setColumnSorting(table, column.id, true)}
        >
          <ArrowDownWideNarrowIcon data-icon="inline-start" />
          {t.descending}
        </ColumnMenuOption>
      </div>
    </div>
  );
}

function ColumnFilterControls<TData extends RowData>({
  allowExclude,
  column,
}: {
  allowExclude: boolean;
  column: Column<TData, unknown>;
}) {
  const t = useMessages(dataTableMessages);
  const filter = getColumnMeta(column)?.filter;

  if (!filter) {
    return null;
  }

  if (filter.type === "custom") {
    return filter.render(column);
  }

  if (filter.type === "multi") {
    return (
      <ColumnMultiFilter
        allowExclude={allowExclude}
        column={column}
        options={filter.options}
      />
    );
  }

  if (filter.type === "number-range") {
    const range = readRangeFilterValue(column.getFilterValue());

    return (
      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs">{t.filter}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={filter.min}
            max={filter.max}
            value={range.min ?? ""}
            onChange={(event) =>
              setObjectFilterValue(column, "min", event.target.value)
            }
            placeholder={filter.minPlaceholder ?? t.min}
          />
          <Input
            type="number"
            min={filter.min}
            max={filter.max}
            value={range.max ?? ""}
            onChange={(event) =>
              setObjectFilterValue(column, "max", event.target.value)
            }
            placeholder={filter.maxPlaceholder ?? t.max}
          />
        </div>
      </div>
    );
  }

  if (filter.type === "date-range") {
    const range = readDateRangeFilterValue(column.getFilterValue());

    return (
      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs">{t.filter}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={range.from ?? ""}
            onChange={(event) =>
              setObjectFilterValue(column, "from", event.target.value)
            }
          />
          <Input
            type="date"
            value={range.to ?? ""}
            onChange={(event) =>
              setObjectFilterValue(column, "to", event.target.value)
            }
          />
        </div>
      </div>
    );
  }

  return <ColumnTextFilter column={column} placeholder={filter.placeholder} />;
}

function ColumnTextFilter<TData extends RowData>({
  column,
  placeholder,
}: {
  column: Column<TData, unknown>;
  placeholder?: string;
}) {
  const t = useMessages(dataTableMessages);
  const label = getColumnLabel(column).toLocaleLowerCase();

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-muted-foreground text-xs">{t.filter}</Label>
      <Input
        value={
          readStringProperty({ value: column.getFilterValue() }, "value") ?? ""
        }
        onChange={(event) =>
          column.setFilterValue(event.target.value || undefined)
        }
        placeholder={placeholder ?? t.filterBy(label)}
      />
    </div>
  );
}

function ColumnMultiFilter<TData extends RowData>({
  allowExclude,
  column,
  options,
}: {
  allowExclude: boolean;
  column: Column<TData, unknown>;
  options: DataTableFilterOption[];
}) {
  const t = useMessages(dataTableMessages);
  const stored = readMultiFilterValue(column.getFilterValue());
  const [pendingExclude, setPendingExclude] = React.useState(stored.exclude);
  const selected = stored.values;
  const exclude =
    allowExclude && (selected.length ? stored.exclude : pendingExclude);

  const toggleValue = (value: string, checked: boolean) => {
    const next = checked
      ? [...selected, value]
      : selected.filter((item) => item !== value);

    column.setFilterValue(toMultiFilterValue(exclude, next));
  };

  const setMode = (nextExclude: boolean) => {
    setPendingExclude(nextExclude);
    column.setFilterValue(toMultiFilterValue(nextExclude, selected));
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-muted-foreground text-xs">{t.filter}</Label>
      {allowExclude && (
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label={t.filterMode}
        >
          <ColumnMenuOption selected={!exclude} onClick={() => setMode(false)}>
            <FunnelIcon data-icon="inline-start" />
            {t.show}
          </ColumnMenuOption>
          <ColumnMenuOption selected={exclude} onClick={() => setMode(true)}>
            <FunnelXIcon data-icon="inline-start" />
            {t.exclude}
          </ColumnMenuOption>
        </div>
      )}
      <div
        className="flex max-h-56 scroll-fade flex-col gap-1 overflow-auto rounded-2xl border p-1"
        role="group"
        aria-label={exclude ? t.valuesToExclude : t.valuesToShow}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="hover:bg-accent flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-normal"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) =>
                toggleValue(option.value, Boolean(checked))
              }
            />
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                exclude &&
                  selected.includes(option.value) &&
                  "text-muted-foreground line-through",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ColumnSettings<TData extends RowData>({
  defaultColumnOrder,
  lockedEndColumnIds,
  lockedStartColumnIds,
  onResetColumns,
  table,
}: {
  defaultColumnOrder: ColumnOrderState;
  lockedEndColumnIds: string[];
  lockedStartColumnIds: string[];
  onResetColumns: () => void;
  table: TanstackTable<TData>;
}) {
  const t = useMessages(dataTableMessages);
  const hiddenColumnCount = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())
    .filter((column) => !column.getIsVisible()).length;
  const visibleColumnsCustomized = hiddenColumnCount > 0;
  const columnOrderCustomized = !areColumnOrdersEqual(
    normalizeColumnOrder(
      table.getState().columnOrder,
      defaultColumnOrder,
      lockedStartColumnIds,
      lockedEndColumnIds,
    ),
    normalizeColumnOrder(
      defaultColumnOrder,
      defaultColumnOrder,
      lockedStartColumnIds,
      lockedEndColumnIds,
    ),
  );
  const columnsCustomized = visibleColumnsCustomized || columnOrderCustomized;

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="relative"
                    aria-label={t.customizeColumns}
                  />
                }
              />
            }
          >
            <Columns3Icon />
            {hiddenColumnCount > 0 && (
              <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full" />
            )}
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            {t.columnsTooltip}
          </TooltipContent>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t.columns}</DropdownMenuLabel>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    closeOnClick={false}
                  >
                    {getColumnLabel(column)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
            {columnsCustomized && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onResetColumns}>
                  <XIcon />
                  {t.resetColumns}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}

function DataTablePagination<TData extends RowData>({
  formatRowCount,
  formatSelectedRowCount,
  pageSizeOptions,
  rowCount,
  storageKey,
  table,
}: {
  formatRowCount: (count: number) => string;
  formatSelectedRowCount?: (count: number) => string;
  pageSizeOptions: number[];
  rowCount?: number;
  storageKey: string;
  table: TanstackTable<TData>;
}) {
  const t = useMessages(dataTableMessages);
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const filteredRows = rowCount ?? table.getFilteredRowModel().rows.length;
  const totalRows = rowCount ?? table.getCoreRowModel().rows.length;
  const selectedRowsLabel =
    formatSelectedRowCount ??
    ((count: number) => t.selected(formatRowCount(count), count));
  const fallbackId = React.useId();
  const inputId = storageKey
    ? `${getStorageSafeId(storageKey)}-rows-per-page`
    : fallbackId;
  let paginationSummary = t.ofSummary(
    formatRowCount(filteredRows),
    formatRowCount(totalRows),
  );

  if (selectedRows > 0) {
    paginationSummary = t.ofSummary(
      selectedRowsLabel(selectedRows),
      formatRowCount(filteredRows),
    );
  } else if (filteredRows === totalRows) {
    paginationSummary = `${formatRowCount(totalRows)}.`;
  }

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground text-sm">{paginationSummary}</div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor={inputId} className="text-sm">
            {t.rowsPerPage}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger id={inputId} size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm font-medium">
          {t.page(
            table.getState().pagination.pageIndex + 1,
            Math.max(table.getPageCount(), 1),
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden sm:flex"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t.firstPage}</span>
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t.previousPage}</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t.nextPage}</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            className="hidden sm:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t.lastPage}</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DataTableSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4" aria-hidden="true">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 flex-1 rounded-3xl" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <div className="bg-card overflow-hidden rounded-2xl border">
        <Skeleton className="h-10 rounded-none" />
        <div className="flex flex-col">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className="bg-muted/40 h-14 rounded-none border-t"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
