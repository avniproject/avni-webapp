create table news
(
    id              SERIAL PRIMARY KEY,
    organisation_id bigint                 not null references organisation (id),
    uuid            CHARACTER VARYING(255) not null,
    title           text                   not null,
    content         text,
    contentHtml     text,
    hero_image      text,
    published_date  timestamp with time zone,
    is_voided       boolean                not null default false,
    audit_id        bigint                 not null REFERENCES audit (id),
    version         bigint                 not null default 0
);

create unique index news_uuid_organisation_id_uniq_idx  on news(uuid, organisation_id);
create index news_published_date_idx on news(organisation_id, published_date);

select enable_rls_on_tx_table('news');


