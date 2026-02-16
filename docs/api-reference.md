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

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 404 | Resource not found or not accessible |
| 422 | Validation error (details in response) |
| 500 | Server error |
