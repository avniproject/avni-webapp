alter table message_request_queue add entity_id integer not null;
ALTER TABLE message_receiver RENAME COLUMN entity_id TO receiver_id;
ALTER TABLE message_receiver RENAME COLUMN entity_type TO receiver_type;
