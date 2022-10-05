create table message_rule
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    name                    text                        NOT NULL,
    message_rule            text,
    schedule_rule           text,
    organisation_id         integer                     NOT NULL references organisation (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    entity_type             text                        NOT NULL,
    entity_type_id          text                        NOT NULL,
    message_template_id     text                        NOT NULL,
    version                 integer                     not null,
    created_by_id           bigint                      not null references users (id),
    last_modified_by_id     bigint                      not null references users (id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table message_rule
    add unique (uuid, organisation_id);

select enable_rls_on_tx_table('message_rule');
