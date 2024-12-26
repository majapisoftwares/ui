import clsx from "../../utils/clsx";
import { MouseEventHandler, ReactNode } from "react";

export type TableRowProps = {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
  className?: string;
};

function TableRow({ children, onClick, className, ...props }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        {
          "group/row cursor-pointer hover:bg-black/5 dark:hover:bg-white/5":
            !!onClick,
        },
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export default TableRow;
