with audits as (
    update organisation_config set settings = settings - 'prints'
        where settings ->> 'prints' notnull
        returning audit_id
)
update audit
set last_modified_date_time = current_timestamp
where id in (
    select audit_id
    from audits
)
