CREATE TABLE individual_reverse_relation_master (
  id         SMALLSERIAL PRIMARY KEY,
  uuid       CHARACTER VARYING(255) NOT NULL,
  relation_id SMALLINT NOT NULL,
  individual_gender_id SMALLINT NOT NULL,
  reverse_relation_id SMALLINT NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL,
  audit_id   INTEGER);

ALTER TABLE ONLY individual_reverse_relation_master
  ADD CONSTRAINT individual_reverse_relation_master_relation FOREIGN KEY (relation_id) REFERENCES individual_relation_master (id);
ALTER TABLE ONLY individual_reverse_relation_master
  ADD CONSTRAINT individual_reverse_relation_master_gender FOREIGN KEY (individual_gender_id) REFERENCES gender (id);
ALTER TABLE ONLY individual_reverse_relation_master
  ADD CONSTRAINT individual_reverse_relation_master_reverse_relation FOREIGN KEY (reverse_relation_id) REFERENCES individual_relation_master (id);
ALTER TABLE ONLY individual_reverse_relation_master
  ADD CONSTRAINT individual_reverse_relation_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id);

INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'c4ab0751-5b59-4dda-bc9a-4c2088c34f10', 1, 1, 1, 4);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '50357d3f-674b-40e3-82e3-dbea0100924b', 1, 1, 2, 3);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '48053ccf-d22a-4e52-b38d-9ba00ea17ab5', 1, 2, 1, 4);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'bcd2273e-09a5-484d-a5ed-be425a86944f', 1, 2, 2, 3);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '4be076f9-f99a-4d19-b806-17e1da29280a', 1, 3, 1, 2);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'dd5c3255-e0c1-48dd-9815-bee3ec9c03d0', 1, 3, 2, 1);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '830585a0-de1c-41f7-94c8-f003926f5bf9', 1, 4, 1, 2);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'd98c51be-b928-431b-acc5-b35dc47a3bee', 1, 4, 2, 1);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'e2ca259e-2993-4cef-8f37-9b26ddf39962', 1, 5, 1, 6);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'ac12b0f4-4b07-4fcc-95d0-b32430bab2a1', 1, 6, 2, 5);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'd3fb028a-e9c3-450b-965e-4309bd86f414', 1, 7, 1, 8);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'b47f4b3d-5571-4bcf-8942-cb67a61f7735', 1, 7, 2, 7);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'f76141b5-6bb7-4892-bf69-11c6b4dfedc1', 1, 8, 1, 8);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '93b29ce9-cfa6-4882-8a82-c34779525aa9', 1, 8, 2, 7);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '916b476d-c09c-4628-8673-cfe4db6785c5', 1, 9, 1, 12);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'd7b67bd6-0ec3-4f1e-9112-d5b957cabde6', 1, 9, 2, 11);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( 'b90ee1ce-b5bb-4b0a-b6cc-76384971acfb', 1, 10, 1, 12);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '0bdcb7d3-cc2b-4a2c-8726-c7080587cf7f', 1, 10, 2, 11);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '083b3393-9f46-4ab1-b544-456d3db602ed', 1, 11, 1, 10);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '6dc70f3d-51b4-4dee-a2d5-6a7a52beff16', 1, 11, 2, 9);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '8103bdf8-b22a-4f4b-b226-52436c205bed', 1, 12, 1, 10);
INSERT INTO individual_reverse_relation_master (uuid, version, relation_id, individual_gender_id, reverse_relation_id) VALUES ( '5564fbbb-ccca-4ebe-bb15-909c9ebd19f1', 1, 12, 2, 9);

INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM individual_reverse_relation_master);

UPDATE individual_reverse_relation_master SET audit_id = (SELECT id FROM audit WHERE audit.uuid = individual_reverse_relation_master.uuid);

