import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGE_SIZE_OPTIONS } from "../constants";
import type { User } from "../types";

interface TablePaginationProps {
  table: Table<User>;
}

/**
 * Pagination controls for the users table
 */
export function TablePagination({ table }: TablePaginationProps) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          size="sm"
          variant="outline"
        >
          First
        </Button>
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(totalPages - 1)}
          size="sm"
          variant="outline"
        >
          Last
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <select
          className={cn(
            "flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          )}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          value={pageSize}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
