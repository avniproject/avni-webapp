create table message_receiver
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    entity_type             text                        NOT NULL,
    entity_id               text                        NOT NULL,
    organisation_id         integer                     NOT NULL references organisation (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    external_id             text                        NOT NULL,
    created_by_id           bigint                      not null references users (id),
    last_modified_by_id     bigint                      not null references users (id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table message_receiver
    add unique (uuid, organisation_id);

select enable_rls_on_tx_table('message_receiver');
