CREATE TABLE account
(
    id                serial primary key,
    name              varchar(255) not null
);

CREATE TABLE account_admin
(
    id         serial primary key,
    name       varchar(255) not null,
    account_id integer      not null,
    admin_id   integer      not null
);

CREATE TABLE organisation_group
(
    id         serial primary key,
    name       varchar(255) not null,
    db_user     varchar(255) not null,
    account_id integer      not null
);

CREATE TABLE organisation_group_organisation
(
    id              serial primary key,
    name            varchar(255) not null,
    organisation_group_id    integer      not null,
    organisation_id integer      not null
);

alter table only account_admin
    add constraint account_admin_account foreign key (account_id) references account (id),
    add constraint account_admin_user foreign key (admin_id) references users (id);

alter table only organisation_group
    add constraint organisation_group_account foreign key (account_id) references account (id);

alter table only organisation_group_organisation
    add constraint organisation_group_organisation_organisation_group foreign key (organisation_group_id) references organisation_group (id),
    add constraint organisation_group_organisation_organisation foreign key (organisation_id) references organisation (id);

insert into account (name) values ('default');

insert into account_admin (name, account_id, admin_id)
values ('Samanvay',
        (select id from account where name = 'default'),
        (select id from users where username = 'admin'));

ALTER TABLE organisation
    ADD COLUMN account_id INTEGER NOT NULL DEFAULT 1;

alter table only organisation
    add constraint organisation_account foreign key (account_id) references account (id);


ALTER TABLE users DROP COLUMN is_admin;

