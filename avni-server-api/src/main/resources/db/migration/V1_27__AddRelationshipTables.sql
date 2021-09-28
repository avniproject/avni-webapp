/*old design table drop*/
DROP TABLE IF EXISTS individual_relation_master CASCADE;
DROP TABLE IF EXISTS individual_reverse_relation_master CASCADE;

/*new design tables create*/
CREATE TABLE individual_relation (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id INTEGER  NOT NULL,
  version INTEGER NOT NULL,
  audit_id   INTEGER);

ALTER TABLE ONLY individual_relation
  ADD CONSTRAINT individual_relation_audit FOREIGN KEY (audit_id) REFERENCES audit (id);

INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('son', '7e876220-20b4-4c17-87b7-0e235926f7a6', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('daughter', '91fd32f2-0261-46a1-92e4-4c201247c9a3', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('father', 'eeb49484-a07d-49f7-bb4b-932b713fbc66', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('mother', '5a77c22b-a24f-456e-84a3-9bd12e104f73', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('husband', '334ea293-fd10-4dab-92f3-04ce153e27aa', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('wife', '0ab14ce3-cbdb-4cb7-8601-353bebe408c9', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('brother', '4809d13f-4ab1-49d7-aa57-ee71a821bc3f', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('sister', 'a081882c-6775-4caa-98cd-9720a0d11dfc', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('grandson', '4474c0f3-9d35-4622-a65a-5688f633a274', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('granddaughter', '82691c26-c042-48d4-972b-664bcb348fc4', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('grandfather', '0d0b0e92-79d4-49c1-b33b-cf0508ea550c', 1, 1);
INSERT INTO individual_relation (name, uuid, version, organisation_id) VALUES ('grandmother', '8c382726-92be-4e3e-8b6e-2b032c5cd6a8', 1, 1);

INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM individual_relation);

UPDATE individual_relation SET audit_id = (SELECT id FROM audit WHERE audit.uuid = individual_relation.uuid);

CREATE TABLE individual_relation_gender_mapping (
  id         SMALLSERIAL PRIMARY KEY,
  uuid       CHARACTER VARYING(255) NOT NULL,
  relation_id SMALLINT NOT NULL,
  gender_id SMALLINT NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id INTEGER  NOT NULL,
  version INTEGER NOT NULL,
  audit_id   INTEGER);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('f6e6f570-aaaf-4069-a14d-e2649e9710d7', 1, 1, 1, 2);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('2eb6adbc-5a55-46f8-925e-f3061fd16e29', 1, 1, 2, 1);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('7c97fe3b-c2e8-437d-a43b-1e6d4357a8d1', 1, 1, 3, 2);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('1896f28c-cace-4034-bf29-c0ab42a4c41e', 1, 1, 4, 1);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('f2916111-b753-4004-85d5-a63856ce4462', 1, 1, 5, 2);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('ec90bb6f-2ccb-4e4c-be01-ae95cc441b98', 1, 1, 6, 1);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('ac49854a-776d-4311-9b13-c536b97e0c48', 1, 1, 7, 2);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('90de5a8a-cbbc-4bab-8019-edf3f1d02317', 1, 1, 8, 1);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('0dff0a2b-ac07-4c31-8338-c32af05b31fc', 1, 1, 9, 2);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('db89d727-3c3e-45fc-a18d-a58c3098d5ca', 1, 1, 10, 1);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('50a3aa9e-04be-465f-be7b-22e0ab8e500e', 1, 1, 11, 2);
insert into individual_relation_gender_mapping(uuid, version, organisation_id, relation_id, gender_id) VALUES ('29b20f70-6b3e-481e-96cf-c4fe0e2d46c1', 1, 1, 12, 1);

ALTER TABLE ONLY individual_relation_gender_mapping
  ADD CONSTRAINT individual_relation_gender_mapping_audit FOREIGN KEY (audit_id) REFERENCES audit (id);
ALTER TABLE ONLY individual_relation_gender_mapping
  ADD CONSTRAINT individual_relation_gender_mapping_relation FOREIGN KEY (relation_id) REFERENCES individual_relation (id);
ALTER TABLE ONLY individual_relation_gender_mapping
  ADD CONSTRAINT individual_relation_gender_mapping_gender FOREIGN KEY (gender_id) REFERENCES gender (id);

INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM individual_relation_gender_mapping);

UPDATE individual_relation_gender_mapping SET audit_id = (SELECT id FROM audit WHERE audit.uuid = individual_relation_gender_mapping.uuid);


CREATE TABLE individual_relationship_type (
  id         SMALLSERIAL PRIMARY KEY,
  uuid       CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  individual_a_is_to_b_relation_id SMALLINT NOT NULL,
  individual_b_is_to_a_relation_id SMALLINT NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id INTEGER  NOT NULL,
  version INTEGER NOT NULL,
  audit_id   INTEGER);
  
ALTER TABLE ONLY individual_relationship_type
  ADD CONSTRAINT individual_relationship_type_audit FOREIGN KEY (audit_id) REFERENCES audit (id);
ALTER TABLE ONLY individual_relationship_type
  ADD CONSTRAINT individual_relationship_type_individual_a_relation FOREIGN KEY (individual_a_is_to_b_relation_id) REFERENCES individual_relation (id);
ALTER TABLE ONLY individual_relationship_type
  ADD CONSTRAINT individual_relationship_type_individual_b_relation FOREIGN KEY (individual_b_is_to_a_relation_id) REFERENCES individual_relation (id);


INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '1d9c019a-9350-44f9-9ef9-a699f0d94a13', 1, 1, 'father-son', 3, 1);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '1db2a945-0692-481e-a68c-aaf7cc246d64', 1, 1, 'father-daughter', 3, 2);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( 'd84d15c2-3d09-416e-8c26-9709ce3c90da', 1, 1, 'mother-son', 4, 1);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '99ad5750-bdf8-40e6-964c-01cf806707b7', 1, 1, 'mother-daughter', 4, 2);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '89d85d58-de14-4249-b9bb-61d4abb94b77', 1, 1, 'spouse', 5, 6);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '2a6a496c-6063-4383-8857-0c10a831d85c', 1, 1, 'brother-brother', 7, 7);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '3731d4b6-80f4-410b-baf7-2c0fcc38fe1f', 1, 1, 'sister-sister', 8, 8);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '765bc1ed-441a-414d-b62a-672103b35c95', 1, 1, 'brother-sister', 7, 8);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '8458bbe3-aa87-4c7c-b5e2-a139e01bd88f', 1, 1, 'grandfather-grandson', 11, 9);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '1724ff11-95c5-42c2-b697-f40f1105d696', 1, 1, 'grandfather-granddaughter', 11, 10);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( '28edbf6e-98eb-4218-8950-01d97be476da', 1, 1, 'grandmother-grandson', 12, 9);
INSERT INTO individual_relationship_type (uuid, version, organisation_id, name, individual_a_is_to_b_relation_id, individual_b_is_to_a_relation_id) VALUES ( 'ace301c1-2815-42c1-943e-c7b44f64b376', 1, 1, 'grandmother-granddaughter', 12, 10);

INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM individual_relationship_type);

UPDATE individual_relationship_type SET audit_id = (SELECT id FROM audit WHERE audit.uuid = individual_relationship_type.uuid);


CREATE TABLE individual_relationship (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  individual_a_id BIGINT NOT NULL,
  individual_b_id BIGINT NOT NULL,
  relationship_type_id SMALLINT NOT NULL,
  enter_date_time TIMESTAMP,
  exit_date_time TIMESTAMP,
  exit_observations JSONB,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id INTEGER  NOT NULL,
  version INTEGER NOT NULL,
  audit_id   INTEGER);

ALTER TABLE ONLY individual_relationship
  ADD CONSTRAINT individual_relationship_audit FOREIGN KEY (audit_id) REFERENCES audit (id);
ALTER TABLE ONLY individual_relationship
  ADD CONSTRAINT individual_relationship_individual_a FOREIGN KEY (individual_a_id) REFERENCES individual (id);
ALTER TABLE ONLY individual_relationship
  ADD CONSTRAINT individual_relationship_individual_b FOREIGN KEY (individual_b_id) REFERENCES individual (id);
ALTER TABLE ONLY individual_relationship
  ADD CONSTRAINT individual_relationship_relation_type FOREIGN KEY (relationship_type_id) REFERENCES individual_relationship_type (id);
