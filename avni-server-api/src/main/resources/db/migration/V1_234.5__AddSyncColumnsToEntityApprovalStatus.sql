alter table entity_approval_status
    add column address_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;