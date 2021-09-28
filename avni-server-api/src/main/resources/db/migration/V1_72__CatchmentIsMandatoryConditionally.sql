update users set catchment_id = null, operating_individual_scope = 'None' where id = 1 and name = 'admin';
update users set catchment_id=1 where id!=1 and name != 'admin';
alter table users alter column catchment_id drop not null;
alter table users add check (operating_individual_scope != 'ByCatchment' OR catchment_id IS NOT NULL);