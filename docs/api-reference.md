# API Reference

All endpoints require authentication via Supabase session cookie. Returns 401 if not authenticated.

## Cases

### POST /api/cases

Create a new case.

**Request:**
```json
{
  "role": "plaintiff",
  "county": "Travis",
  "court_type": "district",
  "dispute_type": "landlord dispute"
}
```

Only `role` is required. `court_type` defaults to "unknown".

**Response (201):**
```json
{
  "case": { "id": "uuid", "role": "plaintiff", "..." : "..." },
  "tasks": [
    { "id": "uuid", "task_key": "welcome", "status": "todo", "..." : "..." },
    { "id": "uuid", "task_key": "intake", "status": "locked", "..." : "..." }
  ]
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"role":"plaintiff","county":"Travis"}'
```

### GET /api/cases

List user's active cases.

**Response:**
```json
{
  "cases": [
    { "id": "uuid", "role": "plaintiff", "county": "Travis", "..." : "..." }
  ]
}
```

## Dashboard

### GET /api/cases/:id/dashboard

Get case dashboard data.

**Response:**
```json
{
  "next_task": { "id": "uuid", "task_key": "intake", "title": "Tell Us About Your Case", "..." : "..." },
  "tasks_summary": { "completed": 1, "locked": 2, "todo": 1 },
  "upcoming_deadlines": [],
  "recent_events": [
    { "id": "uuid", "kind": "task_status_changed", "payload": {}, "..." : "..." }
  ]
}
```

## Tasks

### PATCH /api/tasks/:id

Update task status.

**Request:**
```json
{
  "status": "completed",
  "metadata": { "county": "Travis" }
}
```

Valid transitions: todo→in_progress, todo→skipped, in_progress→needs_review, in_progress→completed, in_progress→skipped, needs_review→completed, needs_review→in_progress, skipped→todo

**Response:**
```json
{
  "task": { "id": "uuid", "status": "completed", "completed_at": "...", "..." : "..." }
}
```

## Timeline

### POST /api/cases/:id/events

Create a timeline event.

**Request:**
```json
{
  "kind": "note_added",
  "payload": { "text": "Called the clerk" },
  "task_id": "uuid (optional)"
}
```

### GET /api/cases/:id/timeline

Paginated timeline events.

**Query params:** `cursor` (ISO timestamp), `limit` (default 20, max 50)

**Response:**
```json
{
  "events": [],
  "next_cursor": "2026-01-15T10:30:00Z",
  "has_more": true
}
```

### GET /api/cases/:id/timeline/export

Export full timeline as JSON.

**Response:**
```json
{
  "case_id": "uuid",
  "exported_at": "2026-02-15T00:00:00Z",
  "events": []
}
```

## Deadlines

### POST /api/cases/:id/deadlines

Create a deadline with auto-generated reminders.

**Request:**
```json
{
  "key": "answer_deadline",
  "due_at": "2026-03-15T17:00:00Z",
  "source": "court_notice",
  "rationale": "20 days from service date"
}
```

**Response (201):**
```json
{
  "deadline": { "id": "uuid", "..." : "..." },
  "reminders": [
    { "id": "uuid", "send_at": "2026-03-08T17:00:00Z", "status": "scheduled" },
    { "id": "uuid", "send_at": "2026-03-12T17:00:00Z", "status": "scheduled" },
    { "id": "uuid", "send_at": "2026-03-14T17:00:00Z", "status": "scheduled" }
  ]
}
```

### GET /api/cases/:id/deadlines

List deadlines with reminders.

**Response:**
```json
{
  "deadlines": [
    {
      "id": "uuid",
      "key": "answer_deadline",
      "due_at": "...",
      "reminders": []
    }
  ]
}
```

## Discovery Packs

### POST /api/cases/:caseId/discovery/packs

Create a new discovery pack.

**Request:**
```json
{
  "title": "First Set of Interrogatories"
}
```

`title` is optional (defaults to "Untitled Discovery Pack").

**Response (201):**
```json
{
  "pack": { "id": "uuid", "case_id": "uuid", "title": "First Set of Interrogatories", "status": "draft", "..." : "..." }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/cases/{caseId}/discovery/packs \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"title":"First Set of Interrogatories"}'
```

