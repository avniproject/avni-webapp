ALTER TABLE sync_telemetry
    ADD COLUMN device_name varchar(255),
    ADD COLUMN android_version varchar(255),
    ADD COLUMN app_version varchar(255)