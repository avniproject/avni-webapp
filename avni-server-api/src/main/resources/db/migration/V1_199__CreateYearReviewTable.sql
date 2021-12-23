create table user_review_matrix
(
    id              serial primary key,
    user_id         integer references users (id),
    organisation_id integer references organisation (id),
    review_year     integer not null default 2021,
    matrix          jsonb not null
);

alter table user_review_matrix add unique (user_id, organisation_id, review_year);

select enable_rls_on_tx_table('user_review_matrix');