### GET /api/cases/:caseId/discovery/packs

List all discovery packs for a case.

**Response:**
```json
{
  "packs": [
    { "id": "uuid", "title": "...", "status": "draft", "created_at": "..." }
  ]
}
```

**curl:**
```bash
curl http://localhost:3000/api/cases/{caseId}/discovery/packs \
  -H "Cookie: sb-access-token=..."
```

### GET /api/discovery/packs/:packId

Get pack detail with items, service logs, and responses.

**Response:**
```json
{
  "pack": { "id": "uuid", "title": "...", "status": "draft", "..." : "..." },
  "items": [
    { "id": "uuid", "item_type": "rog", "item_no": 1, "prompt_text": "...", "generated_text": "...", "status": "draft" }
  ],
  "service_logs": [],
  "responses": []
}
```

**curl:**
```bash
curl http://localhost:3000/api/discovery/packs/{packId} \
  -H "Cookie: sb-access-token=..."
```

### POST /api/discovery/packs/:packId/items

Add a discovery item. `item_no` is auto-generated per type.

**Request:**
```json
{
  "item_type": "rog",
  "prompt_text": "State your full legal name and all aliases."
}
```

`item_type` must be one of: `rfp` (Request for Production), `rog` (Interrogatory), `rfa` (Request for Admission).

**Response (201):**
```json
{
  "item": {
    "id": "uuid",
    "item_type": "rog",
    "item_no": 1,
    "prompt_text": "State your full legal name and all aliases.",
    "generated_text": "INTERROGATORY NO. 1\n\nPursuant to...",
    "status": "draft"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/discovery/packs/{packId}/items \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"item_type":"rog","prompt_text":"State your full legal name and all aliases."}'
```

### PATCH /api/discovery/packs/:packId/status

Update pack status. Valid transitions: `draft` → `ready` → `served` → `responses_pending` → `complete`.

**Request:**
```json
{
  "status": "ready"
}
```

**Response:**
```json
{
  "pack": { "id": "uuid", "status": "ready", "..." : "..." }
}
```

**curl:**
```bash
curl -X PATCH http://localhost:3000/api/discovery/packs/{packId}/status \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"status":"ready"}'
```

### POST /api/discovery/packs/:packId/serve

Record service of discovery pack.

**Request:**
```json
{
  "served_at": "2025-06-15T10:00:00Z",
  "service_method": "certified_mail",
  "served_to_name": "Jane Doe, Esq.",
  "served_to_email": "jane@lawfirm.com",
  "served_to_address": "123 Main St, Austin, TX 78701",
  "notes": "Sent via certified mail with return receipt"
}
```

Only `served_at` and `service_method` are required.

**Response (201):**
```json
{
  "service_log": { "id": "uuid", "served_at": "...", "service_method": "certified_mail", "..." : "..." }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/discovery/packs/{packId}/serve \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"served_at":"2025-06-15T10:00:00Z","service_method":"email","served_to_name":"Jane Doe"}'
```

### POST /api/discovery/packs/:packId/responses

Upload a discovery response file. Uses `multipart/form-data`.

**Form fields:**
- `file` (required) — the response document (PDF, JPEG, PNG, TIFF, DOC, DOCX; max 25MB)
- `response_type` (required) — e.g. "answer", "objection", "partial"
- `received_at` (optional) — ISO datetime, defaults to now
- `notes` (optional)

File is uploaded to Supabase Storage at `cases/{caseId}/discovery/{packId}/responses/{uuid}`. SHA256 is computed server-side.

**Response (201):**
```json
{
  "response": {
    "id": "uuid",
    "response_type": "answer",
    "file_name": "responses.pdf",
    "storage_path": "cases/.../responses/...",
    "sha256": "a1b2c3...",
    "..." : "..."
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/discovery/packs/{packId}/responses \
  -H "Cookie: sb-access-token=..." \
  -F "file=@/path/to/response.pdf" \
  -F "response_type=answer" \
  -F "received_at=2025-07-01T09:00:00Z" \
  -F "notes=Full response received"
```

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 404 | Resource not found or not accessible |
| 409 | Invalid state transition or conflict |
| 422 | Validation error (details in response) |
| 500 | Server error |
