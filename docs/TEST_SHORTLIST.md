# Test Shortlist - Priority Ranking

This document outlines the most important and beneficial tests for the holiday-promo application, prioritized by impact, risk, and business value.

## 🔴 Critical Priority (Security & Core Functionality)

### 1. Authentication & Authorization Tests
**Why:** Security-critical functionality that protects user data and system access.

#### 1.1 Authentication Flow
- ✅ **Sign In (Email/Password)**
  - Valid credentials succeed
  - Invalid credentials fail with appropriate error
  - Missing credentials show validation errors
  - Session cookie is set on successful login
  
- ✅ **Sign Up (Email/Password)**
  - Valid registration succeeds
  - Duplicate email fails with conflict error
  - Password validation (min length, strength)
  - User role defaults to "subscriber"
  
- ✅ **Social Authentication (Google/Facebook)**
  - OAuth flow initiates correctly
  - Successful callback creates session
  - Failed OAuth shows appropriate error
  - New users are created with correct role

- ✅ **Sign Out**
  - Session is invalidated
  - Cookie is cleared
  - User is redirected appropriately

#### 1.2 Session Management
- ✅ **Session Validation**
  - Valid session allows access to protected routes
  - Expired session redirects to login
  - Invalid session cookie is rejected
  - Session persists across page refreshes

- ✅ **Protected Route Access**
  - Unauthenticated users are redirected to `/login`
  - Authenticated users can access protected pages
  - Admin-only routes reject non-admin users

#### 1.3 Authorization (Role-Based Access)
- ✅ **Protected Procedures**
  - `user.me` requires authentication
  - `user.list` requires admin role
  - `user.updateProfile` requires subscriber role
  - `user.delete` requires authentication
  - Unauthorized access returns proper error codes

- ✅ **Context Validation**
  - `protectedProcedure` throws UNAUTHORIZED when no session
  - `adminProcedure` throws FORBIDDEN for non-admin users
  - Context includes correct user data

---

### 2. User Profile Management Tests
**Why:** Core user functionality with data integrity and security implications.

#### 2.1 Profile Updates
- ✅ **Update Profile (Subscriber)**
  - Valid name/email updates succeed
  - Email uniqueness is enforced (conflict error)
  - Only subscribers can update profiles
  - Admin users are redirected (cannot update)
  - Updated data persists correctly

- ✅ **Profile Form Validation**
  - Name field validation (required, min length)
  - Email field validation (format, required)
  - Form shows validation errors appropriately
  - Submit button disabled during submission

#### 2.2 Account Deletion
- ✅ **User Self-Deletion**
  - Authenticated user can delete own account
  - Account deletion succeeds via `user.delete` procedure
  - User is signed out after deletion
  - Deletion confirmation UI works correctly
  - Unauthenticated users cannot delete accounts

- ✅ **Facebook Data Deletion Callback**
  - Valid `signed_request` is verified correctly
  - Invalid signature is rejected
  - Facebook user ID is extracted correctly
  - Associated Better Auth user is deleted
  - Confirmation URL is returned with correct format
  - Missing `signed_request` returns 400 error
  - Missing user_id in payload returns 400 error
  - Handles both JSON and form-data request types

---

## 🟠 High Priority (Data Integrity & API Reliability)

### 3. API Endpoint Tests
**Why:** Ensures API contracts are maintained and errors are handled properly.

#### 3.1 ORPC Router Procedures
- ✅ **Health Check**
  - Public endpoint returns "OK"
  - No authentication required

- ✅ **User Procedures**
  - `user.me` returns correct user data
  - `user.list` returns all users (admin only)
  - `user.updateProfile` validates input schema
  - `user.delete` removes user from database
  - All procedures handle errors gracefully

#### 3.2 API Error Handling
- ✅ **Error Responses**
  - UNAUTHORIZED errors for missing auth
  - FORBIDDEN errors for insufficient permissions
  - CONFLICT errors for duplicate emails
  - NOT_FOUND errors for missing resources
  - Error messages are user-friendly
  - Error codes match ORPCError types

#### 3.3 Request/Response Validation
- ✅ **Input Validation**
  - Zod schemas validate input correctly
  - Invalid input returns validation errors
  - Type safety is maintained end-to-end

