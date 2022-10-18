ALTER TABLE message_request_queue RENAME COLUMN scheduled_time TO scheduled_date_time;
ALTER TABLE message_request_queue RENAME COLUMN delivered_time TO delivered_date_time;
