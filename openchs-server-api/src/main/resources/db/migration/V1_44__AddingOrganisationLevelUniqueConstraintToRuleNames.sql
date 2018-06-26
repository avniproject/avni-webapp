ALTER TABLE rule
  ADD CONSTRAINT unique_rule_name UNIQUE (organisation_id, name);
ALTER TABLE rule
  ADD CONSTRAINT unique_fn_rule_name UNIQUE (organisation_id, fn_name);
ALTER TABLE rule
  ADD COLUMN execution_order DOUBLE PRECISION NOT NULL DEFAULT 0.0;