create table message_request_queue
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    organisation_id         integer                     NOT NULL references organisation (id),
    message_rule_id         bigint                      NOT NULL references message_rule (id),
    message_receiver_id     bigint                      NOT NULL references message_receiver (id),
    scheduled_time          timestamp(3) with time zone not null,
    delivered_time          timestamp(3) with time zone not null,
    delivery_status         text                        NOT NULL,
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    created_by_id           bigint                      not null references users (id),
    last_modified_by_id     bigint                      not null references users (id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table message_request_queue
    add unique (uuid, organisation_id);

select enable_rls_on_tx_table('message_request_queue');
