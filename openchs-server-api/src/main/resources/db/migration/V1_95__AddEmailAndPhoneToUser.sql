ALTER TABLE users
  ADD COLUMN email citext,
  ADD COLUMN phone_number VARCHAR(32),
  ADD COLUMN disabled_in_cognito BOOLEAN DEFAULT FALSE;