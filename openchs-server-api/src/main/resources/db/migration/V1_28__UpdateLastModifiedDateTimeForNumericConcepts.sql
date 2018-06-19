UPDATE audit set last_modified_date_time = current_timestamp
FROM concept
WHERE concept.audit_id = audit.id and concept.data_type = 'Numeric';