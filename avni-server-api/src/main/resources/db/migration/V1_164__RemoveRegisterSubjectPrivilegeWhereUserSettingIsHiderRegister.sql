with audits as (update groups
    set has_all_privileges = false
    where organisation_id in (
        select distinct organisation_id
        from users
        where (settings ->> 'hideRegister') = 'true'
    )
    returning audit_id
)
update audit
set last_modified_date_time = current_timestamp
where id in (select audit_id from audits);


with audits as (
    update group_privilege
        set allow = false
        where organisation_id in (
            select distinct organisation_id
            from users
            where (settings ->> 'hideRegister') = 'true'
        )
            and privilege_id = (select id from privilege where name = 'Register subject')
        returning audit_id
)
update audit
set last_modified_date_time = current_timestamp
where id in (select audit_id from audits);
