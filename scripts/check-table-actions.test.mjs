import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tableActionViolations } from "./check-standards.mjs";

describe("check:ui: table row actions sit on the right as icon-only buttons with Tooltip", () => {
  it("flags text buttons, native title attributes, and non-final action columns", () => {
    const middle = tableActionViolations(`
      const columns: ColumnDef<Row, unknown>[] = [
        { id: "name", header: t.name },
        { id: "view", header: "", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => act(row.original)}>{t.viewAs}</Button> },
        { id: "lastActive", header: t.lastActive },
      ];
      <DataTable columns={columns} data={rows} />
    `);
    assert.ok(middle.some((entry) => /icon-only/.test(entry)), middle.join("\n"));
    assert.ok(middle.some((entry) => /last column/.test(entry)), middle.join("\n"));

    const nativeTitle = tableActionViolations(`
      <TableCell className="text-right">
        <Button variant="ghost" size="icon-sm" aria-label={t.remove} title={t.remove} onClick={onRemove}>
          <Trash2Icon />
        </Button>
      </TableCell>
    `);
    assert.ok(nativeTitle.some((entry) => /not native title/.test(entry)), nativeTitle.join("\n"));
  });

  it("allows DataTable rowActions and DataTableRowAction", () => {
    assert.deepEqual(
      tableActionViolations(`
        const columns: ColumnDef<Row, unknown>[] = [
          { id: "name", header: t.name },
        ];
        <DataTable columns={columns} data={rows} rowActions={(row) => <DataTableRowAction icon={<Trash2Icon />} label={t.remove} onClick={() => remove(row)} />} />
      `),
      [],
    );
    assert.deepEqual(
      tableActionViolations(`
        <TableCell className="text-right">
          <DataTableRowActions>
            <DataTableRowAction icon={<Trash2Icon />} label={t.remove} onClick={onRemove} />
          </DataTableRowActions>
        </TableCell>
      `),
      [],
    );
  });
});
