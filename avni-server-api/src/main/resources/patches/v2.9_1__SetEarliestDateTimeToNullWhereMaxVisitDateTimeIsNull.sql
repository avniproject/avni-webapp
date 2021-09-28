-- V1_103__AddMissingIndices.sql requires earliest_visit_date_time and max_visit_date_time should either
-- both be empty or both be filled. However, we have had a bug in the past where earliest_visit_date_time
-- was being filled in by mistake. This was fixed around 4 months ago, but there still exists data that
-- has just the earliest_visit_date_time, and a null max_visit_date_time.

-- This script corrects this data by setting these earliest_visit_date_time to null.
-- We are assuming nobody would edit these program_encounters during the deployment.

-- Fix Version: 2.9

-- Check before if the problem exists
select id
from program_encounter
where earliest_visit_date_time is not null and max_visit_date_time is null;


-- Actual update statement
with audits as (update program_encounter
set earliest_visit_date_time = null
where earliest_visit_date_time is not null and max_visit_date_time is null
returning audit_id)
update audit as a
set last_modified_date_time = current_timestamp + a.id * ('1 millisecond' :: interval)
from audits as audits
where audits.audit_id = a.id;

-- Check again if problem exists
select id
from program_encounter
where earliest_visit_date_time is not null and max_visit_date_time is null;

-- commit/rollback;