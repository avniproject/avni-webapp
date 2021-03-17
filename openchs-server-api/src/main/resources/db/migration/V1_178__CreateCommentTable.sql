create table comment
(
    id              serial primary key,
    organisation_id bigint                 not null references organisation (id),
    uuid            character varying(255) not null,
    text            text                   not null,
    subject_id      bigint                 not null references individual (id),
    is_voided       boolean                not null default false,
    audit_id        bigint                 not null references audit (id),
    version         bigint                 not null default 0
);

create unique index comment_uuid_organisation_id_uniq_idx on comment (uuid, organisation_id);
create index comment_subject_id_index on comment (subject_id);

select enable_rls_on_tx_table('comment');
