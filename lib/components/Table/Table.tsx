import clsx from "../../utils/clsx";
import type { ReactNode } from "react";
import TableActionButton from "./TableActionButton";
import TableBody from "./TableBody";
import TableCell from "./TableCell";
import TableHead from "./TableHead";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableFooter from "./TableFooter";
import TableFooterWithPagination from "./TableFooterWithPagination";

export type TableProps = {
  children?: ReactNode;
  className?: string;
  hideBorder?: boolean;
  autoHeight?: boolean;
};

export default function Table({
  children,
  className,
  hideBorder,
  autoHeight,
}: TableProps) {
  return (
    <div
      className={clsx(
        "overflow-hidden bg-white dark:bg-zinc-800",
        {
          "relative flex-1": autoHeight,
          "shadow-sm ring-1 ring-black/5 md:rounded-lg dark:ring-white/10":
            !hideBorder,
        },
        className,
      )}
    >
      <div
        className={clsx("overflow-auto", {
          "absolute inset-0": autoHeight,
        })}
      >
        <table
          className={clsx(
            "w-full max-w-full divide-y divide-zinc-300 dark:divide-zinc-600",
          )}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

Table.Row = TableRow;
Table.Head = TableHead;
Table.Body = TableBody;
Table.Cell = TableCell;
Table.ActionButton = TableActionButton;
Table.Header = TableHeader;
Table.Footer = TableFooter;
Table.FooterWithPagination = TableFooterWithPagination;
