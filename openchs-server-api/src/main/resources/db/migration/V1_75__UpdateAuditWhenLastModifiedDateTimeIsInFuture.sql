UPDATE audit SET last_modified_date_time = current_timestamp
WHERE last_modified_date_time > current_timestamp;