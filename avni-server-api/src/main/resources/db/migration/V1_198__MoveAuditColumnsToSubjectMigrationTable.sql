select create_audit_columns('subject_migration');
call update_audit_columns_from_audit_table('subject_migration');
commit;
select solidify_audit_columns('subject_migration');
