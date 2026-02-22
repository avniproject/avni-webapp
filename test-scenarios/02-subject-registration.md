# Subject Registration Test Scenarios

## Overview
Browser-based functional tests for registering new subjects (individuals and non-individual/group types) in the Avni data entry application.

**Terminology:**
- **Subject:** The entity being tracked (can be an Individual, Household, Group, etc., depending on configuration).
- **FEG:** Form Element Group — a section/page within a form.
- **FE:** Form Element — a single field within a group.

---

## TS-REG-001: Register a New Individual Subject – Happy Path

**Preconditions:** User is logged in with data entry privileges. An individual subject type is configured.

**Steps:**
1. Navigate to the data entry home (`/app/`).
2. Click **Register** or the new subject registration button.
3. Select the individual subject type if prompted.
4. Enter a valid first name.
5. Enter a valid last name.
6. Select or enter a date of birth (or age).
7. Select gender.
8. Fill in any required address fields.
9. Complete all mandatory form element groups.
10. Click **Next** to progress through all form pages.
11. Review the **Summary & Recommendations** page.
12. Click **Save**.

**Expected Result:** The subject is registered successfully. The subject dashboard is displayed with the registered information. A success notification is shown.

---

## TS-REG-002: Register Individual – Required Field Validation (First Name Empty)

**Preconditions:** User is logged in. Individual subject type registration form is open.

**Steps:**
1. Open the subject registration form for an individual.
2. Clear the **First Name** field.
3. Click **Next**.

**Expected Result:** Validation error "There is no value specified" (or equivalent) is displayed. The form does not advance to the next page. The user remains on the registration date/name page.

---

## TS-REG-003: Register Individual – Navigate Forward and Backward Through Form Pages

**Preconditions:** User is logged in. Multi-page registration form is configured.

**Steps:**
1. Open a new individual registration form.
2. Fill in the first page (registration date, name).
3. Click **Next** to move to the second form element group page.
4. Click **Previous** to go back to the first page.
5. Verify the data entered is preserved.
6. Click **Next** again and continue through all pages to the Summary page.
7. Click **Previous** from the Summary page and navigate back through all pages.

**Expected Result:** Navigation between pages works correctly in both directions. Data entered on each page is preserved when navigating back and forth. The Summary page accurately reflects all entered data.

---

## TS-REG-004: Register Individual – Skip to Summary When All Form Element Groups Are Hidden

**Preconditions:** Registration form is configured with rules that hide all FEGs based on a modifier selection.

**Steps:**
1. Open the edit profile/registration form for the test subject.
2. On the modifier/first page, select all options that trigger hiding of all FEGs.
3. Click **Next**.

**Expected Result:** The application skips directly to the **Summary & Recommendations** page, bypassing all hidden FEG pages. Navigating **Previous** from Summary takes the user back to the modifier page (not a hidden page).

---

## TS-REG-005: Register Individual – Empty Registration Form (No Custom FEGs)

**Preconditions:** A subject type registration form with no custom FEGs (only static elements like registration date) exists.

**Steps:**
1. Open the registration form for the "empty" subject type.
2. Click **Next** from the first page (registration date).

**Expected Result:** The **Summary & Recommendations** page is shown immediately after the first page. Navigating **Previous** from Summary returns to the registration date page.

---

## TS-REG-006: Register Non-Individual (Group/Household) – Happy Path

**Preconditions:** User is logged in. A non-individual (group/household) subject type is configured.

**Steps:**
1. Navigate to the data entry home.
2. Click **Register** and select the group/household subject type.
3. Enter a valid group name.
4. Fill in any required address fields.
5. Progress through all form pages by clicking **Next**.
6. Review the Summary page.
7. Click **Save**.

**Expected Result:** The group subject is registered successfully. The subject dashboard is displayed. A success notification is shown.

---

## TS-REG-007: Register Group – Required Field Validation (Name Empty)

**Preconditions:** User is logged in. Group subject type registration form is open.

**Steps:**
1. Open the registration form for a group subject.
2. Clear the **Name** field.
3. Click **Next**.

**Expected Result:** A validation error ("There is no value specified") is displayed. The form does not advance to the next page. The user remains on the registration page.

---

## TS-REG-008: Edit Existing Individual Registration

**Preconditions:** User is logged in. An individual subject already exists.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click the **Edit Profile** button.
3. Modify one or more fields (e.g., change first name or a form element value).
4. Navigate through all pages to the Summary page.
5. Click **Save**.

**Expected Result:** The subject's profile is updated with the new values. The subject dashboard reflects the changes. A success notification is shown.

---

## TS-REG-009: Validation Error Persists After Navigation

**Preconditions:** A form element with a validation rule is configured (e.g., a numeric field that rejects value 123).

**Steps:**
1. Open the subject registration or edit form.
2. Navigate to the page containing the validated field.
3. Enter an invalid value (e.g., 123 in a field that expects a different format).
4. Observe the validation error message.
5. Click **Next** (form should NOT advance due to the error).
6. Click **Previous** to go back one page.
7. Click **Next** to return to the error page.

**Expected Result:** The validation error persists when returning to the page. The form does not advance past a page with validation errors. The error message is displayed correctly on both attempts.

---

## TS-REG-010: Register Individual – FEG Hidden by FEG-Level Rule

**Preconditions:** Registration form is configured with a FEG-level skip rule that hides the first FEG based on a modifier option.

**Steps:**
1. Open the edit registration form for the test subject.
2. On the modifier page, select the option **"Hide first FEG"**.
3. Click **Next**.

**Expected Result:** The page for "First FEG" is skipped entirely. The form advances to the **Second FEG** page. The **Summary** page does not show any fields from the hidden FEG.

---

## TS-REG-011: Register Individual – Form Element Hidden by FE-Level Rule

**Preconditions:** Registration form is configured with FE-level rules that hide specific form elements.

**Steps:**
1. Open the edit registration form.
2. Select **"Hide first FE of first FEG"** on the modifier page.
3. Click **Next**.
4. Observe the First FEG page.

**Expected Result:** The First FEG page is shown but the **"First FE of first FEG"** field is absent. The remaining fields in the FEG are visible. No fields from other FEGs are affected.

---

## TS-REG-012: Subject Profile Picture Upload

**Preconditions:** User is logged in. Profile picture upload is supported by the server.

**Steps:**
1. Open the registration or edit profile form for a subject.
2. Locate the profile picture/photo upload area.
3. Upload a valid image file (JPG or PNG).
4. Save the form.

**Expected Result:** The profile picture is uploaded and displayed on the subject dashboard. No errors occur during upload.