---

### 4. Database Operations Tests
**Why:** Ensures data persistence and integrity.

#### 4.1 User Service Functions
- ✅ **deleteUserById Service**
  - User is deleted from database
  - Missing userId throws error
  - Related data is handled (cascade or manual cleanup)

#### 4.2 Data Integrity
- ✅ **Email Uniqueness**
  - Duplicate email check works correctly
  - Self-update with same email succeeds
  - Update to existing email fails

---

## 🟡 Medium Priority (User Experience & Edge Cases)

### 5. Component Integration Tests
**Why:** Ensures UI components work correctly with backend.

#### 5.1 Profile Page
- ✅ **Profile Page Rendering**
  - Displays user information correctly
  - Redirects unauthenticated users
  - Redirects admin users to dashboard
  - Shows correct role information
  - Handles missing optional fields gracefully

#### 5.2 Form Components
- ✅ **Profile Form Integration**
  - Form loads with initial values
  - Form submission calls correct API
  - Success/error states display correctly
  - Loading states prevent double submission

#### 5.3 Delete Account Flow
- ✅ **Delete Account Button**
  - Confirmation dialog appears
  - Cancel button works
  - Delete action calls API correctly
  - Success toast appears
  - User is redirected after deletion

---

### 6. Client-Side Error Handling
**Why:** Ensures graceful error handling in the UI.

#### 6.1 React Query Error Handling
- ✅ **Global Error Handling**
  - Query errors show toast notifications
  - Retry action invalidates queries
  - Network errors are handled gracefully

#### 6.2 ORPC Client Error Handling
- ✅ **API Call Errors**
  - Failed mutations show error messages
  - Error toasts are user-friendly
  - Errors don't crash the application

---

## 🟢 Lower Priority (Nice to Have)

### 7. Edge Cases & Boundary Conditions
- ✅ **Empty States**
  - Empty user list displays correctly
  - Missing user data handles gracefully

- ✅ **Concurrent Operations**
  - Multiple profile updates don't conflict
  - Race conditions in deletion are handled

### 8. Performance & Optimization
- ✅ **Query Caching**
  - React Query caches data correctly
  - Cache invalidation works on mutations
  - Stale data is refetched appropriately

---

## Test Implementation Strategy

### Recommended Test Types by Priority:

1. **Unit Tests** (Fast, Isolated)
   - Service functions (`deleteUserById`)
   - Validation schemas (Zod)
   - Utility functions
   - Form hooks (`useProfileForm`)

2. **Integration Tests** (API + Database)
   - ORPC router procedures
   - API route handlers
   - Authentication flows
   - Facebook data deletion callback

3. **Component Tests** (React Testing Library)
   - Profile form
   - Delete account button
   - Authentication forms
   - Error boundaries

4. **E2E Tests** (Playwright/Cypress) - Optional
   - Complete user flows
   - Authentication journey
   - Profile update flow
   - Account deletion flow

### Testing Tools Already Configured:
- ✅ Vitest (test runner)
- ✅ React Testing Library (component testing)
- ✅ jsdom (DOM environment)
- ✅ Coverage reporting (v8)

### Recommended Additional Tools:
- `@testing-library/user-event` - For user interaction simulation
- `msw` (Mock Service Worker) - For API mocking in tests
- `@vitest/ui` - For better test visualization

---

## Quick Start Testing Checklist

Start with these tests in order:

1. ✅ Authentication sign-in/sign-up (unit + integration)
2. ✅ Protected procedure authorization (integration)
3. ✅ Profile update with validation (integration + component)
4. ✅ Account deletion flow (integration + component)
5. ✅ Facebook data deletion callback (integration)
6. ✅ Error handling in API routes (integration)
7. ✅ Form validation (component)
8. ✅ Session management (integration)

---

## Notes

- Focus on **security-critical paths first** (auth, authorization, deletion)
- **Integration tests** provide the most value for API endpoints
- **Component tests** ensure UI works correctly with backend
- Consider **mocking external services** (OAuth providers, Facebook) for reliability
- Use **test databases** for integration tests to avoid data pollution

