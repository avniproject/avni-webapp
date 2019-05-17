ALTER TABLE address_level
  ADD COLUMN lineage ltree UNIQUE;

UPDATE address_level al
SET lineage = (select text2ltree(regexp_replace(
    regexp_replace(regexp_replace(concat_ws('*', bottom3.title, bottom2.title, bottom1.title), '\s+', '_', 'g'),
                   '[^a-zA-Z0-9_*]', '', 'g'), '\*', '.', 'g'))
               from address_level bottom1
                      left join location_location_mapping t1 on bottom1.id = t1.location_id
                      left join address_level bottom2 on bottom2.id = t1.parent_location_id
                      left join location_location_mapping t2 on bottom2.id = t2.location_id
                      left join address_level bottom3 on bottom3.id = t2.parent_location_id
               where al.id = bottom1.id
                 and al.organisation_id = bottom1.organisation_id);

ALTER TABLE address_level
  ALTER COLUMN lineage SET NOT NULL;



