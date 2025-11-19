# Dependencies vs Peer Dependencies

## Quick Summary

- **`dependencies`**: "I need this package, install it for me"
- **`peerDependencies`**: "I use this package, but I expect you (the consumer) to provide it"

## Detailed Explanation

### `dependencies`

When you list a package in `dependencies`:
- The package manager **automatically installs** it in your `node_modules`
- It creates a **local copy** specific to your package
- Each package in a monorepo can have its own version
- You don't control the version from outside your package

**Example:**
```json
{
  "dependencies": {
    "dotenv": "^17.2.3",
    "zod": "^4.1.12"
  }
}
```

This means: "I need `dotenv` and `zod` to work. Install them in my `node_modules` folder."

**Installation behavior:**
- ✅ Package manager installs it automatically
- ✅ Each package can have its own version
- ❌ Can lead to multiple instances in monorepos

### `peerDependencies`

When you list a package in `peerDependencies`:
- The package manager **does not automatically install** it
- You're telling consumers: "This package must be installed, but I won't install it for you"
- The **consumer** (your app or monorepo root) must provide it
- Forces a **single version** to be used across the entire project
- The package manager checks if it exists, but doesn't install it

**Example:**
```json
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7",
    "typescript": "^5"
  }
}
```

This means: "I need `drizzle-orm` and `typescript`, but I expect them to already be installed by whoever uses my package."

**Installation behavior:**
- ⚠️ Package manager checks if it exists (warns if missing)
- ✅ Consumer must install it (usually at root/app level)
- ✅ Ensures single instance across all packages
- ❌ Can break if consumer forgets to install

## Key Differences

| Aspect | `dependencies` | `peerDependencies` |
|--------|---------------|-------------------|
| **Installation** | Automatic | Manual (by consumer) |
| **Where installed** | Package's own `node_modules` | Consumer's `node_modules` |
| **Version control** | Each package can have different version | Single version shared across project |
| **Use case** | Packages you directly use | Packages that must be shared |
| **Breaking change** | Less likely (isolated) | More likely if consumer lacks it |

## When to Use Each

### Use `dependencies` when:
- ✅ You're using a package **internally** within your package
- ✅ The package doesn't need to be shared with consumers
- ✅ Different versions are acceptable or desirable
- ✅ You want automatic installation

**Examples:**
- Utility libraries (`lodash`, `date-fns`)
- Internal helpers (`dotenv`, `zod` for validation)
- Build tools used only in your package

### Use `peerDependencies` when:
- ✅ You're creating a **plugin** or **extension** for another package
- ✅ You need to **share types** or instances across packages
- ✅ Multiple versions would cause conflicts
- ✅ The consumer must control the version

**Examples:**
- React plugins (must use same React instance)
- Drizzle ORM operators (must use same drizzle instance)
- TypeScript (shared across monorepo)
- Build tools that must match consumer's version

## Real-World Example from Your Codebase

### Before (Using `dependencies`)

```json
// packages/db/package.json
{
  "dependencies": {
    "drizzle-orm": "catalog:"
  }
}

// packages/api/package.json
{
  "dependencies": {
    "drizzle-orm": "catalog:"
  }
}
```

**Problem:**
- Each package installs its own `drizzle-orm`
- TypeScript sees them as different types
- Type errors occur when mixing them

**Result:**
```
Type 'import(.../drizzle-orm@0.44.7/node_modules/drizzle-orm/...).SQL<unknown>'
is not assignable to type 
'import(.../drizzle-orm@0.44.7+827b4d7288807108/node_modules/drizzle-orm/...).SQL<unknown>'
```

### After (Using `peerDependencies`)

```json
// packages/db/package.json
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7"
  }
}

// packages/api/package.json
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7"
  }
}

// Root package.json
{
  "dependencies": {
    "drizzle-orm": "^0.44.7"
  }
}
```

**Solution:**
- Root package installs `drizzle-orm` once
- Both packages reference the same instance
- TypeScript sees them as the same type
- No type errors!

## Monorepo Best Practices

### Shared Dependencies Pattern

For packages that must share instances (like ORMs, frameworks, TypeScript):

```json
// Root package.json
{
  "dependencies": {
    "drizzle-orm": "^0.44.7"
  }
}

// packages/db/package.json
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7"
  }
}

// packages/api/package.json
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7"
  }
}
```

**Benefits:**
- ✅ Single instance (type consistency)
- ✅ Smaller `node_modules` (no duplicates)
- ✅ Faster installs
- ✅ Version conflicts avoided

### Package-Specific Dependencies Pattern

For packages used internally:

```json
// packages/db/package.json
{
  "dependencies": {
    "@neondatabase/serverless": "^1.0.1",
    "ws": "^8.18.3"
  }
}
```

**Benefits:**
- ✅ Each package manages its own dependencies
- ✅ No interference between packages
- ✅ Easy to update independently

## Common Pitfalls

### ❌ Using `dependencies` for Shared Packages

**Problem:**
```json
// Wrong: Creates multiple instances
{
  "dependencies": {
    "drizzle-orm": "^0.44.7"
  }
}
```

**Result:** Type errors, larger `node_modules`, version conflicts

### ❌ Forgetting to Install `peerDependencies`

**Problem:**
```json
// Your package
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7"
  }
}
```

But root doesn't install it!

**Result:** Runtime errors when trying to import `drizzle-orm`

**Solution:** Always install peer dependencies at root/app level

### ✅ Correct Pattern

```json
// Root package.json - INSTALL here
{
  "dependencies": {
    "drizzle-orm": "^0.44.7"
  }
}

// packages/db/package.json - DECLARE here
{
  "peerDependencies": {
    "drizzle-orm": "^0.44.7"
  }
}
```

## Visual Comparison

### `dependencies` Installation
```
monorepo-root/
├── node_modules/
│   └── some-package/
└── packages/
    ├── db/
    │   └── node_modules/
    │       └── drizzle-orm/  ← Installed here
    └── api/
        └── node_modules/
            └── drizzle-orm/  ← Installed here (different instance!)
```

### `peerDependencies` Installation (with hoisted linker)
```
monorepo-root/
├── node_modules/
│   └── drizzle-orm/  ← Installed once at root
└── packages/
    ├── db/
    │   └── (references root drizzle-orm)
    └── api/
        └── (references root drizzle-orm)
```

## Summary

- **`dependencies`**: "I need this, install it for me" → Creates local copy
- **`peerDependencies`**: "I use this, but you provide it" → Shares single instance

**For your drizzle-orm case:**
- ✅ Root installs (`dependencies`)
- ✅ Packages declare requirement (`peerDependencies`)
- ✅ Result: Single instance, no type errors, no barrel files!

