insert into privilege(uuid, name, description, entity_type, created_date_time, last_modified_date_time)
values ('e6fa5030-1496-4b5a-82f7-00f61e3a013e', 'All Privileges', 'All Privileges', 'Everything', current_timestamp,
        current_timestamp);

delete
from group_privilege
where group_id in (select id from groups where name = 'Everyone');

insert into group_privilege
(uuid, group_id, privilege_id, subject_type_id, program_id, program_encounter_type_id, encounter_type_id,
 checklist_detail_id, version, organisation_id, audit_id, allow)
select uuid_generate_v4(),
       g.id,
       p.id,
       null,
       null,
       null,
       null,
       null,
       0,
       o.id,
       create_audit(),
       true
from organisation o
         join groups g on g.organisation_id = o.id and g.name = 'Everyone'
         join privilege p on true
where p.name = 'All Privileges';
