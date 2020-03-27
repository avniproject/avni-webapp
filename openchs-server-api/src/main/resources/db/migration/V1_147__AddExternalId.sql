alter table individual
    add column external_id varchar null;

alter table openchs.public.individual
    add constraint individual_external_id_organisation_id_uniq_idx unique (external_id, organisation_id);

