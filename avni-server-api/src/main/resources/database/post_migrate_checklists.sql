INSERT INTO checklist
(program_enrolment_id, uuid, version, base_date, organisation_id, is_voided, audit_id, checklist_detail_id)
  (SELECT
     ct.program_enrolment_id,
     ct.uuid,
     ct.version,
     ct.base_date,
     ct.organisation_id,
     ct.is_voided,
     ct.audit_id,
     cd.id
   FROM checklist_temp ct
     LEFT JOIN checklist_detail cd ON cd.organisation_id = ct.organisation_id
   WHERE cd.organisation_id = 10);


INSERT INTO checklist_item
(completion_date, checklist_id, uuid, version, organisation_id, is_voided, audit_id, checklist_item_detail_id, observations)
  (SELECT
     ct.completion_date,
     c.id,
     ct.uuid,
     ct.version,
     ct.organisation_id,
     ct.is_voided,
     ct.audit_id,
     cd.id,
     '{}' :: JSONB
   FROM checklist_item_temp ct
     LEFT OUTER JOIN checklist_item_detail cd ON ct.concept_id=cd.concept_id
     LEFT OUTER JOIN checklist_temp ct1 on ct1.id=ct.checklist_id
     LEFT OUTER JOIN checklist c on c.uuid=ct1.uuid
   WHERE cd.organisation_id = 10 and ct.organisation_id=10);

UPDATE audit
SET last_modified_date_time = current_timestamp
WHERE id IN (SELECT audit_id
             FROM checklist_temp);

UPDATE audit
SET last_modified_date_time = current_timestamp
WHERE id IN (SELECT audit_id
             FROM checklist_item_temp);

