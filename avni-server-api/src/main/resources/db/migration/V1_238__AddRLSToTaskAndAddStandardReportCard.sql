select enable_rls_on_ref_table('task_type');
select enable_rls_on_ref_table('task_status');
select enable_rls_on_tx_table('task');

insert into standard_report_card_type (uuid, name, description, created_date_time, last_modified_date_time)
values ('6be95028-1e1f-4d29-93a7-d4e562e0615a',
        'Tasks',
        'Tasks',
        now(),
        now());
