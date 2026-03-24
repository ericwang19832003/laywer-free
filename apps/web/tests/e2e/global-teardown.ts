import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const TEST_EMAIL = 'e2e-test@example.com'

async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return

  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const testUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL)

  if (testUser) {
    // Delete all test cases (cascade will clean up tasks, deadlines, etc.)
    await admin.from('cases').delete().eq('user_id', testUser.id)
    await admin.auth.admin.deleteUser(testUser.id)
  }
}

export default globalTeardown
