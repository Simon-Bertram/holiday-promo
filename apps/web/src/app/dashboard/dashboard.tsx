"use client";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { orpc } from "@/utils/orpc";
import { userColumns } from "./columns";
import { AccountInfo } from "./components/account-info";
import { ErrorState } from "./components/error-state";
import { LoadingState } from "./components/loading-state";
import { TableFilters } from "./components/table-filters";
import { TablePagination } from "./components/table-pagination";
import { UsersTable } from "./components/users-table";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_COLUMN,
  DEFAULT_SORT_DIRECTION,
} from "./constants";
import type { SessionWithRole } from "./types";

/**
 * Dashboard component that displays user account information and a list of all users.
 * Shows the current user's session details and a sortable, filterable, paginated table of registered users.
 */
export default function Dashboard({ session }: { session: SessionWithRole }) {
  const usersQuery = useQuery(orpc.user.list.queryOptions());

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: DEFAULT_SORT_COLUMN,
      desc: DEFAULT_SORT_DIRECTION,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleSortingChange = useCallback((updater: unknown) => {
    setSorting((prev) => {
      const newValue = typeof updater === "function" ? updater(prev) : updater;
      return newValue as SortingState;
    });
  }, []);

  const handleColumnFiltersChange = useCallback((updater: unknown) => {
    setColumnFilters((prev) => {
      const newValue = typeof updater === "function" ? updater(prev) : updater;
      return newValue as ColumnFiltersState;
    });
  }, []);

  const tableOptions = useMemo(
    () => ({
      data: usersQuery.data ?? [],
      columns: userColumns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: handleSortingChange,
      onColumnFiltersChange: handleColumnFiltersChange,
      state: {
        sorting,
        columnFilters,
      },
      initialState: {
        pagination: {
          pageSize: DEFAULT_PAGE_SIZE,
        },
      },
    }),
    [
      usersQuery.data,
      sorting,
      columnFilters,
      handleSortingChange,
      handleColumnFiltersChange,
    ]
  );

  // React Compiler: TanStack Table's useReactTable returns functions that cannot be memoized.
  // This is expected behavior - React Compiler will skip memoization for this call.
  // The table instance is safe to use as long as child components are not memoized.
  const table = useReactTable(tableOptions);

  if (usersQuery.isLoading) {
    return <LoadingState />;
  }

  if (usersQuery.isError) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      <AccountInfo session={session} />
      <TableFilters table={table} />
      <UsersTable table={table} />
      <TablePagination table={table} />
    </div>
  );
}
