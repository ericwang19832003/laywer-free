# Gmail Email Integration Design

## Problem

Self-represented litigants receive emails from opposing counsel that require careful, measured responses. Users currently handle this entirely outside the app — reading emails in Gmail, trying to figure out what to say, and risking saying something that hurts their case. There's no connection between their case data and their email communication.

## Solution

Add Gmail integration that lets users:
1. Configure a Gmail MCP server (handles authentication externally)
2. Add opposing counsel's email address(es) per case
3. View filtered emails from opposing counsel within each case
4. Get AI-drafted reply suggestions informed by case context
5. Copy the draft and send from their own Gmail

## Architecture

### MCP-Based Gmail Access

**Model Context Protocol (MCP)** replaces custom OAuth. The app connects to an external Gmail MCP server that handles authentication and token management independently.

**Setup:**
1. Install a Gmail MCP server (e.g., `@anthropic-ai/mcp-server-gmail`)
2. Run its setup to authenticate with Google (one-time)
3. Set `GMAIL_MCP_COMMAND` and `GMAIL_MCP_ARGS` in `.env.local`

**Benefits over custom OAuth:**
- No Google Cloud project creation required
- No token encryption/storage in our database
- No OAuth callback routes
- MCP server handles token refresh automatically
- Standardized protocol — swap MCP servers without app changes

**Connection:** The app spawns the MCP server as a subprocess and communicates via stdio. A singleton client persists across requests.

### Per-Case Email Filters

Users manually add opposing counsel's email address(es) per case.

**Table: `case_email_filters`**
```sql
case_email_filters (
  id uuid PK DEFAULT gen_random_uuid(),
  case_id uuid FK → cases NOT NULL,
  email_address text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
)
```

RLS: Joins through `cases.user_id = auth.uid()`.

### Email Fetching

- **Live via MCP** — no local storage of email content
- When user opens Emails tab, server calls MCP `gmail_search_messages` with `from:addr1 OR from:addr2`
- Paginated, newest first, returns subject/snippet/date/from
- Click to fetch full email body + thread via MCP `gmail_read_thread`

### AI Reply Suggestions

When user clicks "Draft Reply":
1. Fetch full email thread via MCP `gmail_read_thread`
2. Load case context (dispute type, role, status, key facts)
3. Send to Claude with legal-assistant system prompt
4. Return editable draft with copy-to-clipboard
5. Warning banner: "AI-generated — review before sending"

**Prompt guidelines:**
- Professional, measured tone
- Never admit liability or make concessions
- Reference relevant case facts/dates
- Flag anything requiring attorney consultation
- Include disclaimer

**Rate limit:** 10 AI reply drafts per hour per user.

**No email content persisted** — only audit log entry: "reply suggestion generated for email [subject]"

### API Endpoints

```
GET  /api/gmail/status         → Check MCP connection status

GET  /api/cases/[id]/emails              → Fetch filtered emails via MCP
GET  /api/cases/[id]/emails/[messageId]  → Fetch full email + thread via MCP
POST /api/cases/[id]/emails/[messageId]/draft-reply → Generate AI reply

POST   /api/cases/[id]/email-filters     → Add email filter
DELETE /api/cases/[id]/email-filters/[id] → Remove email filter
GET    /api/cases/[id]/email-filters     → List filters
```

### UI Components

**Settings Page — "Connected Services" section:**
- Gmail MCP status card (connected/error/not configured)
- Connected email address display
- Setup instructions when not configured

**Case Emails Tab (`/case/[id]/emails`):**
- Not-configured state: prompt with setup instructions
- No-filters state: form to add opposing counsel email
- Email list: sender, subject, date, snippet (Card-based rows)
- Email detail: full body, thread view
- Reply draft: editable textarea + "Copy" + "Regenerate" buttons
- Warning banner on all AI-generated content

**Design system:** Uses existing `warm-*`/`calm-*` palette, Card/CardContent components, Button variants.

## Environment Variables

```env
GMAIL_MCP_COMMAND=npx                        # Command to run Gmail MCP server
GMAIL_MCP_ARGS=-y,@anthropic-ai/mcp-server-gmail  # Comma-separated args
ANTHROPIC_API_KEY=...                         # For AI reply generation
```

## Security Considerations

- **Read-only access**: MCP server configured with `gmail.readonly` scope
- **External auth**: No tokens stored in our database — MCP server manages credentials
- **RLS enforcement**: Users can only access their own case filters
- **No email storage**: Email content fetched live via MCP, never persisted
- **Audit logging**: All AI reply generations logged for accountability
- **Rate limiting**: Prevents abuse of AI endpoints (10/hour)
- **Singleton connection**: MCP server process managed as a singleton per Node.js process

## Out of Scope (Future)

- Sending emails through the app
- Creating Gmail drafts via MCP
- Outlook/Microsoft email integration
- Auto-detection of case-related emails
- Email notifications/push alerts for new emails
- Storing email content locally for offline access
