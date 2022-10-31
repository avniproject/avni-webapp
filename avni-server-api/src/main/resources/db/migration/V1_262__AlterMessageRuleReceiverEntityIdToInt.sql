alter table message_rule drop column entity_type_id;
alter table message_rule add column entity_type_id integer not null;
alter table message_receiver drop column entity_id;
alter table message_receiver add column entity_id integer not null;

