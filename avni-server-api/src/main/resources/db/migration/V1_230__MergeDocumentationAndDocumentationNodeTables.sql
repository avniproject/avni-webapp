alter table documentation
    add column parent_id integer references documentation (id);

alter table documentation
    drop column documentation_node_id;

drop table documentation_node;
