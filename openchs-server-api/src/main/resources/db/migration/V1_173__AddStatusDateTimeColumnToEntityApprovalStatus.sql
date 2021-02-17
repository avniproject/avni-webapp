ALTER TABLE entity_approval_status
    ADD COLUMN status_date_time timestamptz;

UPDATE entity_approval_status eas
SET status_date_time = (SELECT last_modified_date_time FROM audit a WHERE a.id = eas.audit_id)
WHERE eas.status_date_time ISNULL;

ALTER TABLE entity_approval_status
    ALTER COLUMN status_date_time SET NOT NULL;


