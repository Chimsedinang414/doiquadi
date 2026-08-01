ALTER TABLE locations
ADD COLUMN created_by CHAR(36),
ADD CONSTRAINT fk_location_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
