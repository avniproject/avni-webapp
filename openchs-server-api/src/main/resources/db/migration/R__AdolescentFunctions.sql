CREATE OR REPLACE FUNCTION has_problem(JSONB)
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
BEGIN
  SELECT one_of_coded_obs_contains($1, ARRAY['Is there any physical defect?', 'Is there a swelling at lower back?', 'Is there Cleft lip/Cleft palate?', 'Is there large gap between toe and finger?', 'Is her nails/tongue pale?', 'Is she/he severely malnourished?', 'Is there any problem in leg bone?', 'Is there a swelling over throat?', 'Does she have difficulty in breathing while playing?', 'Are there dental carries?', 'Is there a white patch in her eyes?', 'Does she have impaired vision?', 'Is there pus coming from ear?', 'Does she have impaired hearing?', 'Has she ever suffered from convulsions?', 'Is her behavior different from others?', 'Is she slower than others in learning and understanding new things?', 'Is there any developmental delay or disability seen?', 'Menstrual disorder', 'Do you suffer from burning micturition?', 'Do you suffer from Ulcer over genitalia?', 'Do you suffer from Yellowish discharge from Vagina / penis?'], 'Yes') INTO exists;
  RETURN exists;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION is_counselled(JSONB)
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
BEGIN
  SELECT one_of_coded_obs_contains($1, ARRAY['Counselling for Road Traffic Accident Done', 'Counselling for Early Pregnancy & RTI Done'], 'Yes') INTO exists;
  RETURN exists;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION has_dropped_out(JSONB, JSONB)
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
BEGIN
  SELECT in_one_entity_coded_obs_contains($1, $2, 'School going', 'Dropped Out') INTO exists;
  RETURN exists;
END;
$$ LANGUAGE plpgsql;

