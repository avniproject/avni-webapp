ALTER TABLE address_level
  ADD COLUMN lineage ltree;

ALTER TABLE address_level
  ADD COLUMN parent_id INTEGER REFERENCES address_level;

UPDATE address_level
  SET parent_id=location_location_mapping.parent_location_id
    FROM location_location_mapping
      WHERE location_location_mapping.location_id=address_level.id;

ALTER TABLE address_level
  ADD CONSTRAINT lineage_parent_consistency
    CHECK (
      -- only validating parent->child relationship and not the entire tree
      (parent_id IS NOT NULL AND SUBLTREE(lineage, 0, NLEVEL(lineage)) ~ CONCAT('*.', parent_id, '.', id)::lquery)
      OR
      (parent_id IS NULL AND lineage ~ CONCAT('', id)::lquery)
    );

WITH
  RECURSIVE parent_tree(id, parent_id, parents, depth) AS (
      SELECT id, parent_id, id::TEXT, 0
      FROM address_level
      UNION
      SELECT parent_tree.id, address_level.parent_id, CONCAT(address_level.id,'.',parent_tree.parents), depth+1
      FROM parent_tree
      JOIN address_level ON parent_tree.parent_id = address_level.id
  ),
	lineage_cte AS (SELECT DISTINCT ON (id) id, parents
                  FROM parent_tree
                  ORDER BY id, depth DESC)

UPDATE address_level
  SET lineage = text2ltree(lineage_cte.parents)
    FROM lineage_cte
      WHERE lineage_cte.id = address_level.id;