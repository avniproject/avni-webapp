CREATE TABLE msg91_config
(
    id                        SERIAL PRIMARY KEY,
    uuid                      VARCHAR(255) NOT NULL,
    auth_key                  VARCHAR(255) NOT NULL,
    otp_sms_template_id       VARCHAR(255) NOT NULL,
    otp_length                SMALLINT,
    organisation_id           INTEGER      NOT NULL,
    audit_id                  INTEGER,
    is_voided                 BOOLEAN      NOT NULL DEFAULT FALSE,
    version                   INTEGER
);

ALTER TABLE ONLY msg91_config
    ADD CONSTRAINT msg91_config_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT msg91_config_audit FOREIGN KEY (audit_id) REFERENCES audit (id);

SELECT enable_rls_on_ref_table('msg91_config');
