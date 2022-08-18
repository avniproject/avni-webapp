create table menu_item
(
    id                      serial primary key,
    organisation_id         int                         not null references organisation (id),
    uuid                    character varying(255)      not null default uuid_generate_v4(),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null references users (id),
    last_modified_by_id     bigint                      not null references users (id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null,
    displayKey              character varying(255)      not null,
    menuItemType            character varying(100)      not null,
    menuItemGroup           character varying(255)      not null,
    link                    character varying(2000)     null
);

select enable_rls_on_ref_table('menu_item');
