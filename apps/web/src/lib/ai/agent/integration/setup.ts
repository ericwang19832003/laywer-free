// Global setup — validates required env vars before any integration test runs.
// Accepts either test-specific vars (SUPABASE_TEST_URL / SUPABASE_TEST_SERVICE_KEY)
// or the production vars already in .env.local (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
if (!process.env.SUPABASE_TEST_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Set SUPABASE_TEST_URL or NEXT_PUBLIC_SUPABASE_URL for integration tests.')
}
if (!process.env.SUPABASE_TEST_SERVICE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_TEST_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY for integration tests.')
}
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required for integration tests.')
}
