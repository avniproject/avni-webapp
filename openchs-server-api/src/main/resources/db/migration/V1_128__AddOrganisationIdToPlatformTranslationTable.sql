ALTER TABLE platform_translation ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1 ;

alter table only platform_translation
    add constraint platform_translation_organisation foreign key (organisation_id) references organisation (id);

select enable_rls_on_ref_table('platform_translation');
select enable_rls_on_ref_table('translation');
select enable_rls_on_ref_table('organisation_config');
