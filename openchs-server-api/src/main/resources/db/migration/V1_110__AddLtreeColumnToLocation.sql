ALTER TABLE address_level
  ADD COLUMN lineage ltree;

with name_normalized as (select id, coalesce(nullif(regexp_replace(
                                      regexp_replace(
                                        trim(title), '\s+', '_', 'g'),
                                      '[^a-zA-Z0-9_]', '', 'g'),''), '_') title
                         from address_level),
     withlineage as (select concat_ws('.', bottom3.title, bottom2.title, bottom1.title) lineage, bottom1.id
                     from name_normalized bottom1
                            left join location_location_mapping t1 on bottom1.id = t1.location_id
                            left join name_normalized bottom2 on bottom2.id = t1.parent_location_id
                            left join location_location_mapping t2 on bottom2.id = t2.location_id
                            left join name_normalized bottom3 on bottom3.id = t2.parent_location_id)

UPDATE address_level al
SET lineage = text2ltree(line.lineage)
from withlineage line
where line.id = al.id;

ALTER TABLE address_level
  ALTER COLUMN lineage SET NOT NULL,
  ADD CONSTRAINT address_level_lineage_unique UNIQUE (lineage);
