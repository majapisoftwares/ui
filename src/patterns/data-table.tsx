"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../components/ui/empty";
import { Skeleton } from "../components/ui/skeleton";

export interface DataColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}
export interface DataTableProps<T> {
  rows: T[];
  columns: DataColumn<T>[];
  getRowId: (row: T) => string;
  searchValue: (row: T) => string;
  searchLabel?: string;
  filters?: ReactNode;
  loading?: boolean;
  onOpen?: (row: T) => void;
  rowLabel?: (row: T) => string;
  pageSize?: number;
}
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchValue,
  searchLabel = "Buscar registros",
  filters,
  loading = false,
  onOpen,
  rowLabel,
  pageSize = 10,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const selected = rows.filter((row) =>
    searchValue(row).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const sortedColumn = columns.find((column) => column.id === sort?.id);
  if (sortedColumn?.sortValue)
    selected.sort((a, b) => {
      const x = sortedColumn.sortValue!(a),
        y = sortedColumn.sortValue!(b);
      return (
        (typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), "pt-BR")) * (sort?.desc ? -1 : 1)
      );
    });
  const safeSize = Math.max(1, pageSize),
    lastPage = Math.max(0, Math.ceil(selected.length / safeSize) - 1),
    currentPage = Math.min(page, lastPage);
  const visible = selected.slice(
    currentPage * safeSize,
    (currentPage + 1) * safeSize,
  );
  return (
    <section aria-label="Tabela de dados" aria-busy={loading}>
      <div className="wb-table-toolbar">
        <Input
          className="basis-full md:basis-0"
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
        {filters}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                aria-sort={
                  sort?.id === column.id
                    ? sort.desc
                      ? "descending"
                      : "ascending"
                    : undefined
                }
              >
                {column.sortValue ? (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setSort({
                        id: column.id,
                        desc: sort?.id === column.id ? !sort.desc : false,
                      })
                    }
                  >
                    {column.header}
                    {sort?.id === column.id ? (
                      sort.desc ? (
                        <ArrowDown data-icon="inline-end" />
                      ) : (
                        <ArrowUp data-icon="inline-end" />
                      )
                    ) : null}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
            {onOpen ? (
              <TableHead>
                <span className="sr-only">Detalhes</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [0, 1, 2].map((index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
                {onOpen ? (
                  <TableCell>
                    <Skeleton className="size-5" />
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : visible.length ? (
            visible.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.cell(row)}</TableCell>
                ))}
                {onOpen ? (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Ver detalhes de ${rowLabel?.(row) ?? getRowId(row)}`}
                      onClick={() => onOpen(row)}
                    >
                      <ArrowUpRight />
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (onOpen ? 1 : 0)}>
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Nenhum resultado</EmptyTitle>
                    <EmptyDescription>
                      Ajuste a busca ou os filtros para encontrar registros.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="wb-table-footer">
        <span>
          {selected.length} registros · página {currentPage + 1} de{" "}
          {lastPage + 1}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Página anterior"
            disabled={currentPage === 0 || loading}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Próxima página"
            disabled={currentPage === lastPage || loading}
            onClick={() => setPage(currentPage + 1)}
          >
            Próxima
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
