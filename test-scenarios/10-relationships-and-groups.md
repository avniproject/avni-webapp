# Relationships and Group Membership Test Scenarios

## Overview
Browser-based functional tests for managing subject relationships (family members, relatives) and group/household membership in the Avni data entry application.

---

## TS-REL-001: Add a Relative to an Individual Subject

**Preconditions:** User is logged in. At least two individual subjects exist. A relationship type is configured.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click **Add Relative** (or the relationship button in the subject profile section).
3. Search for and select the related subject.
4. Select the relationship type (e.g., "Spouse", "Parent", "Child").
5. Confirm and save.

**Expected Result:** The relationship is created. Both subjects' dashboards show the relationship. The relative is listed under the relationships section on the primary subject's dashboard.

---

## TS-REL-002: View Existing Relationships on Subject Dashboard

**Preconditions:** A subject has at least one relationship recorded.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the relationships/family members section.

**Expected Result:** The related subjects are listed with their names, relationship types, and links to their dashboards. The relationship is shown from the correct directional perspective (e.g., "Mother of [Subject]").

---

## TS-REL-003: Remove or Void a Relationship

**Preconditions:** A subject has a recorded relationship.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the relationship to be removed.
3. Click the delete/void button on the relationship.
4. Confirm the removal.

**Expected Result:** The relationship is removed from the subject's dashboard. The related subject no longer shows this relationship either.

---

## TS-REL-004: Navigate to Related Subject's Dashboard from Relationship

**Preconditions:** A subject has at least one relationship listed on the dashboard.

**Steps:**
1. Navigate to a subject's dashboard.
2. Click on the related subject's name/card in the relationships section.

**Expected Result:** The browser navigates to the related subject's dashboard. The related subject's full information is displayed.

---

## TS-REL-005: Relationship Requires Both Subjects to Exist

**Preconditions:** No matching subject exists for the search.

**Steps:**
1. Open the "Add Relative" form.
2. Search for a subject name that does not exist.

**Expected Result:** No search results are shown. The user cannot create a relationship with a non-existent subject. An appropriate message or empty state is displayed.

---

## TS-GRP-001: Add an Individual to a Group (Group Membership)

**Preconditions:** User is logged in. A group subject (household/committee) and individual subjects exist. Group membership is configured.

**Steps:**
1. Navigate to the group subject's dashboard.
2. Click **Add Member** (or the group membership button).
3. Search for and select the individual subject to add.
4. Select the membership role/type if required.
5. Confirm and save.

**Expected Result:** The individual is added as a member of the group. The group dashboard shows the new member. The individual's dashboard may show group membership.

---

## TS-GRP-002: View Group Members on Group Dashboard

**Preconditions:** A group subject has at least one member.

**Steps:**
1. Navigate to the group subject's dashboard.
2. Observe the members/roster section.

**Expected Result:** All group members are listed with their names, membership roles, and dates. Links to individual member dashboards are available.

---

## TS-GRP-003: Remove a Member from a Group

**Preconditions:** A group has at least one member.

**Steps:**
1. Navigate to the group subject's dashboard.
2. Find the member to remove.
3. Click the remove/void button on the membership.
4. Confirm the action.

**Expected Result:** The individual is removed from the group. The group dashboard no longer lists the removed member. The individual's dashboard no longer shows membership in that group.

---

## TS-GRP-004: Edit Group Membership Details

**Preconditions:** A group membership exists.

**Steps:**
1. Navigate to the group subject's dashboard.
2. Click **Edit** on an existing membership record.
3. Modify the membership role or date.
4. Save the changes.

**Expected Result:** The membership record is updated. The group dashboard reflects the changes.

---

## TS-GRP-005: Navigate to Member's Dashboard from Group

**Preconditions:** A group has members listed.

**Steps:**
1. Navigate to the group subject's dashboard.
2. Click on a member's name or card.

**Expected Result:** The browser navigates to that individual member's dashboard.
