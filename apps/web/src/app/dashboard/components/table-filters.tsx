import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { USER_ROLES } from "../constants";
import type { User } from "../types";

interface TableFiltersProps {
  table: Table<User>;
}

/**
 * Filter controls for the users table
 */
export function TableFilters({ table }: TableFiltersProps) {
  const nameFilter =
    (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const emailFilter =
    (table.getColumn("email")?.getFilterValue() as string) ?? "";
  const roleFilter =
    (table.getColumn("role")?.getFilterValue() as string) ?? "";

  return (
    <div className="flex flex-wrap gap-4">
      <div className="min-w-[200px] flex-1">
        <Input
          className="max-w-sm"
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          placeholder="Filter by name..."
          value={nameFilter}
        />
      </div>
      <div className="min-w-[200px] flex-1">
        <Input
          className="max-w-sm"
          onChange={(e) =>
            table.getColumn("email")?.setFilterValue(e.target.value)
          }
          placeholder="Filter by email..."
          value={emailFilter}
        />
      </div>
      <div className="min-w-[200px] flex-1">
        <select
          className={cn(
            "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "max-w-sm"
          )}
          onChange={(e) =>
            table.getColumn("role")?.setFilterValue(e.target.value || undefined)
          }
          value={roleFilter}
        >
          <option value="">All roles</option>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
