import {
  type ComponentType,
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import Loading from "../Loading";
import Skeleton from "../Skeleton";
import Stack from "../Stack";
import Text from "../Text";
import Table from "./Table";
import clsx from "../../utils/clsx";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

export type DataTableProps<RowData> = {
  title?: ReactNode;
  subtitle?: ReactNode;
  headerContent?: ReactNode;
  data?: RowData[];
  idAccessor?: keyof RowData;
  columns: {
    id?: string;
    title?: ReactNode;
    accessor?: keyof RowData;
    render?: (item: RowData) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
    sortable?: boolean;
  }[];
  actions?: {
    title: string;
    icon: ReactElement;
    href?: string | ((item: RowData) => string | null | undefined);
    onClick?: (item: RowData) => void;
    wrapper?: ComponentType<{
      item: RowData;
      children: ReactElement<{
        className?: string;
        onClick: () => void;
      }>;
    }>;
    target?: string;
  }[];
  isLoading?: boolean;
  noRecords?: ReactNode;
  onRowClick?: (item: RowData) => void;
  rowWrapper?: ComponentType<{
    item: RowData;
    children: ReactElement<{
      className?: string;
    }>;
  }>;
  pagination?: boolean;
  currentPage?: number;
  onChangePage?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
  autoHeight?: boolean;
  onChangeSort?: (sort: [string, "asc" | "desc"][]) => void;
  sort?: [string, "asc" | "desc"][];
  previousText?: string;
  nextText?: string;
  showingText?: string;
  toText?: string;
  ofText?: string;
  resultsText?: string;
  tableClassName?: string;
};

export default function DataTable<RowData>({
  title,
  subtitle,
  headerContent,
  data,
  idAccessor = "_id" as keyof typeof data,
  actions,
  columns,
  isLoading,
  noRecords: noRecordsText = "No records",
  onRowClick,
  rowWrapper,
  pagination,
  currentPage = 0,
  onChangePage,
  totalItems,
  itemsPerPage = 0,
  className,
  autoHeight,
  onChangeSort,
  sort: defaultSort = [],
  previousText,
  nextText,
  showingText,
  toText,
  ofText,
  resultsText,
  tableClassName,
}: DataTableProps<RowData>) {
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(currentPage);
  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);
  useEffect(() => {
    if (onChangePage) {
      onChangePage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRowClick = useCallback(
    (item: RowData) => (onRowClick ? () => onRowClick(item) : undefined),
    [onRowClick],
  );

  const getColumnSort = useCallback(
    (id: string) => sort.find((column) => id === column[0]),
    [sort],
  );
  const handleColumnClick = useCallback(
    (id: string) => () => {
      const sort: [string, "asc" | "desc" | null] = getColumnSort(id) || [
        id,
        null,
      ];
      switch (sort[1]) {
        case "asc":
          sort[1] = "desc";
          break;
        case "desc":
          sort[1] = null;
          break;
        case null:
          sort[1] = "asc";
          break;
      }
      setSort((oldSort) => {
        const newSort = [...oldSort];
        if (sort[1]) {
          const column = newSort.find((column) => column[0] === id);
          if (column) {
            column[1] = sort[1];
          } else {
            newSort.push([sort[0], sort[1]]);
          }
          return newSort;
        }
        return newSort.filter((column) => !!column[1]);
      });
    },
    [getColumnSort],
  );

  useEffect(() => {
    if (onChangeSort) {
      onChangeSort?.(sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  return (
    <Stack
      className={clsx(
        {
          "flex flex-1 flex-col": autoHeight,
        },
        className,
      )}
    >
      {(title || subtitle || headerContent) && (
        <Table.Header title={title} subtitle={subtitle}>
          {headerContent}
        </Table.Header>
      )}
      <Table autoHeight={autoHeight} className={tableClassName}>
        <Table.Head>
          <Table.Row>
            {columns.map((column, i) => {
              const id =
                column.id ||
                (typeof column.title === "string"
                  ? column.title
                  : i.toString());
              const columnSort = getColumnSort(id);
              return (
                <Table.Cell key={id} className={column.headerClassName}>
                  {column.sortable ? (
                    <span
                      className="group inline-flex cursor-pointer"
                      onClick={handleColumnClick(id)}
                    >
                      {column.title}
                      <span
                        className={clsx(
                          "mb-auto ml-2 flex-none rounded-sm text-zinc-400",
                          {
                            "bg-zinc-200 text-zinc-900 group-hover:bg-zinc-300":
                              columnSort?.[1],
                            "invisible group-hover:visible group-focus:visible":
                              !columnSort?.[1],
                          },
                        )}
                      >
                        <ChevronUpIcon
                          className={clsx("h-5 w-5", {
                            "scale-y-flip": columnSort?.[1] === "desc",
                          })}
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  ) : (
                    column.title
                  )}
                </Table.Cell>
              );
            })}
            {actions && <Table.Cell />}
          </Table.Row>
          {isLoading && (
            <tr className="absolute top-2 right-3 rounded-full bg-zinc-50/50 dark:bg-zinc-900/50">
              <td>
                <Loading className="mt-px" />
              </td>
            </tr>
          )}
        </Table.Head>
        <Table.Body>
          {data?.map((item) => {
            const RowComponent = rowWrapper || Fragment;
            return (
              <RowComponent
                key={item[idAccessor] as string}
                {...(RowComponent !== Fragment
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ({ item: item } as any)
                  : {})}
              >
                <Table.Row onClick={handleRowClick(item)}>
                  {columns.map((column, i) => {
                    const value = column.accessor
                      ? (item[column.accessor] as string)
                      : column.render && column.render(item);
                    return (
                      <Table.Cell
                        key={
                          column.id ||
                          (typeof column.title === "string" ? column.title : i)
                        }
                        className={column.cellClassName}
                        title={
                          column.cellClassName?.includes("max-w") &&
                          typeof value === "string"
                            ? value
                            : undefined
                        }
                      >
                        {value}
                      </Table.Cell>
                    );
                  })}
                  {actions && (
                    <Table.Cell actions>
                      {actions.map((action, i) => {
                        const ActionComponent = action.wrapper || Fragment;
                        return (
                          <ActionComponent
                            key={i}
                            {...(ActionComponent !== Fragment
                              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ({ item: item } as any)
                              : {})}
                          >
                            <Table.ActionButton
                              title={action.title}
                              onClick={() => action.onClick?.(item)}
                              href={
                                typeof action.href === "function"
                                  ? action.href?.(item)
                                  : action.href
                              }
                              target={action.target}
                            >
                              {action.icon}
                            </Table.ActionButton>
                          </ActionComponent>
                        );
                      })}
                    </Table.Cell>
                  )}
                </Table.Row>
              </RowComponent>
            );
          })}
          {isLoading && !data?.length && (
            <Table.Row>
              {columns.map((column, i) => (
                <Table.Cell
                  key={
                    column.id ||
                    (typeof column.title === "string" ? column.title : i)
                  }
                >
                  <Skeleton className="h-3" />
                </Table.Cell>
              ))}
              {actions && (
                <Table.Cell actions>
                  <Skeleton className="inline-block h-3 w-6" />
                </Table.Cell>
              )}
            </Table.Row>
          )}
          {!isLoading && !data?.length && (
            <Table.Row>
              <Table.Cell colSpan={columns.length + (actions ? 1 : 0)}>
                <Text variant="secondary">{noRecordsText}</Text>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {pagination ? (
        <Table.FooterWithPagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onChangePage={onChangePage}
          previousText={previousText}
          nextText={nextText}
          showingText={showingText}
          toText={toText}
          ofText={ofText}
          resultsText={resultsText}
        />
      ) : undefined}
    </Stack>
  );
}
