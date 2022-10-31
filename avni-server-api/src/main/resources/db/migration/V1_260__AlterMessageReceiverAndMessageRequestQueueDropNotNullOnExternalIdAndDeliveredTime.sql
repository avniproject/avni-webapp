alter table message_receiver alter column external_id drop not null;
alter table message_request_queue alter column delivered_time drop not null;

