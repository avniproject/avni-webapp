alter table form_mapping
    add column enable_approval boolean not null default false;

with audits as (
    update form_mapping set enable_approval = true
        where organisation_id in (select organisation_id
                                  from organisation_config
                                  where (settings ->> 'enableApprovalWorkflow')::boolean)
        returning audit_id
)
update audit
set last_modified_date_time = current_timestamp
where id in (select audit_id from audits);
