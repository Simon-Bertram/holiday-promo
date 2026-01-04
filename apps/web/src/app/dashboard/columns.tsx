import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "./types";

/**
 * Formats a date value for display
 */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

/**
 * Custom sorting function for date columns
 */
function dateSortingFn(
  rowA: { getValue: (key: string) => unknown },
  rowB: { getValue: (key: string) => unknown },
  columnId: string
): number {
  const dateA = new Date(rowA.getValue(columnId) as string | Date).getTime();
  const dateB = new Date(rowB.getValue(columnId) as string | Date).getTime();
  return dateA - dateB;
}

/**
 * Custom filter function for role column
 */
function roleFilterFn(
  row: { getValue: (key: string) => unknown },
  id: string,
  value: unknown
): boolean {
  return value === "" || row.getValue(id) === value;
}

/**
 * Column definitions for the users table
 */
export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="px-4 py-3 font-medium text-sm">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="px-4 py-3 text-sm">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="px-4 py-3 text-sm capitalize">{row.getValue("role")}</div>
    ),
    filterFn: roleFilterFn,
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div className="px-4 py-3 text-sm">
        {formatDate(row.getValue("createdAt"))}
      </div>
    ),
    sortingFn: (rowA, rowB) => dateSortingFn(rowA, rowB, "createdAt"),
  },
];
