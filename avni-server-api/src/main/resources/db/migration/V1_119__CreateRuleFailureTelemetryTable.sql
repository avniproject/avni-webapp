create table rule_failure_telemetry
(
  id              serial primary key,
  uuid            varchar(255) not null,
  user_id         integer      not null,
  organisation_id bigint       not null,
  version         integer default 1,
  rule_uuid       varchar(255) not null,
  individual_uuid varchar(255) not null,
  error_message   varchar(255) not null,
  stacktrace      text         not null,
  status          varchar(255) not null
);

alter table only rule_failure_telemetry
  add constraint rule_failure_telemetry_organisation foreign key (organisation_id) references organisation (id),
  add constraint rule_failure_telemetry_user foreign key (user_id) references users (id);

select enable_rls_on_tx_table('rule_failure_telemetry')
