# Gmail Email Integration Design

## Problem

Self-represented litigants receive emails from opposing counsel that require careful, measured responses. Users currently handle this entirely outside the app — reading emails in Gmail, trying to figure out what to say, and risking saying something that hurts their case. There's no connection between their case data and their email communication.

## Solution

Add Gmail integration that lets users:
1. Connect their Gmail account (read-only OAuth)
2. Add opposing counsel's email address(es) per case
3. View filtered emails from opposing counsel within each case
4. Get AI-drafted reply suggestions informed by case context
5. Copy the draft and send from their own Gmail

## Architecture

### OAuth & Token Storage

**Google OAuth 2.0 flow:**
1. User clicks "Connect Gmail" on Settings page
2. Redirect to Google OAuth consent screen with `gmail.readonly` scope
3. Google redirects to `/api/auth/google/callback` with authorization code
4. Server exchanges code for access + refresh tokens
5. Tokens encrypted and stored in `connected_accounts` table
6. Access tokens auto-refreshed when expired

**New table: `connected_accounts`**
```sql
connected_accounts (
  id uuid PK DEFAULT gen_random_uuid(),
  user_id uuid FK → auth.users NOT NULL,
  provider text NOT NULL CHECK (provider IN ('gmail')),
  email text NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scopes text[] NOT NULL,
  connected_at timestamptz DEFAULT now(),
  revoked_at timestamptz NULL
)
```

RLS: `user_id = auth.uid()`. Tokens encrypted with AES-256 using server-side `ENCRYPTION_KEY` env var. Tokens never exposed to the client.

### Per-Case Email Filters

Users manually add opposing counsel's email address(es) per case.

**New table: `case_email_filters`**
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

- **Live from Gmail API** — no local storage of email content
- When user opens Emails tab, server queries Gmail API: `from:addr1 OR from:addr2`
- Paginated, newest first, returns subject/snippet/date/from
- Click to fetch full email body + thread
- 5-minute client-side cache for list performance

### AI Reply Suggestions

When user clicks "Draft Reply":
1. Fetch full email thread from Gmail API
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
GET  /api/auth/google          → Initiate OAuth flow (redirect to Google)
GET  /api/auth/google/callback → Handle OAuth callback, store tokens
DELETE /api/auth/google        → Disconnect Gmail (revoke + set revoked_at)

GET  /api/gmail/status         → Check connection status

GET  /api/cases/[id]/emails              → Fetch filtered emails from Gmail
GET  /api/cases/[id]/emails/[messageId]  → Fetch full email + thread
POST /api/cases/[id]/emails/[messageId]/draft-reply → Generate AI reply

POST   /api/cases/[id]/email-filters     → Add email filter
DELETE /api/cases/[id]/email-filters/[id] → Remove email filter
GET    /api/cases/[id]/email-filters     → List filters
```

### UI Components

**Settings Page — "Connected Services" section:**
- Gmail connection card showing status
- "Connect Gmail" / "Disconnect" buttons
- Connected email address display

**Case Emails Tab (`/case/[id]/emails`):**
- Not-connected state: prompt to connect in settings
- No-filters state: form to add opposing counsel email
- Email list: sender, subject, date, snippet (Card-based rows)
- Email detail: full body (sanitized HTML), thread view
- Reply draft: editable textarea + "Copy" + "Regenerate" buttons
- Warning banner on all AI-generated content

**Design system:** Uses existing `warm-*`/`calm-*` palette, Card/CardContent components, Button variants.

## Environment Variables

```env
GOOGLE_CLIENT_ID=...              # Google OAuth client ID
GOOGLE_CLIENT_SECRET=...          # Google OAuth client secret
GOOGLE_REDIRECT_URI=...           # OAuth callback URL
ENCRYPTION_KEY=...                # AES-256 key for token encryption
```

## Security Considerations

- **Minimal scope**: `gmail.readonly` only — cannot send, delete, or modify emails
- **Encrypted tokens**: AES-256 encryption at rest, never exposed to client
- **RLS enforcement**: Users can only access their own connected accounts and case filters
- **No email storage**: Email content fetched live, never persisted in our database
- **Audit logging**: All AI reply generations logged for accountability
- **Rate limiting**: Prevents abuse of Gmail API and AI endpoints
- **Token refresh**: Automatic refresh before expiry, graceful handling of revoked tokens
- **Sanitized HTML**: Email body HTML sanitized before rendering to prevent XSS

## Out of Scope (Future)

- Sending emails through the app (requires `gmail.send` scope)
- Creating Gmail drafts (requires `gmail.compose` scope)
- Outlook/Microsoft email integration
- Auto-detection of case-related emails
- Email notifications/push alerts for new emails
- Storing email content locally for offline access
