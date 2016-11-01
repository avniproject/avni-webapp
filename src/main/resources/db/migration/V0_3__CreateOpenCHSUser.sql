INSERT INTO users (name, uuid, created_date_time, last_modified_date_time, created_by_id, last_modified_by_id) VALUES ('openchs', '5fed2907-df3a-4867-aef5-c87f4c78a31a', current_timestamp, current_timestamp, 1, 1);

ALTER TABLE ONLY users
  ADD CONSTRAINT users_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY users
  ADD CONSTRAINT users_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);