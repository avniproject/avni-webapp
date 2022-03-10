alter table organisation
    add column has_analytics_db boolean not null default false;

-- This is required because organisation groups will now require their own schema
alter table organisation_group
    add column has_analytics_db boolean not null default false;