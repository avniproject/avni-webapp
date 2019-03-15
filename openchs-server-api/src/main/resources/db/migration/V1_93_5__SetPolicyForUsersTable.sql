
DROP POLICY IF EXISTS users_user ON users;
DROP POLICY IF EXISTS users_orgs ON users;
DROP POLICY IF EXISTS users_policy ON users;
CREATE POLICY users_policy
ON users
-- VIEWING:
-- all_children, all_ancestors, no_siblings
USING (organisation_id in (WITH RECURSIVE children(id, parent_organisation_id) AS (
  SELECT id, parent_organisation_id
  FROM organisation
  WHERE db_user = CURRENT_USER
  UNION ALL
  SELECT grand_children.id,
         grand_children.parent_organisation_id
  FROM organisation grand_children,
       children
  WHERE (grand_children.parent_organisation_id = children.id)
)
select children.id
from children
union (WITH RECURSIVE parents(id, parent_organisation_id) AS (
  SELECT id, parent_organisation_id
  FROM organisation
  WHERE db_user = CURRENT_USER
  UNION ALL
  SELECT grand_parents.id,
         grand_parents.parent_organisation_id
  FROM organisation grand_parents,
       parents
  WHERE (grand_parents.id = parents.parent_organisation_id)
) select parents.id from parents)
UNION ALL select id from organisation where parent_organisation_id ISNULL and CURRENT_USER = ('openchs_impl'::name)))

-- EDITING:
-- all_children, no_ancestors, no_siblings
-- and top level organisataion from other organisation-trees, If the current user is 'openchs_impl'
WITH CHECK (organisation_id in (WITH RECURSIVE children(id, parent_organisation_id) AS (
  SELECT id, parent_organisation_id
  FROM organisation
  WHERE db_user = CURRENT_USER
  UNION ALL
  SELECT grand_children.id,
         grand_children.parent_organisation_id
  FROM organisation grand_children,
       children
  WHERE (grand_children.parent_organisation_id = children.id)
)
select children.id
from children
UNION ALL select id from organisation where parent_organisation_id ISNULL and CURRENT_USER = 'openchs_impl'));
