ALTER TABLE address_level DROP COLUMN attributes;
ALTER TABLE address_level ADD COLUMN type VARCHAR(1024);