# Admin – Subject Types, Programs and Encounter Types Test Scenarios

## Overview
Browser-based functional tests for configuring subject types, programs, encounter types, and their associated settings in the Avni admin panel.

---

## TS-STYPE-001: Create a New Subject Type

**Preconditions:** Admin user is logged in.

**Steps:**
1. Navigate to the admin panel.
2. Click on **Subject Types** in the navigation.
3. Click **Create** or **+ New Subject Type**.
4. Enter a name for the subject type (e.g., "Individual", "Household").
5. Select the type (Individual, Group, Household, Person).
6. Configure any optional settings (profile picture, unique ID generation).
7. Click **Save**.

**Expected Result:** The subject type is created. It appears in the subject types list. The subject type is available when registering new subjects.

---

## TS-STYPE-002: Edit an Existing Subject Type

**Preconditions:** A subject type exists.

**Steps:**
1. Navigate to Subject Types.
2. Click **Edit** on an existing subject type.
3. Modify the name or settings.
4. Click **Save**.

**Expected Result:** The subject type is updated. The changes are reflected in the registration form when creating new subjects.

---

## TS-STYPE-003: View Subject Types List

**Preconditions:** Admin is logged in. One or more subject types are configured.

**Steps:**
1. Navigate to Subject Types in admin.

**Expected Result:** All configured subject types are listed with their names and types (Individual/Group/etc.). Options to edit or view each are available.

---

## TS-PROG-001: Create a New Program

**Preconditions:** Admin is logged in. At least one subject type exists.

**Steps:**
1. Navigate to **Programs** in admin.
2. Click **Create** or **+ New Program**.
3. Enter the program name.
4. Select the applicable subject type(s).
5. Set program colour (optional).
6. Click **Save**.

**Expected Result:** The program is created. It appears in the programs list. When a subject of the appropriate type is viewed, the program is available for enrollment.

---

## TS-PROG-002: Edit an Existing Program

**Preconditions:** A program exists.

**Steps:**
1. Navigate to Programs.
2. Click **Edit** on an existing program.
3. Change the name or associated subject types.
4. Save.

**Expected Result:** The program is updated. The changes are reflected in the enrollment screens.

---

## TS-ENCTYPE-001: Create a New Encounter Type

**Preconditions:** Admin is logged in.

**Steps:**
1. Navigate to **Encounter Types** in admin.
2. Click **Create** or **+ New Encounter Type**.
3. Enter the encounter type name.
4. Select the encounter category (General or Program Encounter).
5. Click **Save**.

**Expected Result:** The encounter type is created and appears in the encounter types list. The new type is available when recording encounters for appropriate subjects/programs.

---

## TS-ENCTYPE-002: Edit an Existing Encounter Type

**Preconditions:** An encounter type exists.

**Steps:**
1. Navigate to Encounter Types.
2. Edit an existing encounter type.
3. Modify the name.
4. Save.

**Expected Result:** The encounter type name is updated. The change is reflected across the application.

---

## TS-WKFL-001: Configure Subject Type Workflow – Assign Registration Form

**Preconditions:** Admin is logged in. A subject type and a registration form exist.

**Steps:**
1. Navigate to the subject type's settings or workflow configuration.
2. Assign a registration form to the subject type.
3. Save.

**Expected Result:** The subject type is linked to the registration form. When registering a new subject of this type, the assigned form is used.

---

## TS-WKFL-002: Configure Program Workflow – Assign Enrolment/Exit/Encounter Forms

**Preconditions:** A program and forms exist.

**Steps:**
1. Navigate to the program's configuration or workflow in admin.
2. Assign the enrolment form.
3. Assign the exit/close form.
4. Assign program encounter forms.
5. Save.

**Expected Result:** The program uses the assigned forms for enrolment, exit, and visit recording. The correct forms appear in the data entry wizard for each workflow step.

---

## TS-WKFL-003: Configure Subject Type Search Result Fields

**Preconditions:** Admin is logged in.

**Steps:**
1. Navigate to **Search Result Fields** or subject type configuration.
2. Select which form elements should appear as columns in the search results for a subject type.
3. Save.

**Expected Result:** Subject search results display the configured fields as additional columns. The search result display is updated accordingly.
