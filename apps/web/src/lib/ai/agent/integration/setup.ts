// Global setup — validates required env vars before any integration test runs
if (!process.env.SUPABASE_TEST_URL) {
  throw new Error('SUPABASE_TEST_URL is required for integration tests. Set it in .env.test.local')
}
if (!process.env.SUPABASE_TEST_SERVICE_KEY) {
  throw new Error('SUPABASE_TEST_SERVICE_KEY is required for integration tests.')
}
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required for integration tests.')
}
