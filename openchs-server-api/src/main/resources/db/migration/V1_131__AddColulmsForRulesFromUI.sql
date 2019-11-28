ALTER TABLE form ADD COLUMN decision_rule text;
ALTER TABLE form ADD COLUMN validation_rule text;
ALTER TABLE form ADD COLUMN visit_schedule_rule text;

ALTER TABLE program ADD COLUMN enrolment_summary_rule text;
ALTER TABLE program ADD COLUMN checklists_rule text;
ALTER TABLE program ADD COLUMN enrolment_eligibility_check_rule text;

ALTER TABLE encounter ADD COLUMN encounter_eligibility_check_rule text;