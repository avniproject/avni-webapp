alter table rule
  add column entity jsonb;

with updates as (select rule.id,
                        jsonb_build_object('type', (case
                                                      when form_id notnull then 'Form'
                                                      when program_id notnull then 'Program'
                                                      else 'None' end))
                          || jsonb_build_object('uuid', coalesce(f.uuid, p.uuid)) entity
                 from rule
                        left join program_rule on rule.id = rule_id
                        left join form f on rule.form_id = f.id
                        left join program p on p.id = program_id)

update rule
set entity = updates.entity
from updates
where updates.id = rule.id;

alter table rule
  alter column entity set not null;

alter table rule
  drop column form_id;

drop table program_rule;

update audit
set last_modified_date_time = current_timestamp
where id in (select audit_id from rule);
