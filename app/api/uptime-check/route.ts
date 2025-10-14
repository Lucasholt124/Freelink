// /app/api/uptime-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    // Buscar dados de uptime das últimas 24 horas
    const result = await sql`
      SELECT
        COUNT(*) as total_checks,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_checks,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_checks,
        AVG(response_time) as avg_response_time,
        MAX(checked_at) as last_check
      FROM uptime_checks
      WHERE url = ${url}
        AND checked_at >= NOW() - INTERVAL '24 hours';
    `;

    // Buscar incidentes
    const incidentsResult = await sql`
      SELECT
        started_at as timestamp,
        EXTRACT(EPOCH FROM (ended_at - started_at)) as duration,
        reason
      FROM uptime_incidents
      WHERE url = ${url}
        AND started_at >= NOW() - INTERVAL '7 days'
      ORDER BY started_at DESC
      LIMIT 10;
    `;

    const stats = result.rows[0];
    const uptime = stats.total_checks > 0
      ? (stats.successful_checks / stats.total_checks) * 100
      : 100;

    return NextResponse.json({
      uptime,
      totalChecks: parseInt(stats.total_checks),
      successfulChecks: parseInt(stats.successful_checks),
      failedChecks: parseInt(stats.failed_checks),
      avgResponseTime: parseFloat(stats.avg_response_time || '0'),
      lastCheck: stats.last_check,
      incidents: incidentsResult.rows
    });
  } catch (error) {
    console.error('Uptime check error:', error);
    return NextResponse.json({ error: 'Failed to check uptime' }, { status: 500 });
  }
}