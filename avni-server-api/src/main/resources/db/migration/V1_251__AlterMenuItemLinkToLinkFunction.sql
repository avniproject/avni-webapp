alter table menu_item drop column link;
alter table menu_item add column link_function character varying(10000) null;
