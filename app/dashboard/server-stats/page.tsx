/**
 * Server-Side Data Fetching Example
 * 
 * This page demonstrates:
 * - Server-side API calls in Server Components
 * - Fetching data at build time or request time
 * - Using Next.js fetch with caching options
 * - Direct database access (best practice)
 * 
 * When to use this pattern:
 * - Initial page load
 * - SEO-important content
 * - Static or infrequently changing data
 * - Protecting API keys
 */

import { Metadata } from 'next';
import { lusitana } from '@/app/ui/fonts';
import { sql } from '@vercel/postgres';

export const metadata: Metadata = {
  title: 'Server-Side Stats',
};

// Optional: Configure caching behavior
// export const revalidate = 60; // Revalidate every 60 seconds (ISR)
// export const dynamic = 'force-dynamic'; // Always fetch fresh data

async function getServerStats() {
  // Example 1: Direct database access (BEST for your own data)
  // This is what your dashboard already does - it's the best approach!
  try {
    const result = await sql`
      SELECT 
        COUNT(DISTINCT customer_id) as active_users,
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count
      FROM invoices
      WHERE date >= NOW() - INTERVAL '30 days'
    `;

    return {
      activeUsers: Number(result.rows[0].active_users) || 0,
      totalInvoices: Number(result.rows[0].total_invoices) || 0,
      pendingCount: Number(result.rows[0].pending_count) || 0,
      paidCount: Number(result.rows[0].paid_count) || 0,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch server statistics.');
  }
}

async function getExternalAPIExample() {
  // Example 2: Calling external API with caching
  // Use this when you need to call external services
  
  try {
    // Force cache (static at build time)
    const staticData = await fetch('https://api.example.com/static', {
      cache: 'force-cache' // Default for GET requests
    });

    // No caching (always fresh, dynamic)
    const dynamicData = await fetch('https://api.example.com/dynamic', {
      cache: 'no-store' // Fetch on every request
    });

    // Time-based revalidation (ISR)
    const revalidatedData = await fetch('https://api.example.com/data', {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    // With authentication headers
    const authData = await fetch('https://api.example.com/secure', {
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`, // ✅ Safe on server!
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // 5 minutes
    });

    return {
      static: await staticData.json(),
      dynamic: await dynamicData.json(),
      revalidated: await revalidatedData.json(),
      auth: await authData.json(),
    };
  } catch (error) {
    console.error('External API Error:', error);
    // Return default data or throw
    return null;
  }
}

export default async function ServerStatsPage() {
  // Fetch data on the server
  const stats = await getServerStats();
  
  // Optional: Fetch from external API
  // const externalData = await getExternalAPIExample();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Server-Side Statistics</h1>
      </div>

      <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
        <p className="font-semibold">🖥️ Server-Side Data Fetching Demo</p>
        <p className="mt-1">
          This page fetches data directly on the server before rendering. The data is included in the initial HTML.
        </p>
        <p className="mt-1 text-xs text-green-600">
          Fetched at: {new Date(stats.fetchedAt).toLocaleString()}
        </p>
      </div>

      {/* Stats Display */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Users Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last 30 days</p>
        </div>

        {/* Total Invoices Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last 30 days</p>
        </div>

        {/* Pending Count Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingCount}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Awaiting payment</p>
        </div>

        {/* Paid Count Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.paidCount}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h2 className={`${lusitana.className} mb-4 text-xl`}>
          Why Server-Side Fetching?
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4">
            <h3 className="font-semibold text-green-600">✅ Advantages</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• ⚡ Faster initial load (no client fetch)</li>
              <li>• 🔍 SEO-friendly (content in HTML)</li>
              <li>• 🔒 Secure (API keys on server)</li>
              <li>• 📦 Smaller JS bundle</li>
              <li>• 💰 Better caching options</li>
              <li>• 🎯 Simpler code (no loading states)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-4">
            <h3 className="font-semibold text-orange-600">⚠️ Considerations</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Data is static after render</li>
              <li>• No real-time updates</li>
              <li>• Slower TTFB for dynamic routes</li>
              <li>• Can't update without page refresh</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-700">💡 Best Practice in This Project</h3>
          <p className="mt-2 text-sm text-blue-900">
            Your dashboard already uses the <strong>best approach</strong>: Direct database access in Server Components.
            This page demonstrates that pattern. You should:
          </p>
          <ol className="mt-2 space-y-1 text-sm text-blue-900">
            <li>1. ✅ Use Server Components + direct DB calls (like this page)</li>
            <li>2. ⚠️ Skip API routes for your own data (unnecessary extra hop)</li>
            <li>3. 🎯 Use API routes only to protect external API keys</li>
            <li>4. 🔄 Use Client Components only for interactivity</li>
          </ol>
        </div>
      </div>

      {/* Code Examples Section */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h2 className={`${lusitana.className} mb-4 text-xl`}>
          Fetch Options Reference
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4">
            <h3 className="font-mono text-sm font-semibold text-gray-700">
              cache: 'force-cache' <span className="text-xs text-gray-500">(default)</span>
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Static at build time. Use for data that rarely changes.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <h3 className="font-mono text-sm font-semibold text-gray-700">
              cache: 'no-store'
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Always fresh. Fetch on every request. Use for real-time data.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <h3 className="font-mono text-sm font-semibold text-gray-700">
              next: &#123; revalidate: 60 &#125;
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ISR (Incremental Static Regeneration). Revalidate every 60 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
