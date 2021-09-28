ALTER TABLE organisation
  ADD COLUMN parent_organisation_id INTEGER REFERENCES organisation (id);

UPDATE organisation
SET parent_organisation_id = (SELECT id
                              FROM organisation
                              WHERE name = 'OpenCHS')
WHERE name <> 'OpenCHS';