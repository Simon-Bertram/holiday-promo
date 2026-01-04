import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortIconProps {
  column: Column<unknown, unknown>;
}

/**
 * Displays the appropriate sort icon based on column sort state
 */
export function SortIcon({ column }: SortIconProps) {
  if (!column.getCanSort()) {
    return null;
  }

  const sortDirection = column.getIsSorted();

  let Icon: typeof ArrowUp | typeof ArrowDown | typeof ArrowUpDown;
  if (sortDirection === "asc") {
    Icon = ArrowUp;
  } else if (sortDirection === "desc") {
    Icon = ArrowDown;
  } else {
    Icon = ArrowUpDown;
  }

  return (
    <span className="inline-block">
      <Icon className={sortDirection ? "size-4" : "size-4 opacity-50"} />
    </span>
  );
}
