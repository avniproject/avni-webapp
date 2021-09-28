ALTER TABLE operational_encounter_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_program ENABLE ROW LEVEL SECURITY;

CREATE POLICY operational_encounter_type_user ON operational_encounter_type USING (organisation_id in (select id from organisation where db_user in ('openchs', current_user))) WITH CHECK (organisation_id in (select id from organisation where db_user in ('openchs', current_user)));

CREATE POLICY operational_operational_program ON operational_program USING (organisation_id in (select id from organisation where db_user in ('openchs', current_user))) WITH CHECK (organisation_id in (select id from organisation where db_user in ('openchs', current_user)));