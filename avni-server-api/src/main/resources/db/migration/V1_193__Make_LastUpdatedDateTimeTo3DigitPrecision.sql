alter table audit alter column last_modified_date_time set data type timestamp(3) with time zone;
alter table users alter column last_modified_date_time set data type timestamp(3) with time zone;
alter table privilege alter column last_modified_date_time set data type timestamp(3) with time zone;
alter table standard_report_card_type alter column last_modified_date_time set data type timestamp(3) with time zone;
alter table approval_status alter column last_modified_date_time set data type timestamp(3) with time zone;
