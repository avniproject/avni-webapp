update privilege
set last_modified_date_time = current_timestamp(3) + id * interval '1 millisecond';

update standard_report_card_type
set last_modified_date_time = current_timestamp(3) + id * interval '1 millisecond';

update approval_status
set last_modified_date_time = current_timestamp(3) + id * interval '1 millisecond';
