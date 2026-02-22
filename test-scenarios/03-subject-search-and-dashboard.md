# Subject Search and Dashboard Test Scenarios

## Overview
Browser-based functional tests for searching subjects, applying filters, and viewing the subject dashboard in the Avni data entry application.

---

## TS-SRCH-001: Search for a Subject by Name – Happy Path

**Preconditions:** User is logged in. At least one subject is registered.

**Steps:**
1. Navigate to the data entry home (`/app/`).
2. In the search/filter form, type the subject's name (full or partial).
3. Submit the search or wait for results.

**Expected Result:** A list of subjects matching the search criteria is displayed. The registered subject appears in the results. Each result card shows key information (name, ID, address).

---

## TS-SRCH-002: Search Returns No Results for Unknown Name

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to the data entry home.
2. Enter a name that does not match any registered subject (e.g., a random string).
3. Submit the search.

**Expected Result:** No subject cards are displayed. An appropriate message such as "No results found" is shown.

---

## TS-SRCH-003: Search with Multiple Filter Criteria

**Preconditions:** User is logged in. Subjects with different attributes (gender, address, program enrollment) exist.

**Steps:**
1. Navigate to the data entry home.
2. Apply multiple filters simultaneously:
   - Filter by subject type.
   - Filter by gender.
   - Filter by address/location.
3. Submit the search.

**Expected Result:** Only subjects matching all applied filters are shown in the results. The filter chips or indicators show the active filters.

---

## TS-SRCH-004: Clear Filters and Return All Results

**Preconditions:** User is logged in with search filters applied.

**Steps:**
1. Apply one or more search filters and view filtered results.
2. Clear all filters (click "Clear" or remove filter chips).

**Expected Result:** All subjects (within the user's catchment) are listed again. Previously applied filters are no longer active.

---

## TS-SRCH-005: Advanced Subject Search

**Preconditions:** User is logged in. Advanced search functionality is available at `/app/search`.

**Steps:**
1. Navigate to the advanced search page.
2. Enter search criteria (name, ID, custom filter fields).
3. Submit the search.

**Expected Result:** Results matching the advanced criteria are displayed. The search results are accurate.

---

## TS-SRCH-006: Navigate to Subject Dashboard from Search Results

**Preconditions:** User is logged in. A subject appears in search results.

**Steps:**
1. Perform a search and view results.
2. Click on a subject card in the results.

**Expected Result:** The subject's dashboard is opened. The dashboard displays:
- Subject name, registration date, ID.
- Profile picture (if uploaded).
- Active program enrollments.
- Recent encounters/visits.
- Relationship information.

---

## TS-DASH-001: Subject Dashboard – View Program Enrollments

**Preconditions:** User is logged in. A subject is enrolled in at least one program.

**Steps:**
1. Navigate to a subject's dashboard.
2. Observe the programs section.

**Expected Result:** The subject's active and completed program enrollments are listed. Each enrollment shows the program name, enrollment date, and current status.

---

## TS-DASH-002: Subject Dashboard – View Encounter History

**Preconditions:** User is logged in. A subject has recorded encounters.

**Steps:**
1. Navigate to a subject's dashboard.
2. Locate the encounters or visit history section.

**Expected Result:** The list of recorded encounters is displayed in chronological order (or reverse chronological). Each entry shows the encounter type, date, and status.

---

## TS-DASH-003: Subject Dashboard – Voided Subject Indicator

**Preconditions:** User is logged in. A voided (deleted/archived) subject exists.

**Steps:**
1. Navigate to or search for a voided subject's dashboard.

**Expected Result:** A visual indicator (e.g., "Voided" badge or banner) is clearly shown on the dashboard, indicating the subject has been voided and cannot be edited normally.

---

## TS-DASH-004: Subject Dashboard – Quick Actions Available

**Preconditions:** User is logged in with appropriate privileges.

**Steps:**
1. Navigate to a subject's dashboard.
2. Observe the available action buttons.

**Expected Result:** Relevant action buttons are displayed based on the subject's state:
- **Edit Profile** button is available.
- **Enrol in Program** button appears if programs are configured.
- **New General Visit** button appears if general encounter types are configured.
- **Add Relative** button appears if relationships are configured.

---

## TS-DASH-005: Pagination in Search Results

**Preconditions:** More subjects exist than can be displayed on a single page.

**Steps:**
1. Navigate to the data entry home.
2. Perform a broad search that returns many results.
3. Observe pagination controls.
4. Click the next page button.

**Expected Result:** The results are paginated. Clicking next/previous page loads the appropriate set of results. The total count of results is displayed.
