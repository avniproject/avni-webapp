create table index_metadata
(
    id                serial primary key,
    table_metadata_id integer references table_metadata (id),
    column_id         integer references column_metadata (id),
    name              text
);