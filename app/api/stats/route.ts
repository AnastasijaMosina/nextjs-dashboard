import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * API Route Example: Stats Endpoint
 * 
 * This demonstrates:
 * - Creating an API route in Next.js
 * - HTTP caching headers
 * - Error handling
 * - Server-side database access
 * 
 * Called from: app/dashboard/live-stats/page.tsx (client-side)
 * 
 * 
 * File can have multiple HTTP methods (GET, POST, etc.)
 * Here we only implement GET for fetching statistics.
 * 
 * For another endpoint need to create a new file under app/api/
 * For example, app/api/invoices/route.ts for invoice-related APIs.
 */

export async function GET() {
  try {
    // Simulate data fetching from database
    // In a real app, this might aggregate data or call external APIs
    const result = await sql`
      SELECT 
        COUNT(DISTINCT customer_id) as active_users,
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM invoices
      WHERE date >= NOW() - INTERVAL '30 days'
    `;

    const stats = {
      activeUsers: Number(result.rows[0].active_users) || 0,
      totalInvoices: Number(result.rows[0].total_invoices) || 0,
      pendingCount: Number(result.rows[0].pending_count) || 0,
      lastUpdated: new Date().toISOString(),
    };

    // Return with cache headers
    // public: Can be cached by CDN
    // s-maxage=30: Cache for 30 seconds
    // stale-while-revalidate=60: Can serve stale data while revalidating
    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Cache Control Explained:
 * 
 * - public: Response can be cached by any cache (browser, CDN)
 * - s-maxage=30: Shared cache (CDN) stores for 30 seconds
 * - stale-while-revalidate=60: After 30s, serve stale data while fetching fresh
 * 
 * This means:
 * - First request: Fresh data from database
 * - Next 30s: Serve cached data (fast!)
 * - After 30s: Return cached data immediately, fetch fresh in background
 * - After 60s: Must fetch fresh before serving
 * 
 * For more aggressive caching: s-maxage=3600 (1 hour)
 * For no caching: cache: 'no-store' or 'Cache-Control': 'no-cache'
 */
