ALTER TABLE rule_failure_telemetry DROP COLUMN status;
ALTER TABLE rule_failure_telemetry ADD COLUMN error_date_time timestamptz;
ALTER TABLE rule_failure_telemetry ADD COLUMN close_date_time timestamptz;
ALTER TABLE rule_failure_telemetry ADD COLUMN is_closed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE rule_failure_telemetry ADD COLUMN audit_id bigint;

ALTER TABLE ONLY rule_failure_telemetry
    ADD CONSTRAINT rule_failure_telemetry_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id);
