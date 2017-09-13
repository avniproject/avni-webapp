DO
$body$
BEGIN
   IF NOT EXISTS (
      SELECT                       -- SELECT list can stay empty for this
      FROM   pg_catalog.pg_user
      WHERE  usename = 'my_user') THEN

      CREATE ROLE openchs LOGIN PASSWORD 'password';
   END IF;
END
$body$;
