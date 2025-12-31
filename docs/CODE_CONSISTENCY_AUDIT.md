# Code Consistency Audit

This document lists code features that should be consistent across the application and their current status.

## 1. Error Handling Patterns

### ✅ Should Be Consistent

- API route error responses
- Auth error handling
- Error logging
- Error message format

### 🔍 Current Status

#### API Route Error Responses

**Status: ❌ INCONSISTENT**

**Pattern 1** (subscribe route, auth route):

```typescript
NextResponse.json(
  {
    error: {
      message: "...",
      statusText: "Bad Request",
    },
  },
  { status: 400 }
);
```

**Pattern 2** (rpc route):

```typescript
createErrorResponse(error); // Returns 500 with standardized format
```

**Pattern 3** (facebook route):

```typescript
NextResponse.json({ error: "signed_request missing" }, { status: 400 });
```

**Issue**: Three different error response formats across API routes.

**Recommendation**: Standardize on Pattern 1 for all API routes, or create a utility function that all routes use.

#### Auth Error Handling

**Status: ⚠️ PARTIALLY INCONSISTENT**

**use-sign-in.ts**: ✅ Uses `handleAuthError` utility

```typescript
handleAuthError(error, data.email);
```

**use-sign-up.ts**: ❌ Does NOT use `handleAuthError` utility

```typescript
const errorMessage =
  error.error.message || error.error.statusText || "Sign up failed";
toast.error(errorMessage);
```

**use-verify-magic-link.ts**: ✅ Uses `normalizeAuthError` and `logAuthError`

**Recommendation**: Update `use-sign-up.ts` to use `handleAuthError` for consistency.

---

## 2. Loading State Naming

### ✅ Should Be Consistent

- Loading state variable names
- Loading state return types

### 🔍 Current Status

**Status: ❌ INCONSISTENT**

**Patterns Found**:

- `isLoading` - Used in `use-sign-in`, `use-google-sign-in`, `use-facebook-sign-in`
- `isPending` - Used in `authClient.useSession()`, `use-profile-form`
- `isSubmitting` - Used in forms (`use-contact-form`, `use-profile-form`, form components)

**Issues**:

1. `use-sign-in.ts` returns `isLoading: false` but never actually tracks loading state
2. Mixed naming conventions across hooks
3. Forms use `isSubmitting` (from react-hook-form), hooks use `isLoading` or `isPending`

**Recommendation**:

- Use `isLoading` for async operations in hooks
- Use `isSubmitting` for form submissions (react-hook-form standard)
- Use `isPending` only when matching external library APIs (e.g., authClient)
- Fix `use-sign-in` to actually track loading state

---

## 3. Toast Notification Patterns

### ✅ Should Be Consistent

- Success message format
- Error message format
- Toast duration

### 🔍 Current Status

**Status: ⚠️ MOSTLY CONSISTENT**

**Success Messages**: ✅ Consistent

- "Magic link sent! Check your email." (sign-in, sign-up)
- "Sign in successful" (social logins)
- "Profile updated successfully"
- "Account deleted successfully"
- "Thank you for your message! We'll get back to you soon." (contact form)

**Error Messages**: ⚠️ Inconsistent

- Some use normalized errors: `toast.error(normalizedError.message, { duration: TOAST_DURATION })`
- Some use direct error messages: `toast.error(errorMessage)`
- Some use custom messages: `toast.error("Failed to delete account. Please try again.")`

**Duration**: ❌ Inconsistent

- `handleAuthError` uses `TOAST_DURATION = 5000`
- Other toasts don't specify duration (uses default)

**Recommendation**:

- Create a toast utility with consistent duration
- Always use normalized error messages where available

---

## 4. Turnstile Token Management

### ✅ Should Be Consistent

- Token setting
- Token clearing
- Token validation

### 🔍 Current Status

**Status: ⚠️ MOSTLY CONSISTENT**

**use-sign-in.ts**: ✅ Clears token in `finally` block

```typescript
finally {
  setTurnstileToken(null);
}
```

**use-sign-up.ts**: ✅ Clears token in `finally` block

```typescript
finally {
  setTurnstileToken(null);
}
```

**auth-client.ts**: ✅ Clears token after use in custom fetch

```typescript
if (turnstileTokenHeader) {
  headers.set("x-turnstile-token", turnstileTokenHeader);
  turnstileTokenHeader = null; // Clear after use
}
```

