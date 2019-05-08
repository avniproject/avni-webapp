DROP FUNCTION IF EXISTS create_db_user(inrolname text, inpassword text);
CREATE OR REPLACE FUNCTION create_db_user(inrolname text, inpassword text)
  RETURNS BIGINT AS
$BODY$
  BEGIN
    IF NOT EXISTS(SELECT rolname FROM pg_roles WHERE rolname = inrolname)
    THEN
      EXECUTE 'CREATE ROLE ' || quote_ident(inrolname) || ' NOINHERIT LOGIN PASSWORD ' || quote_literal(inpassword);
    END IF;
    EXECUTE 'GRANT ' || quote_ident(inrolname) || ' TO openchs';
    PERFORM grant_all_on_all(inrolname);
    RETURN 1;
  END
$BODY$ LANGUAGE PLPGSQL;
