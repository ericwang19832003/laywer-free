import { NextResponse } from 'next/server'
// DEPRECATED: OAuth flow replaced by MCP integration.
export function GET() { return NextResponse.json({ error: 'Deprecated' }, { status: 410 }) }
export function POST() { return NextResponse.json({ error: 'Deprecated' }, { status: 410 }) }
