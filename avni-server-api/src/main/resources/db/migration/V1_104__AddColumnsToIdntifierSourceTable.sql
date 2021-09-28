alter table identifier_source
    add column min_length integer not null default 0,
    add column max_length integer not null default 0;