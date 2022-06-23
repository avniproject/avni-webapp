create table documentation_node
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    name                    text                        NOT NULL,
    organisation_id         integer                     NOT NULL references organisation (id),
    parent_id               integer references documentation_node (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null,
    last_modified_by_id     bigint                      not null,
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table documentation_node
    add unique (uuid, organisation_id);
create index documentation_node_organisation_id_index on documentation_node (organisation_id);
select enable_rls_on_tx_table('documentation_node');


create table documentation
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    name                    text                        NOT NULL,
    documentation_node_id   integer                     NOT NULL references documentation_node (id),
    organisation_id         integer                     NOT NULL references organisation (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null,
    last_modified_by_id     bigint                      not null,
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table documentation
    add unique (uuid, organisation_id);
create index documentation_documentation_node_id_index on documentation (documentation_node_id);
create index documentation_organisation_id_index on documentation (organisation_id);
select enable_rls_on_tx_table('documentation');


create table documentation_item
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    documentation_id        integer                     NOT NULL references documentation (id),
    language                text                        NOT NULL,
    content                 text                        NOT NULL,
    contenthtml             text                        NOT NULL,
    organisation_id         integer                     NOT NULL references organisation (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null,
    last_modified_by_id     bigint                      not null,
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);
alter table documentation_item
    add unique (uuid, organisation_id);
create index documentation_item_documentation_id_index on documentation_item (documentation_id);
create index documentation_item_organisation_id_index on documentation_item (organisation_id);
select enable_rls_on_tx_table('documentation_item');


alter table form_element
    add column documentation_id integer references documentation (id);
