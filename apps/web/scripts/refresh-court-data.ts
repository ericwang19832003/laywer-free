/**
 * refresh-court-data.ts
 *
 * Monthly script to verify and update Texas county filing requirements.
 * Uses DeepSeek (OpenAI-compatible API) to research current filing fees,
 * required documents, and clerk contact info for each county.
 *
 * USAGE:
 *   DEEPSEEK_API_KEY=your_key npx tsx apps/web/scripts/refresh-court-data.ts
 *
 * OUTPUT:
 *   Writes a proposed updated file to:
 *   packages/shared/src/courts/texas-filing-requirements.updated.ts
 *
 *   Review the diff before overwriting the original:
 *   diff packages/shared/src/courts/texas-filing-requirements.ts \
 *        packages/shared/src/courts/texas-filing-requirements.updated.ts
 *
 * GITHUB ACTIONS:
 *   This script is run by .github/workflows/refresh-court-data.yml on the
 *   first of each month. It opens a PR with the proposed changes for human
 *   review before merging.
 *
 * NOTE: DeepSeek's knowledge has a cutoff date. The script prompts the model
 * to reason about what's likely changed, but a human reviewer should spot-
 * check the top 3-5 counties against the actual clerk websites before merging.
 */

import OpenAI from 'openai'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'
const REQUIREMENTS_FILE = join(
  __dirname,
  '../../../packages/shared/src/courts/texas-filing-requirements.ts'
)
const OUTPUT_FILE = join(
  __dirname,
  '../../../packages/shared/src/courts/texas-filing-requirements.updated.ts'
)
const TODAY = new Date().toISOString().split('T')[0]

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.error('Error: DEEPSEEK_API_KEY environment variable is not set.')
    process.exit(1)
  }

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_BASE_URL })

  const currentSource = readFileSync(REQUIREMENTS_FILE, 'utf-8')

  console.log('Sending current filing requirements to DeepSeek for review...\n')

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: `You are a legal data specialist with expertise in Texas state court filing requirements.
Your task is to review and update a TypeScript data file containing Texas county court filing requirements.

Rules:
1. Update filing fees if they have changed. Texas JP court fees are typically $46–$100. County court fees are typically $250–$350. District court fees are typically $350–$420.
2. Update clerk phone numbers and websites if you have more accurate information.
3. Update the lastVerified date for each county you are confident about to "${TODAY}".
4. Do NOT change the TypeScript structure, imports, interfaces, or function signatures.
5. Do NOT add counties that are not already in the file.
6. Do NOT remove any counties.
7. If you are uncertain about a value, leave it unchanged and keep the existing lastVerified date.
8. Return ONLY the complete updated TypeScript source file — no explanation, no markdown fences, just the raw TypeScript.`,
      },
      {
        role: 'user',
        content: `Here is the current texas-filing-requirements.ts file. Please review the per-county data (filing fees, clerk websites, clerk phone numbers) and update any values you are confident are incorrect or outdated. Return the complete updated file.\n\n${currentSource}`,
      },
    ],
  })

  const updatedSource = response.choices[0]?.message?.content?.trim()
  if (!updatedSource) {
    console.error('Error: DeepSeek returned an empty response.')
    process.exit(1)
  }

  // Basic sanity check — the response should still export the main constant
  if (!updatedSource.includes('TEXAS_FILING_REQUIREMENTS')) {
    console.error(
      'Error: Updated source does not contain TEXAS_FILING_REQUIREMENTS. Aborting to prevent data loss.'
    )
    process.exit(1)
  }

  writeFileSync(OUTPUT_FILE, updatedSource, 'utf-8')

  console.log(`Updated file written to:\n  ${OUTPUT_FILE}\n`)
  console.log('Review the diff before applying:')
  console.log(
    `  diff packages/shared/src/courts/texas-filing-requirements.ts \\\n       packages/shared/src/courts/texas-filing-requirements.updated.ts\n`
  )
  console.log(
    'If the diff looks correct, apply with:\n  cp ' +
      OUTPUT_FILE +
      ' ' +
      REQUIREMENTS_FILE
  )
  console.log(
    '\nIMPORTANT: Spot-check at least 3 counties against their clerk websites before merging.'
  )

  console.log('\nUsage stats:')
  console.log(`  Prompt tokens:     ${response.usage?.prompt_tokens ?? 'N/A'}`)
  console.log(`  Completion tokens: ${response.usage?.completion_tokens ?? 'N/A'}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
