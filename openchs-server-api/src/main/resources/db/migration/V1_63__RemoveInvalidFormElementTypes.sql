update audit
set last_modified_date_time = current_timestamp
where id in (select audit.id
             from audit
               inner join form_element on audit.id = form_element.audit_id
             where form_element.type in ('Numeric', 'Date', 'Text'));
update form_element
  set type = null where type in ('Numeric', 'Date', 'Text');