export type SizedColumn = {
  id: string;
  size: number;
  // Resized by hand (or locked in size): never stretched to fill.
  fixed: boolean;
};

// Columns without a manual size share the room the container has beyond their
// base sizes, in proportion to those sizes. When every column is fixed the
// remainder becomes a filler, so a dragged column always keeps exactly the
// width it was dragged to.
export function fillColumnWidths(columns: SizedColumn[], available: number) {
  const widths: Record<string, number> = {};
  let total = 0;
  for (const column of columns) {
    widths[column.id] = column.size;
    total += column.size;
  }
  const slack = Math.floor(available) - total;
  if (!(slack > 0)) return { widths, filler: 0 };

  const flexible = columns.filter((column) => !column.fixed);
  const flexibleTotal = flexible.reduce((sum, column) => sum + column.size, 0);
  if (flexible.length === 0 || flexibleTotal <= 0) {
    return { widths, filler: slack };
  }

  let given = 0;
  flexible.forEach((column, index) => {
    const share =
      index === flexible.length - 1
        ? slack - given
        : Math.floor((slack * column.size) / flexibleTotal);
    widths[column.id] = column.size + share;
    given += share;
  });
  return { widths, filler: 0 };
}
