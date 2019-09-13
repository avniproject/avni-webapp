create table translation
(
    id               serial primary key,
    uuid             varchar(255) not null,
    organisation_id  bigint       not null,
    audit_id         bigint       not null,
    version          integer               default 1,
    translation_json JSONB        NOT NULL,
    is_voided        boolean      NOT NULL DEFAULT FALSE
);

alter table only translation
  add constraint translation_organisation foreign key (organisation_id) references organisation (id),
  add constraint translation_master_audit foreign key (audit_id) references audit (id);

select enable_rls_on_tx_table('translation')
