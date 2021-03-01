update privilege
set is_voided               = true,
    last_modified_date_time = current_timestamp
where name in ('Reject Subject',
               'Reject Enrolment',
               'Reject Encounter',
               'Reject ChecklistItem');

