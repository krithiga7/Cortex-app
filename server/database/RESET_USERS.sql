-- Clear existing users and add fresh demo user
DELETE FROM users;

-- Insert a fresh admin user with password: admin123
-- Bcrypt hash generated with 10 rounds
INSERT INTO users (id, email, password, name, role)
VALUES (
  gen_random_uuid(),
  'admin@crisis.com',
  '$2b$10$WS1WoxMikVIEpwuNKvDOFOUBSKRzt1Glzi07NGJFa.xUWeQDGw5H6',
  'System Administrator',
  'admin'
);

-- Verify the user was created
SELECT id, email, name, role, created_at FROM users;
