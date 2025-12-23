/**
 * Client-Side Data Fetching Example
 * 
 * This page demonstrates:
 * - Client-side API calls with useEffect
 * - Polling/real-time updates
 * - Loading and error states
 * - Calling API routes from client components
 * 
 * When to use this pattern:
 * - Real-time data updates
 * - Data that changes frequently
 * - User-specific actions
 * - Progressive enhancement
 */

'use client';

import { useState, useEffect } from 'react';
import { lusitana } from '@/app/ui/fonts';

type Stats = {
  activeUsers: number;
  totalInvoices: number;
  pendingCount: number;
  lastUpdated: string;
};

export default function LiveStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    // Function to fetch stats
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Call our API route (server-side -> api/stats/route.ts)
        const res = await fetch('/api/stats', {
          // Optional: add cache control from client
          // cache: 'no-store', // Always fresh
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setStats(data);
        setLastFetch(new Date());
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchStats();

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchStats, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array = run once on mount

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Live Statistics</h1>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold">📊 Client-Side Data Fetching Demo</p>
        <p className="mt-1">
          This page fetches data from <code>/api/stats</code> every 5 seconds using client-side JavaScript.
        </p>
        <p className="mt-1 text-xs text-blue-600">
          {lastFetch && `Last updated: ${lastFetch.toLocaleTimeString()}`}
        </p>
      </div>

      {/* Loading State */}
      {loading && !stats && (
        <div className="mt-6 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          <p className="font-semibold">❌ Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Display */}
      {stats && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      )}

      {/* Comparison Section */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h2 className={`${lusitana.className} mb-4 text-xl`}>
          Client-Side vs Server-Side Fetching
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4">
            <h3 className="font-semibold text-blue-600">✅ This Page (Client-Side)</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Updates every 5 seconds</li>
              <li>• Shows loading states</li>
              <li>• Real-time data</li>
              <li>• Not in initial HTML</li>
              <li>• Larger JS bundle</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-4">
            <h3 className="font-semibold text-green-600">✅ Dashboard (Server-Side)</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Fast initial load</li>
              <li>• SEO-friendly</li>
              <li>• Cached efficiently</li>
              <li>• In initial HTML</li>
              <li>• Zero client JS for data</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium">💡 When to use each:</p>
          <p className="mt-1">
            <strong>Client-Side:</strong> Real-time updates, user interactions, polling
          </p>
          <p className="mt-1">
            <strong>Server-Side:</strong> Initial page load, SEO, static/cached data
          </p>
        </div>
      </div>
    </div>
  );
}
