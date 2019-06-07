ALTER TABLE address_level_type
  ADD COLUMN level double precision default 0;

update address_level_type
set level = (select distinct level from address_level where type_id = address_level_type.id);