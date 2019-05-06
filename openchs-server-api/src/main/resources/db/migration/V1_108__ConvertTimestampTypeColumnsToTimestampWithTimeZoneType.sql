
DO $$
DECLARE row information_schema.tables%rowtype;
BEGIN
  for row in
       select * from information_schema.tables
       where table_schema = 'public' and table_type = 'VIEW'
  loop
    execute ('DROP VIEW IF EXISTS ' || quote_ident(row.table_name) || ' CASCADE');
  end loop;
END
$$
LANGUAGE plpgsql;

alter table program_enrolment alter column enrolment_date_time type timestamptz;
alter table program_enrolment alter column program_exit_date_time type timestamptz;
alter table checklist_item alter column completion_date type timestamptz;
alter table program_encounter alter column encounter_date_time type timestamptz;
alter table program_encounter alter column earliest_visit_date_time type timestamptz;
alter table program_encounter alter column max_visit_date_time type timestamptz;
alter table program_encounter alter column cancel_date_time type timestamptz;
alter table checklist alter column base_date type timestamptz;
alter table encounter alter column encounter_date_time type timestamptz;
alter table individual_relative alter column enter_date_time type timestamptz;
alter table individual_relative alter column exit_date_time type timestamptz;
alter table individual_relationship alter column enter_date_time type timestamptz;
alter table individual_relationship alter column exit_date_time type timestamptz;

--
-- Deploy reporting views and implementations' views
--
