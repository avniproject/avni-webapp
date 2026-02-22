# Task and Subject Assignment Test Scenarios

## Overview
Browser-based functional tests for the assignment module in Avni, which allows managers to assign tasks and subjects to field workers/users, and manage subject group memberships at scale.

---

## TS-ASGN-001: Navigate to Task Assignment Page

**Preconditions:** User is logged in with assignment management privileges. The assignment feature is configured.

**Steps:**
1. Navigate to `/taskAssignment` or the task assignment section from the home page.

**Expected Result:** The task assignment page is displayed with filter options and a list/table of tasks to be assigned.

---

## TS-ASGN-002: Assign a Task to a User

**Preconditions:** Unassigned tasks exist. Users are configured.

**Steps:**
1. Navigate to the Task Assignment page.
2. Filter tasks by status (e.g., "Unassigned").
3. Select one or more tasks.
4. Click **Assign** or the assignment button.
5. Select the target user from the list.
6. Confirm the assignment.

**Expected Result:** The task(s) are assigned to the selected user. The task status is updated to reflect the assignment. The assigned user sees the task when logging in.

---

## TS-ASGN-003: Reassign a Task from One User to Another

**Preconditions:** Tasks are currently assigned to User A.

**Steps:**
1. Navigate to the Task Assignment page.
2. Filter tasks assigned to User A.
3. Select one or more tasks.
4. Assign them to User B.

**Expected Result:** The tasks are reassigned to User B. User A no longer has those tasks. User B sees the newly assigned tasks.

---

## TS-ASGN-004: Filter Tasks by Status, Type, or Assigned User

**Preconditions:** Tasks of various statuses and types exist.

**Steps:**
1. Navigate to the Task Assignment page.
2. Apply filters:
   - Filter by task status (Unassigned, Assigned, Completed).
   - Filter by task type.
   - Filter by currently assigned user.
3. Observe the filtered results.

**Expected Result:** Only tasks matching all applied filters are shown. The filter controls reflect the active criteria.

---

## TS-ASGN-005: Navigate to Subject Assignment Page

**Preconditions:** User is logged in with assignment privileges.

**Steps:**
1. Navigate to `/subjectAssignment` or the subject assignment section.

**Expected Result:** The subject assignment page is displayed with filter options and a list/table of subjects to be assigned to field workers.

---

## TS-ASGN-006: Assign Subjects to a User

**Preconditions:** Subjects exist. Users are configured.

**Steps:**
1. Navigate to the Subject Assignment page.
2. Filter subjects (by subject type, location, or current assignment).
3. Select one or more subjects.
4. Click **Assign** and select the target user.
5. Confirm.

**Expected Result:** The selected subjects are assigned to the chosen user. The assignment is reflected in the subject records. The assigned user has access to those subjects.

---

## TS-ASGN-007: Subject Assignment – Bulk Assignment

**Preconditions:** Multiple subjects exist and need to be assigned.

**Steps:**
1. Navigate to the Subject Assignment page.
2. Use "Select All" or select many subjects using checkboxes.
3. Assign all selected subjects to a user.

**Expected Result:** All selected subjects are assigned in bulk. A confirmation or success message is shown.

---

## TS-ASGN-008: Subject Group Assignment

**Preconditions:** Subject groups (households/communities) exist.

**Steps:**
1. Navigate to the assignment section.
2. Select the subject group assignment option.
3. Filter groups by location or subject type.
4. Select groups and assign to a user.

**Expected Result:** Subject groups are assigned to the user. The user can see and work with those groups in data entry.

---

## TS-ASGN-009: View Assignment History

**Preconditions:** Assignments have been made.

**Steps:**
1. Navigate to the assignment management page.
2. View assignment history or a log of recent assignments.

**Expected Result:** Past assignment actions are visible with timestamps, assigned user, and the task/subject affected.

---

## TS-ASGN-010: Unassign a Task or Subject

**Preconditions:** A task or subject is currently assigned to a user.

**Steps:**
1. Navigate to the assignment page.
2. Find an assigned task or subject.
3. Remove the assignment or reassign to "Unassigned".
4. Confirm.

**Expected Result:** The task or subject is unassigned. The previously assigned user no longer has access to that task/subject in their work queue.
