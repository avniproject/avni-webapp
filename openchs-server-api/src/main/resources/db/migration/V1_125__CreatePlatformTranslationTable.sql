create table platform_translation
(
    id               serial primary key,
    uuid             varchar(255) not null,
    audit_id         bigint       not null,
    version          integer               default 1,
    translation_json JSONB        NOT NULL,
    is_voided        boolean      NOT NULL DEFAULT FALSE,
    platform         varchar(255) not null
);

alter table only platform_translation
  add constraint platform_translation_master_audit foreign key (audit_id) references audit (id);
