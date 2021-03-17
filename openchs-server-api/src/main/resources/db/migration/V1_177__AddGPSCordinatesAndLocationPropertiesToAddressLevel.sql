alter table address_level
    add column gps_coordinates point,
    add column location_properties jsonb;
