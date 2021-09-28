ALTER TABLE individual_relationship alter column id type integer;
select setval('individual_relationship_id_seq', (select max(id) from individual_relationship));
