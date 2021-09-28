ALTER TABLE organisation_config ADD COLUMN audit_id bigint;
ALTER TABLE organisation_config ADD COLUMN version integer default 1;
ALTER TABLE organisation_config ADD COLUMN is_voided boolean DEFAULT false;

ALTER TABLE ONLY organisation_config
    ADD CONSTRAINT organisation_config_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id);
