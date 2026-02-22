# Authentication Test Scenarios

## Overview
Browser-based functional tests for login, logout, session management, and access control in the Avni web application.

---

## TS-AUTH-001: Successful Login with Valid Credentials

**Preconditions:** Server is running; a valid user account exists.

**Steps:**
1. Navigate to the application root URL.
2. The login page is displayed.
3. Enter a valid username.
4. Enter the corresponding valid password.
5. Click the **Login** button.

**Expected Result:** The user is authenticated and redirected to the home page (`/home`). The navigation menu reflects the user's role and privileges.

---

## TS-AUTH-002: Login Failure with Invalid Credentials

**Preconditions:** Server is running.

**Steps:**
1. Navigate to the application root URL.
2. Enter an invalid username or wrong password.
3. Click the **Login** button.

**Expected Result:** An error message is displayed (e.g., "Invalid username or password"). The user remains on the login page and is not redirected.

---

## TS-AUTH-003: Login with Empty Credentials

**Preconditions:** Server is running.

**Steps:**
1. Navigate to the login page.
2. Leave the username and password fields empty.
3. Click the **Login** button.

**Expected Result:** Validation messages appear for the required fields. The form is not submitted; the user remains on the login page.

---

## TS-AUTH-004: Successful Logout

**Preconditions:** User is logged in.

**Steps:**
1. Click the user account menu or logout button in the application header/app bar.
2. Select **Logout**.

**Expected Result:** The user's session is terminated. The user is redirected to the login page. Navigating back via the browser does not allow access to protected pages without re-authenticating.

---

## TS-AUTH-005: Session Timeout – Redirect to Login

**Preconditions:** User is logged in. Session idle timeout is configured (default 30 minutes).

**Steps:**
1. Log in successfully.
2. Leave the application idle for longer than the configured timeout period.
3. Attempt to interact with the application (click a link or button).

**Expected Result:** The user is redirected to the login page. A message may inform the user that their session has expired. After re-authenticating, the user can continue using the application.

---

## TS-AUTH-006: Access Protected Route Without Authentication

**Preconditions:** No user session exists (not logged in or cookies cleared).

**Steps:**
1. Directly navigate to a protected URL (e.g., `/home`, `/app/`, `/admin/`).

**Expected Result:** The user is redirected to the login page and cannot access the protected content without authenticating first.

---

## TS-AUTH-007: Role-Based Access – Admin Route Restricted to Non-Admin

**Preconditions:** A user account exists with a non-admin role (e.g., data entry user only).

**Steps:**
1. Log in with a non-admin user account.
2. Attempt to navigate to `/admin/` or `/appdesigner/`.

**Expected Result:** Access is denied. The user either sees an "Unauthorized" or "Access Denied" message, or is redirected to the home page. Admin-only navigation items are not visible in the menu.

---

## TS-AUTH-008: Home Page Navigation Cards Reflect User Privileges

**Preconditions:** User is logged in.

**Steps:**
1. Log in with a user account.
2. Navigate to the home page (`/home`).
3. Observe the navigation cards/tiles displayed.

**Expected Result:** Only the modules the user has privileges to access are shown as navigation cards (e.g., a data entry user sees "Data Entry" but not "App Designer" or "Admin").

---

## TS-AUTH-009: Cognito Authentication Flow (if Cognito IDP is configured)

**Preconditions:** The organisation is configured to use AWS Cognito as the IDP.

**Steps:**
1. Navigate to the application root URL.
2. The application redirects to the Cognito-hosted login page.
3. Enter valid Cognito credentials and complete MFA if required.
4. Complete authentication.

**Expected Result:** The user is redirected back to the application and is logged in. The home page is displayed with appropriate navigation options.

---

## TS-AUTH-010: Remember Session Across Browser Tabs

**Preconditions:** User is logged in in Tab A.

**Steps:**
1. Open a new browser tab.
2. Navigate to the application URL in the new tab.

**Expected Result:** The existing session is recognised. The user does not need to log in again and is shown the home page or the last visited page.
