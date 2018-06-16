CREATE TABLE individual_relation_master (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL,
  audit_id   INTEGER);

ALTER TABLE ONLY individual_relation_master
  ADD CONSTRAINT individual_relation_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id);

INSERT INTO individual_relation_master (name, uuid, version) VALUES ('son', 'ade34813-dbfb-44a9-bed0-534cecbaccf2', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('daughter', '7a12cef2-febd-44e4-91f9-c6b8945d5962', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('father', '0fdf6781-698a-4b7a-bcc9-f622e078c41d', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('mother', '30ce916b-557d-4cd4-a3fd-b3154a8b594c', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('husband', 'f8b7576e-01bc-46d2-a01e-40b260e8e8ed', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('wife', '89619c86-e603-4856-af49-bd6b2658f176', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('brother', '9c303777-2e18-4d54-9ae1-53cab97893e7', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('sister', '1b0789e2-b017-4cfb-817a-9e0cddd2509e', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('grandson', 'b7c4a7f6-0b40-4bdc-a489-7d0b9c82d6e3', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('granddaughter', '6b5114c9-2d57-47b6-ad3e-1846c264c229', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('grandfather', '7d1d6931-7af9-4e10-9ece-dd1e44bb4574', 1);
INSERT INTO individual_relation_master (name, uuid, version) VALUES ('grandmother', 'aae67acd-c1e1-494b-b286-e87e544a3cb4', 1);

INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM individual_relation_master);

UPDATE individual_relation_master SET audit_id = (SELECT id FROM audit WHERE audit.uuid = individual_relation_master.uuid);

CREATE TABLE individual_relative (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  individual_id BIGINT NOT NULL,
  relative_individual_id BIGINT NOT NULL,
  relation_id SMALLINT NOT NULL,
  enter_date_time TIMESTAMP,
  exit_date_time TIMESTAMP,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id INTEGER  NOT NULL,
  version INTEGER NOT NULL,
  audit_id   INTEGER);

ALTER TABLE ONLY individual_relative
  ADD CONSTRAINT individual_relation_audit FOREIGN KEY (audit_id) REFERENCES audit (id);
ALTER TABLE ONLY individual_relative
  ADD CONSTRAINT individual_relative_individual FOREIGN KEY (individual_id) REFERENCES individual (id);
ALTER TABLE ONLY individual_relative
  ADD CONSTRAINT individual_relative_relative_individual FOREIGN KEY (relative_individual_id) REFERENCES individual (id);
