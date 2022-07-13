alter table individual add column assigned_user_id int null references users(id);

drop table user_subject_assignment;
