ALTER TABLE non_applicable_form_element
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY non_applicable_form_element_user
  ON non_applicable_form_element USING (organisation_id IN (SELECT id
                                                            FROM organisation
                                                            WHERE db_user IN ('openchs', current_user))) WITH CHECK (
  organisation_id IN (SELECT id
                      FROM organisation
                      WHERE db_user IN ('openchs', current_user)));