**Status**: ✅ Consistent pattern across all auth hooks.

---

## 5. API Route Structure

### ✅ Should Be Consistent

- Error handling
- Request validation
- Response format
- Status codes

### 🔍 Current Status

**Status: ⚠️ PARTIALLY CONSISTENT**

**Request Validation**:

- ✅ `subscribe` route: Uses Zod schema validation
- ✅ `rpc` route: Uses oRPC validation
- ❌ `facebook` route: Manual validation
- ✅ `auth` route: Uses Better Auth validation

**Error Handling**:

- ✅ `subscribe` route: Try/catch with structured errors
- ✅ `rpc` route: Uses error interceptors + try/catch
- ✅ `facebook` route: Try/catch with simple errors
- ✅ `auth` route: Uses Better Auth error handling

**Response Format**: ❌ Inconsistent (see Error Handling section above)

**Status Codes**: ✅ Consistent use of appropriate HTTP status codes

---

## 6. Form Validation

### ✅ Should Be Consistent

- Validation library (Zod)
- Form library (react-hook-form)
- Error display

### 🔍 Current Status

**Status: ✅ CONSISTENT**

- All forms use Zod schemas
- All forms use react-hook-form
- All forms use consistent Field components for error display
- Validation patterns are consistent

---

## 7. TypeScript Return Types

### ✅ Should Be Consistent

- Hook return types
- Function return types
- Explicit type definitions

### 🔍 Current Status

**Status: ⚠️ MOSTLY CONSISTENT**

**Hooks with explicit return types**: ✅

- `use-sign-in`: `UseSignInResult`
- `use-verify-magic-link`: `UseVerifyMagicLinkResult`
- `use-contact-form`: `UseContactFormReturn`

**Hooks without explicit return types**: ⚠️

- `use-sign-up`: Returns `{ signUp }` without type
- `use-google-sign-in`: Returns `{ signIn, isLoading }` without type
- `use-facebook-sign-in`: Returns `{ signIn, isLoading }` without type

**Recommendation**: Add explicit return types to all hooks for consistency.

---

## 8. Error Boundary Patterns

### ✅ Should Be Consistent

- Error logging
- Error display
- Recovery actions

### 🔍 Current Status

**Status: ✅ CONSISTENT**

All error boundaries follow the same pattern:

- Log errors in `useEffect`
- Show user-friendly messages
- Display error details in development only
- Provide "Try again" and "Go home" buttons
- Consistent Card-based UI

---

## 9. Constants and Configuration

### ✅ Should Be Consistent

- Magic strings should be constants
- Configuration values centralized

### 🔍 Current Status

**Status: ✅ GOOD**

- Auth constants in `@/lib/constants/auth`
- Error messages mapped in `@/lib/errors/auth-errors`
- Toast duration constant in `auth-error-handler.ts`

**Minor Issue**: Some hardcoded strings in components (e.g., "Sending...", "Subscribing...") could be constants.

---

## 10. Component Structure

### ✅ Should Be Consistent

- Component organization
- Props interfaces
- Export patterns

### 🔍 Current Status

**Status: ✅ CONSISTENT**

- Components follow consistent structure
- Props interfaces are well-defined
- Default exports for components
- Named exports for utilities

---

## Summary of Issues

### Critical (Should Fix)

1. ❌ **API Route Error Response Format** - Three different formats
2. ❌ **use-sign-up Error Handling** - Doesn't use `handleAuthError` utility
3. ❌ **Loading State Naming** - Mixed `isLoading`, `isPending`, `isSubmitting`
4. ❌ **use-sign-in Loading State** - Returns hardcoded `false`, doesn't track actual state

### Medium Priority (Should Fix)

5. ⚠️ **Toast Duration** - Inconsistent across toasts
6. ⚠️ **Hook Return Types** - Some hooks missing explicit types
7. ⚠️ **Error Message Format** - Some use normalized, some don't

### Low Priority (Nice to Have)

8. ⚠️ **Hardcoded Strings** - Some UI strings could be constants

---

## Recommendations

1. **Create standardized error response utility** for all API routes
2. **Update use-sign-up** to use `handleAuthError` utility
3. **Standardize loading state naming** - Use `isLoading` for hooks, `isSubmitting` for forms
4. **Fix use-sign-in** to actually track loading state
5. **Create toast utility** with consistent duration
6. **Add explicit return types** to all hooks
7. **Extract hardcoded strings** to constants file
