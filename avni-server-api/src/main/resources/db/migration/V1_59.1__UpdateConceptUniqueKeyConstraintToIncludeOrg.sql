ALTER  TABLE concept
    DROP  CONSTRAINT concept_name_key,
    ADD CONSTRAINT  concept_name_orgid UNIQUE(name,organisation_id);