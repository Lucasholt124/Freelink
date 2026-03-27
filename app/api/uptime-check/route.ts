import { NextRequest, NextResponse } from 'next/server';

// Uptime check is currently disabled (Postgres removed).
// Returns a healthy default response.
export async function POST(_req: NextRequest) {
  try {
    return NextResponse.json({
      uptime: 100,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      avgResponseTime: 0,
      lastCheck: null,
      incidents: [],
    });
  } catch (error) {
    console.error('Uptime check error:', error);
    return NextResponse.json({ error: 'Failed to check uptime' }, { status: 500 });
  }
}