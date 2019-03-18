DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = 'openchs_impl')
  THEN
    DROP ROLE IF EXISTS openchs_impl;
    CREATE ROLE openchs_impl
      NOINHERIT
      NOLOGIN
      NOBYPASSRLS;
    GRANT openchs_impl TO openchs;

    UPDATE organisation SET db_user = 'openchs_impl' where name = 'OpenCHS';
  END IF;
END$$;
