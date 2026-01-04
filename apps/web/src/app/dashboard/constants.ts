/**
 * Dashboard table configuration constants
 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_SORT_COLUMN = "createdAt";
export const DEFAULT_SORT_DIRECTION = true; // Descending (newest first)

/**
 * User roles for filtering
 */
export const USER_ROLES = ["subscriber", "admin"] as const;
