create table comment_thread
(
    id                 serial primary key,
    organisation_id    bigint                 not null references organisation (id),
    uuid               character varying(255) not null,
    status             text                   not null,
    open_date_time     timestamp with time zone,
    resolved_date_time timestamp with time zone,
    is_voided          boolean                not null default false,
    audit_id           bigint                 not null references audit (id),
    version            bigint                 not null default 0
);

create unique index comment_thread_uuid_organisation_id_uniq_idx on comment (uuid, organisation_id);
select enable_rls_on_tx_table('comment_thread');

alter table comment
    add column comment_thread_id bigint references comment_thread (id);
