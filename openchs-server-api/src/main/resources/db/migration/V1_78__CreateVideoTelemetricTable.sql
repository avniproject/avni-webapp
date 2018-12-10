create table video_telemetric (
  id                serial primary key,
  uuid              varchar(255),
  video_start_time  double precision         not null,
  video_end_time    double precision         not null,
  player_open_time  timestamp with time zone not null,
  player_close_time timestamp with time zone not null,
  video_id          integer                  not null,
  user_id           integer                  not null,
  created_datetime  timestamp with time zone not null,
  organisation_id   integer                  not null,
  is_voided         boolean default false    not null
);

alter table only video_telemetric
  add constraint video_telemetric_video foreign key (video_id) references video (id),
  add constraint video_telemetric_user foreign key (user_id) references users (id),
  add constraint video_telemetric_organisation foreign key (organisation_id) references organisation (id);

create policy video_telemetric_orgs
  on video_telemetric using (organisation_id in
                  (with recursive list_of_orgs(id, parent_organisation_id) as (select id, parent_organisation_id
                                                                               from organisation
                                                                               where db_user = current_user
                                                                               union all select o.id,
                                                                                                o.parent_organisation_id
                                                                                         from organisation o,
                                                                                              list_of_orgs log
                                                                                         where o.id = log.parent_organisation_id) select id
                                                                                                                                  from list_of_orgs))
with check ((organisation_id = (select id
                                from organisation
                                where db_user = current_user)));
