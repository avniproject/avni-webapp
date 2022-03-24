-- Facility id is referenced in individual table which exposes facility_id column to all the views
-- This is the reason we cannot drop facility_id from the individual table and we need to keep the facility table as well.
UPDATE users SET operating_individual_scope = 'None' WHERE operating_individual_scope = 'ByFacility';
ALTER TABLE identifier_source DROP COLUMN facility_id;
UPDATE individual SET facility_id = NULL WHERE facility_id NOTNULL;
DROP TABLE user_facility_mapping;
