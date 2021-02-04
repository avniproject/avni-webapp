create table approval_status (id SERIAL PRIMARY KEY,
uuid text not null,
status text not null,
is_voided boolean not null default false,
created_date_time timestamptz not null,
last_modified_date_time timestamptz not null
);

create table entity_approval_status (id SERIAL PRIMARY KEY ,
uuid text not null,
entity_id bigint not null,
entity_type text not null,
approval_status_id bigint not null,
approval_status_comment text,
organisation_id bigint not null,
auto_approved boolean not null default false,
audit_id bigint not null,
version bigint not null default 0,
is_voided boolean not null default false
);

ALTER TABLE entity_approval_status
    ADD CONSTRAINT entity_approval_status_approval_status FOREIGN KEY (approval_status_id) REFERENCES approval_status (id),
    ADD CONSTRAINT entity_approval_status_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT entity_approval_status_audit FOREIGN KEY (audit_id) REFERENCES audit (id);

select enable_rls_on_tx_table('entity_approval_status');


insert into approval_status (uuid , status , created_date_time , last_modified_date_time) values
  ('e7e3cdc6-510c-43e3-81d7-85450ce66ba0', 'Pending', current_timestamp, current_timestamp ),
  ('db5ce7a3-0b21-4f5b-807c-814dd96ebc1d', 'Approved', current_timestamp, current_timestamp ),
  ('2c2cdf95-ed0d-4328-9431-14d65a6e82e6', 'Rejected', current_timestamp, current_timestamp );

create table standard_report_card_type (id SERIAL PRIMARY KEY,
uuid text not null,
name text not null,
description text,
is_voided boolean not null default false,
created_date_time timestamptz not null,
last_modified_date_time timestamptz not null
);

alter table report_card add column standard_report_card_type_id bigint;
alter table report_card add constraint report_card_standard_report_card_type foreign key (standard_report_card_type_id) references standard_report_card_type (id);
alter table report_card alter column query drop not null;
alter table report_card add constraint report_card_optional_standard_report_card_type check (standard_report_card_type_id is not null OR query IS NOT NULL);


create table group_dashboard (id SERIAL PRIMARY KEY ,
uuid text not null,
organisation_id bigint not null,
is_primary_dashboard boolean not null default false,
audit_id bigint not null,
version bigint not null default 0,
group_id bigint not null,
dashboard_id bigint not null,
is_voided boolean not null default false
);

ALTER TABLE group_dashboard
    ADD CONSTRAINT group_dashboard_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT group_dashboard_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
    ADD constraint group_dashboard_group FOREIGN key (group_id) REFERENCES groups (id),
    ADD CONSTRAINT group_dashboard_dashboard FOREIGN KEY (dashboard_id) REFERENCES dashboard (id);

select enable_rls_on_ref_table('group_dashboard');

insert into privilege (uuid,name,description,entity_type,created_date_time,last_modified_date_time)
values
  ('37ae14f9-e6ac-4d24-951a-e457b0cdcf00','Approve Subject','Approve Subject','Subject',current_timestamp, current_timestamp ),
  ('8a2e92c2-8af2-4f1c-896e-317c0bb4095f','Reject Subject','Reject Subject','Subject',current_timestamp, current_timestamp ),
  ('31449500-4b8d-43db-855a-c9099600ee32','Approve Enrolment','Approve Enrolment','Enrolment',current_timestamp, current_timestamp ),
  ('8b0089f6-8c52-471c-bb89-8d4c1800dbcd','Reject Enrolment','Reject Enrolment','Enrolment',current_timestamp, current_timestamp ),
  ('7d725125-6b48-44d2-a53b-bf847ae8a3d0','Approve Encounter','Approve Encounter','Encounter',current_timestamp, current_timestamp ),
  ('ca4428e7-dc4c-4dad-8190-451d8ccd7402','Reject Encounter','Reject Encounter','Encounter',current_timestamp, current_timestamp ),
  ('9635465c-f0bb-4b10-8cf9-eda181fe7a4f','Approve ChecklistItem','Approve ChecklistItem','ChecklistItem',current_timestamp, current_timestamp ),
  ('54654e97-acb6-4a89-8754-82a56af93f37','Reject ChecklistItem','Reject ChecklistItem','ChecklistItem',current_timestamp, current_timestamp );

insert into standard_report_card_type (uuid, name, description, created_date_time, last_modified_date_time)
values
  ('7726476c-fb91-4c28-8afc-9782714c1d8c','Pending approval','Pending approval',current_timestamp ,current_timestamp ),
  ('84d6c349-9fbb-41d3-85fe-1d34521a0d45','Approved','Approved',current_timestamp ,current_timestamp ),
  ('9e584c8d-b31d-4e5a-9161-baf4f369d02d','Rejected','Rejected',current_timestamp ,current_timestamp );
