/**
 * Integration test: extraction endpoint
 *
 * Usage: npx tsx tests/scripts/test-extraction.mts
 *
 * Requires dev server running on localhost:3000
 */
import { createClient } from '@supabase/supabase-js'
import { PDFDocument, StandardFonts } from 'pdf-lib'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BASE_URL = 'http://localhost:3000'

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY)

const TEST_EMAIL = `test-extract-${Date.now()}@example.com`
const TEST_PASSWORD = 'testpassword123'

const SAMPLE_ROS_TEXT = `RETURN OF SERVICE

STATE OF TEXAS
COUNTY OF HARRIS

I, Robert James Wilson, being a duly authorized process server, do hereby certify that
I personally served Jane Elizabeth Doe with the Citation and Original Petition
on January 15, 2026 at 123 Main Street, Houston, TX 77001.

Defendant: Jane Elizabeth Doe

The manner of service was: Personal Service - delivered in person to the above named defendant.

Return filed January 20, 2026.

Process Server: Robert James Wilson
License Number: 12345`

async function generatePdf(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const lines = text.split('\n')
  let y = 750
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 10, font })
    y -= 14
  }
  return doc.save()
}

async function main() {
  console.log('--- Extraction Endpoint Integration Test ---\n')

  // 1. Create test user
  console.log('1. Creating test user...')
  const { data: userData, error: createErr } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (createErr) throw new Error(`Failed to create user: ${createErr.message}`)
  const userId = userData.user.id
  console.log(`   User created: ${userId}`)

  // 2. Sign in to get session
  console.log('2. Signing in...')
  const anonClient = createClient(SUPABASE_URL, ANON_KEY)
  const { data: session, error: signInErr } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
  if (signInErr) throw new Error(`Failed to sign in: ${signInErr.message}`)
  const accessToken = session.session!.access_token
  const refreshToken = session.session!.refresh_token
  console.log('   Signed in successfully')

  // 3. Create a case
  console.log('3. Creating case...')
  const { data: caseData, error: caseErr } = await anonClient
    .from('cases')
    .insert({
      user_id: userId,
      dispute_type: 'eviction',
      role: 'defendant',
      status: 'active',
    })
    .select()
    .single()
  if (caseErr) throw new Error(`Failed to create case: ${caseErr.message}`)
  const caseId = caseData.id
  console.log(`   Case created: ${caseId}`)

  // 4. Generate and upload a real PDF
  console.log('4. Generating and uploading test ROS PDF...')
  const pdfBytes = await generatePdf(SAMPLE_ROS_TEXT)
  const fileId = crypto.randomUUID()
  const storagePath = `cases/${caseId}/court-docs/${fileId}`

  const { error: uploadErr } = await anonClient.storage
    .from('case-documents')
    .upload(storagePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false,
    })
  if (uploadErr) throw new Error(`Failed to upload: ${uploadErr.message}`)
  console.log(`   Uploaded to: ${storagePath} (${pdfBytes.length} bytes)`)

  // 5. Insert court_documents row
  console.log('5. Creating court_documents record...')
  const { data: docData, error: docErr } = await anonClient
    .from('court_documents')
    .insert({
      case_id: caseId,
      doc_type: 'return_of_service',
      storage_path: storagePath,
      file_name: 'test-ros.pdf',
      mime_type: 'application/pdf',
      sha256: 'a'.repeat(64),
      uploaded_by: userId,
    })
    .select()
    .single()
  if (docErr) throw new Error(`Failed to create doc: ${docErr.message}`)
  const courtDocId = docData.id
  console.log(`   Court document created: ${courtDocId}`)

  // 6. Build auth cookies for the Next.js API route
  const ref = SUPABASE_URL.replace('https://', '').split('.')[0]
  const cookieBase = `sb-${ref}-auth-token`
  const sessionPayload = JSON.stringify({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: session.session!.user,
  })
  const cookieValue = `base64-${Buffer.from(sessionPayload).toString('base64')}`

  console.log('6. Calling extraction endpoint...')
  const url = `${BASE_URL}/api/cases/${caseId}/return-of-service/extract`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookieBase}=${cookieValue}`,
    },
    body: JSON.stringify({ court_document_id: courtDocId }),
  })

  const body = await res.json()
  console.log(`   Status: ${res.status}`)
  console.log(`   Response:`)
  console.log(JSON.stringify(body, null, 2))

  // 7. Verify
  console.log('\n--- Verification ---')
  if (res.status === 201) {
    const ext = body.extraction
    console.log(`   Status: ${ext.status}`)
    console.log(`   Confidence: ${ext.confidence}`)
    console.log(`   Extractor: ${ext.extractor}`)
    console.log(`   Fields:`)
    console.log(`     served_at: ${ext.fields.served_at}`)
    console.log(`     return_filed_at: ${ext.fields.return_filed_at}`)
    console.log(`     service_method: ${ext.fields.service_method}`)
    console.log(`     served_to: ${ext.fields.served_to}`)
    console.log(`     server_name: ${ext.fields.server_name}`)
    console.log(`   confirmed_by_user: ${ext.confirmed_by_user}`)

    const allFieldsPresent = ext.fields.served_at && ext.fields.service_method && ext.fields.served_to && ext.fields.server_name
    console.log(`\n   All key fields extracted: ${allFieldsPresent ? 'YES' : 'NO'}`)
    console.log(`   Confidence >= 0.6 (succeeded): ${ext.confidence >= 0.6 ? 'YES' : 'NO'}`)
    console.log(`   confirmed_by_user = false: ${ext.confirmed_by_user === false ? 'YES' : 'NO'}`)
  } else {
    console.log(`   FAILED — unexpected status ${res.status}`)
  }

  // 8. Test duplicate prevention (409) — only valid if first extraction was non-failed
  console.log('\n--- Testing duplicate prevention ---')
  const res2 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookieBase}=${cookieValue}`,
    },
    body: JSON.stringify({ court_document_id: courtDocId }),
  })
  const body2 = await res2.json()
  console.log(`   Second call status: ${res2.status} (expected 409)`)
  console.log(`   Response: ${JSON.stringify(body2)}`)
  console.log(`   Duplicate prevention: ${res2.status === 409 ? 'PASS' : 'FAIL'}`)

  // 9. Cleanup
  console.log('\n--- Cleanup ---')
  await adminClient.from('document_extractions').delete().eq('case_id', caseId)
  await adminClient.from('court_documents').delete().eq('case_id', caseId)
  await adminClient.from('task_events').delete().eq('case_id', caseId)
  await adminClient.from('deadlines').delete().eq('case_id', caseId)
  await adminClient.from('tasks').delete().eq('case_id', caseId)
  await adminClient.from('cases').delete().eq('id', caseId)
  await adminClient.storage.from('case-documents').remove([storagePath])
  await adminClient.auth.admin.deleteUser(userId)
  console.log('   Test data cleaned up')

  console.log('\n--- Done ---')
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
