alter table users add column operating_individual_scope varchar(255);

update users set operating_individual_scope = 'ByCatchment' where operating_individual_scope is null;

alter table users alter column operating_individual_scope set not null;
