# Admin – User Management Test Scenarios

## Overview
Browser-based functional tests for user management in the Avni admin panel, including creating, editing, and deactivating user accounts, assigning roles, and managing user groups.

---

## TS-USRMGR-001: Create a New User

**Preconditions:** Admin user is logged in. The admin panel is accessible at `/admin/`.

**Steps:**
1. Navigate to the admin panel.
2. Click on **Users** in the navigation.
3. Click the **Create** or **+ New User** button.
4. Fill in required fields:
   - Username
   - Name
   - Email address
   - Phone number (if required)
   - Password
5. Assign a catchment area.
6. Assign roles/privileges.
7. Click **Save**.

**Expected Result:** The user is created successfully. The new user appears in the user list. A success notification is shown. The new user can log in with the provided credentials.

---

## TS-USRMGR-002: Create User – Validation on Required Fields

**Preconditions:** Admin is logged in. The create user form is open.

**Steps:**
1. Open the create user form.
2. Leave the username field empty.
3. Leave the email field empty.
4. Click **Save**.

**Expected Result:** Validation errors are shown for each empty required field. The form is not saved. The user remains on the create user page.

---

## TS-USRMGR-003: Create User – Duplicate Username Rejected

**Preconditions:** A user with a specific username already exists.

**Steps:**
1. Open the create user form.
2. Enter the same username as an existing user.
3. Fill in other required fields.
4. Click **Save**.

**Expected Result:** An error is displayed indicating the username is already taken. The form is not saved.

---

## TS-USRMGR-004: Edit an Existing User

**Preconditions:** Admin is logged in. A user account exists.

**Steps:**
1. Navigate to the Users list.
2. Click on an existing user to edit.
3. Modify one or more fields (e.g., name, email, catchment, roles).
4. Click **Save**.

**Expected Result:** The user's details are updated. The user list reflects the changes. A success notification is shown.

---

## TS-USRMGR-005: Disable / Deactivate a User

**Preconditions:** Admin is logged in. An active user account exists.

**Steps:**
1. Navigate to the Users list.
2. Open the user's edit form.
3. Toggle the user status to **Inactive** or click **Disable**.
4. Save the changes.

**Expected Result:** The user account is deactivated. The deactivated user can no longer log in. The user list shows the user as inactive.

---

## TS-USRMGR-006: Assign Catchment to a User

**Preconditions:** Catchment areas are configured. An admin is editing a user.

**Steps:**
1. Open the user edit form.
2. Navigate to the catchment/location assignment section.
3. Select a catchment area for the user.
4. Save.

**Expected Result:** The user is assigned to the catchment. The user can only see subjects within their assigned catchment when logging in.

---

## TS-USRMGR-007: Search and Filter Users

**Preconditions:** Multiple users exist.

**Steps:**
1. Navigate to the Users list in admin.
2. Use the search input to filter by username or name.

**Expected Result:** Only users matching the search criteria are displayed. The filter works in real-time or on submission.

---

## TS-USRMGR-008: User Group Management – Create a User Group

**Preconditions:** Admin is logged in. The User Groups section is available.

**Steps:**
1. Navigate to **User Groups** in admin.
2. Click **Create** or **+ New Group**.
3. Enter a name for the user group.
4. Add users to the group.
5. Click **Save**.

**Expected Result:** The user group is created. Users assigned to the group are listed within it. The group appears in the user group list.

---

## TS-USRMGR-009: User Group Management – Add/Remove Users from Group

**Preconditions:** A user group exists.

**Steps:**
1. Navigate to a user group's edit page.
2. Add a new user to the group.
3. Remove an existing user from the group.
4. Save.

**Expected Result:** The group membership is updated. Added users appear in the group; removed users no longer appear.

---

## TS-USRMGR-010: View User Audit Information

**Preconditions:** Admin is logged in.

**Steps:**
1. Navigate to the Users list.
2. Open a user's details.
3. Look for audit/activity information (created date, last login, etc.).

**Expected Result:** The user's creation date and, if available, last login timestamp are displayed.
