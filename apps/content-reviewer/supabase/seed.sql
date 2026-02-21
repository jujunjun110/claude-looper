-- Dummy user for development/e2e testing
INSERT INTO users (id, email, name, avatar_url, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'dummy@example.com',
  'Dummy User',
  NULL,
  '2025-01-01T00:00:00Z',
  '2025-01-01T00:00:00Z'
)
ON CONFLICT (id) DO NOTHING;
