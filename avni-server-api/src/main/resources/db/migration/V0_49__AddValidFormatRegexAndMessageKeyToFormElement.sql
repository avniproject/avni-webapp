ALTER TABLE form_element
  ADD COLUMN valid_format_regex character varying(255),
  ADD COLUMN valid_format_description_key character varying(255),
  ADD CONSTRAINT valid_format_check CHECK
((valid_format_regex IS NULL and valid_format_description_key IS NULL)
 OR (valid_format_regex IS NOT NULL and valid_format_description_key IS NOT NULL));