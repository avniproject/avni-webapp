# Admin – Organisation and Location Management Test Scenarios

## Overview
Browser-based functional tests for managing organisation configuration, address hierarchy, locations, and catchment areas in the Avni admin panel.

---

## TS-ORG-001: View and Edit Organisation Configuration

**Preconditions:** Admin user is logged in.

**Steps:**
1. Navigate to the admin panel.
2. Click on **Organisation** or **Organisation Configuration**.
3. Observe the current settings.
4. Modify a configurable setting (e.g., time zone, language).
5. Click **Save**.

**Expected Result:** The organisation configuration is updated. A success notification is shown. The changes are reflected in subsequent application behaviour.

---

## TS-ORG-002: Manage Address Level Types

**Preconditions:** Admin is logged in.

**Steps:**
1. Navigate to **Address Level Types** (or **Locations** → **Address Levels**) in admin.
2. Create a new address level type (e.g., "District", "Village", "Block").
3. Set the hierarchy level number.
4. Click **Save**.

**Expected Result:** The new address level type is created. It appears in the address level type list. The hierarchy is correctly configured.

---

## TS-ORG-003: Create a Location

**Preconditions:** At least one address level type is configured.

**Steps:**
1. Navigate to **Locations** in admin.
2. Click **Create** or **+ New Location**.
3. Enter the location name.
4. Select the address level type.
5. Select the parent location (if applicable).
6. Click **Save**.

**Expected Result:** The location is created. It appears in the locations hierarchy. The location is available for selection when registering subjects or assigning catchments.

---

## TS-ORG-004: Edit an Existing Location

**Preconditions:** One or more locations exist.

**Steps:**
1. Navigate to the Locations list.
2. Search for a specific location.
3. Click **Edit**.
4. Modify the location name or parent.
5. Click **Save**.

**Expected Result:** The location is updated. The changes are reflected in the locations hierarchy.

---

## TS-ORG-005: Upload Locations via File

**Preconditions:** Admin is logged in. A valid location import file (CSV/Excel) is available.

**Steps:**
1. Navigate to the Locations management page.
2. Click **Upload** or **Import**.
3. Select and upload the location file.
4. Confirm the import.

**Expected Result:** Locations from the file are imported. The locations appear in the hierarchy. Import errors (if any) are reported clearly.

---

## TS-ORG-006: Create a Catchment Area

**Preconditions:** Locations exist. Admin is logged in.

**Steps:**
1. Navigate to **Catchments** in admin.
2. Click **Create** or **+ New Catchment**.
3. Enter a catchment name.
4. Add locations to the catchment.
5. Click **Save**.

**Expected Result:** The catchment is created with the selected locations. The catchment can be assigned to users. Users assigned to the catchment can only see subjects in those locations.

---

## TS-ORG-007: Edit a Catchment – Add/Remove Locations

**Preconditions:** A catchment exists with at least one location.

**Steps:**
1. Navigate to Catchments.
2. Edit an existing catchment.
3. Add a new location to the catchment.
4. Remove an existing location from the catchment.
5. Save.

**Expected Result:** The catchment is updated with the new location set. Users assigned to this catchment see the updated location scope.

---

## TS-ORG-008: Deploy Organisation Changes

**Preconditions:** Admin is logged in. Deployment Manager is available.

**Steps:**
1. Navigate to the **Deployment Manager** in admin.
2. Initiate a deployment for the organisation configuration changes.
3. Monitor the deployment status.

**Expected Result:** The deployment completes successfully. Changes made to configuration (forms, rules, etc.) are pushed to the active environment. No errors are reported.

---

## TS-ORG-009: Custom Filters – Create a Custom Search Filter

**Preconditions:** Admin is logged in.

**Steps:**
1. Navigate to **Custom Filters** in admin.
2. Click **Create** or **Add Filter**.
3. Configure the filter:
   - Select the subject type.
   - Select the filter field (concept/form element).
   - Set the filter type (dropdown, date range, etc.).
4. Save.

**Expected Result:** The custom filter is created. It appears in the custom filters list. When data entry users navigate to the subject search page, the custom filter is available as a search criterion.

---

## TS-ORG-010: Manage Templates / Template Organisations

**Preconditions:** Admin has access to template management.

**Steps:**
1. Navigate to the template organisations section.
2. View available templates.
3. Apply a template configuration if available.

**Expected Result:** Templates are listed. Applying a template configures the organisation with predefined settings (subject types, programs, forms, etc.).
