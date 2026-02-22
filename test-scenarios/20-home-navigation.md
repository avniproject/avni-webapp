# Home Page and Navigation Test Scenarios

## Overview
Browser-based functional tests for the home page dashboard, module navigation, breadcrumbs, and general UI navigation in the Avni web application.

---

## TS-NAV-001: Home Page Displays Navigation Cards Based on Privileges

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `/home`.

**Expected Result:** The home page is displayed with navigation cards corresponding to the user's privileges:
- **Data Entry** card for users with data entry access.
- **App Designer** card for users with designer access.
- **Admin** card for users with admin access.
- **Reports** card for users with reporting access.
- **Help/Tutorials** card (if available).

Users without a privilege do not see the corresponding card.

---

## TS-NAV-002: Home Page Card Navigation – Click to Open Module

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to the home page.
2. Click the **Data Entry** navigation card.

**Expected Result:** The application navigates to the data entry module (`/app/`). The subject search/filter form is displayed.

---

## TS-NAV-003: Home Page Card Navigation – App Designer

**Preconditions:** User has App Designer privileges.

**Steps:**
1. From the home page, click the **App Designer** card.

**Expected Result:** The App Designer module is opened at `/appdesigner/`. The form/configuration management interface is displayed.

---

## TS-NAV-004: Home Page Card Navigation – Admin Panel

**Preconditions:** User has admin privileges.

**Steps:**
1. From the home page, click the **Admin** card.

**Expected Result:** The admin panel at `/admin/` is opened. The admin navigation menu (users, locations, organisations, etc.) is visible.

---

## TS-NAV-005: Breadcrumb Navigation in Data Entry

**Preconditions:** User is in a multi-step workflow (e.g., viewing a program encounter from a subject's dashboard).

**Steps:**
1. Navigate to: Home → Subject Search → Subject Dashboard → Program → Program Encounter.
2. Observe the breadcrumb trail at the top of the page.
3. Click a breadcrumb link (e.g., the subject's name).

**Expected Result:** The breadcrumb reflects the current navigation path. Clicking a breadcrumb navigates back to that level in the hierarchy. Data in the parent view is preserved.

---

## TS-NAV-006: App Bar – User Account Menu

**Preconditions:** User is logged in.

**Steps:**
1. Click the user account icon or name in the app bar.
2. Observe the dropdown/menu options.

**Expected Result:** The user account menu displays options such as:
- The current user's name.
- **Logout** option.
- Possibly profile settings or language settings.

---

## TS-NAV-007: App Bar – Navigate to Home from Any Page

**Preconditions:** User is on a deep page within the application.

**Steps:**
1. Navigate several levels deep (e.g., into a program encounter form).
2. Click the application logo or home icon in the app bar.

**Expected Result:** The user is navigated back to the home page (`/home`). The form or workflow in progress is abandoned (with confirmation if required).

---

## TS-NAV-008: Browser Back Button Works Correctly

**Preconditions:** User has navigated through multiple pages.

**Steps:**
1. Navigate from home → data entry → subject dashboard.
2. Press the browser's **Back** button.

**Expected Result:** The browser navigates back to the previous page (subject search, not home). The page state is restored as expected.

---

## TS-NAV-009: Direct URL Access to Module Pages

**Preconditions:** User is authenticated.

**Steps:**
1. Directly type or navigate to a module URL (e.g., `/app/`, `/admin/`, `/appdesigner/`).

**Expected Result:** The module is loaded correctly without errors. The user's privileges are respected (they are redirected if they lack access).

---

## TS-NAV-010: Error State – 404 or Invalid Route

**Preconditions:** User attempts to access a route that does not exist.

**Steps:**
1. Navigate to a URL that does not correspond to any valid route (e.g., `/nonexistentpage`).

**Expected Result:** A meaningful error page or redirect is shown. The application does not crash. The user can navigate back to a valid page.

---

## TS-NAV-011: Help / Tutorials Page

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to the help/tutorials section (via the home page or `/help`).

**Expected Result:** The tutorials/help page is displayed with relevant documentation or video content. Links within the help content are functional.

---

## TS-NAV-012: Idle Timeout Warning Dialog

**Preconditions:** Session idle timeout is configured (e.g., 30 minutes).

**Steps:**
1. Log in.
2. Leave the application idle for the configured timeout period.

**Expected Result:** Before the session expires, a warning dialog appears informing the user that their session is about to expire. The user can choose to stay logged in or be logged out. If the session expires, the user is redirected to the login page.
