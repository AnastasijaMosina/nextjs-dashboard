# 📚 Next.js Complete Reference Guide

> A comprehensive guide to Next.js features, concepts, and best practices based on the dashboard learning project.

**Last Updated:** November 24, 2025  
**Next.js Version:** 15.0.0  
**React Version:** 19.0.0-rc

---

## 📑 Table of Contents

1. [App Router Architecture](#app-router-architecture)
2. [Routing & Navigation](#routing--navigation)
3. [Rendering Strategies](#rendering-strategies)
4. [Data Fetching](#data-fetching)
5. [API Calls: Client vs Server](#api-calls-client-vs-server)
6. [Caching Strategies](#caching-strategies)
7. [Server vs Client Components](#server-vs-client-components)
8. [Server Actions](#server-actions)
9. [Streaming & Suspense](#streaming--suspense)
10. [Error Handling](#error-handling)
11. [Authentication & Middleware](#authentication--middleware)
12. [Authorization & Access Control](#authorization--access-control)
13. [Form Validation](#form-validation)
14. [Optimization](#optimization)
15. [Best Practices](#best-practices)

---

## 1. App Router Architecture

### 📂 File-System Based Routing

Next.js uses a file-system based router where folders define routes.

#### **Special Files**

| File | Purpose | Required | Must be |
|------|---------|----------|---------|
| `layout.tsx` | Shared UI for route segment | ✅ Root only | Server Component |
| `page.tsx` | Route's unique UI | ✅ For route | Server/Client |
| `loading.tsx` | Loading UI with Suspense | ❌ | Server Component |
| `error.tsx` | Error boundary UI | ❌ | **Client Component** |
| `not-found.tsx` | 404 UI | ❌ | Server Component |
| `route.ts` | API endpoint | ❌ | Server only |

#### **File Structure Example**
```
app/
├── layout.tsx              # Root layout (wraps entire app)
├── page.tsx                # Home page (/)
├── dashboard/
│   ├── layout.tsx          # Dashboard layout (/dashboard/*)
│   ├── (overview)/         # Route group (doesn't affect URL)
│   │   ├── page.tsx        # /dashboard
│   │   └── loading.tsx     # Loading state
│   ├── customers/
│   │   └── page.tsx        # /dashboard/customers
│   └── invoices/
│       ├── page.tsx        # /dashboard/invoices
│       ├── error.tsx       # Error boundary
│       ├── [id]/           # Dynamic route
│       │   └── edit/
│       │       ├── page.tsx       # /dashboard/invoices/123/edit
│       │       └── not-found.tsx  # Custom 404
│       └── create/
│           └── page.tsx    # /dashboard/invoices/create
└── login/
    └── page.tsx            # /login
```

**Project Location:** `app/` directory

### 🎯 Layouts

#### **Root Layout (Required)**
```tsx
// app/layout.tsx
import '@/app/ui/global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

✅ **Characteristics:**
- Must have `<html>` and `<body>` tags
- Wraps entire application
- Perfect for global styles, fonts, metadata
- Cannot be a Client Component

#### **Nested Layouts**
```tsx
// app/dashboard/layout.tsx
import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <SideNav /> {/* Shared navigation */}
      <div className="flex-grow">{children}</div>
    </div>
  );
}
```

✅ **Benefits:**
- Shared UI across multiple pages
- Preserves state on navigation
- Doesn't re-render on route change

**Project Location:** `app/layout.tsx`, `app/dashboard/layout.tsx`

### 🔄 Route Groups

Use parentheses `()` to organize routes without affecting URL structure.

```
app/dashboard/
├── (overview)/       # Route group
│   └── page.tsx      # URL: /dashboard
├── customers/
│   └── page.tsx      # URL: /dashboard/customers
```

✅ **Use Cases:**
- Organize routes logically
- Apply different layouts to route segments
- Keep URLs clean

**Project Location:** `app/dashboard/(overview)/`

---

## 2. Routing & Navigation

### 🔗 Link Component

Client-side navigation without full page reload.

```tsx
import Link from 'next/link';

<Link href="/dashboard/invoices">
  Invoices
</Link>
```

✅ **Advantages:**
- Automatic code splitting
- Prefetching in production
- Client-side navigation
- Preserves React state

❌ **Don't use `<a>` tags** for internal navigation - causes full page reload!

**Project Location:** `app/ui/dashboard/nav-links.tsx`

### 📍 Dynamic Routes

Use square brackets `[param]` for dynamic segments.

```tsx
// app/dashboard/invoices/[id]/edit/page.tsx
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id; // Get dynamic ID from URL
  
  const invoice = await fetchInvoiceById(id);
  return <EditForm invoice={invoice} />;
}
```

**URL Pattern:** `/dashboard/invoices/123/edit` → `id = "123"`

**Project Location:** `app/dashboard/invoices/[id]/edit/page.tsx`

### 🔍 Search Params

#### **Server Component** (Props)
```tsx
// Page receives searchParams as props
export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  
  // Use query and currentPage for data fetching
}
```

**URL:** `/invoices?query=john&page=2`  
**Result:** `query = "john"`, `currentPage = 2`

**Project Location:** `app/dashboard/invoices/page.tsx`

#### **Client Component** (Hooks)
```tsx
'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  };
}
```

✅ **Benefits:**
- URL-based state management
- Shareable URLs
- Browser back/forward support
- No state management library needed

**Project Location:** `app/ui/search.tsx`

### 🧭 Navigation Hooks (Client Only)

| Hook | Purpose | Returns |
|------|---------|---------|
| `usePathname()` | Get current path | `/dashboard/invoices` |
| `useSearchParams()` | Read URL params | `URLSearchParams` object |
| `useRouter()` | Programmatic navigation | `{ push, replace, refresh }` |
| `useParams()` | Read dynamic route params | `{ id: "123" }` |

---

## 3. Rendering Strategies

### 🏗️ Static Rendering (SSG)

**Default behavior** - Pages are pre-rendered at build time.

```tsx
// Automatically static - no dynamic functions
export default async function Page() {
  return <div>Static Content</div>;
}
```

✅ **Advantages:**
- ⚡ Lightning fast (CDN caching)
- 💰 Cost-effective (no server computation)
- 🔍 Best for SEO
- 📉 Reduced server load

❌ **Disadvantages:**
- 📅 Data is stale until next build
- ❌ No personalization
- 🔄 Requires rebuild for updates

🎯 **Best For:**
- Marketing pages
- Blog posts
- Documentation
- Product listings (if not frequently updated)

**Project Example:** Home page (`app/page.tsx`)

### ⚡ Dynamic Rendering (SSR)

Triggered automatically when using dynamic functions or data fetching.

```tsx
// Dynamic due to searchParams
export default async function Page(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams; // 👈 Makes it dynamic
  const data = await fetchData(searchParams?.query);
  return <div>{data}</div>;
}
```

#### **What Makes a Route Dynamic?**

| Trigger | Example |
|---------|---------|
| `searchParams` | Reading URL parameters |
| `cookies()` | Accessing cookies |
| `headers()` | Reading request headers |
| Uncached `fetch()` | `fetch(url, { cache: 'no-store' })` |
| Dynamic functions | `notFound()`, `redirect()` |

✅ **Advantages:**
- 🔄 Always fresh data
- 👤 Personalized content
- 🔐 User-specific data
- 🎯 Real-time updates

❌ **Disadvantages:**
- 🐌 Slower TTFB (Time To First Byte)
- 💻 Server resources required
- 💸 Higher hosting costs

🎯 **Best For:**
- User dashboards
- Search results
- Shopping carts
- Real-time data

**Project Example:** Invoices page (`app/dashboard/invoices/page.tsx`)

### 🌟 Partial Prerendering (PPR)

**Experimental** - Combines static shell with dynamic content.

```tsx
// Static shell prerendered, dynamic parts streamed
export default function Dashboard() {
  return (
    <div>
      {/* ✅ Static: Prerendered */}
      <header>Dashboard</header>
      <nav>Navigation</nav>
      
      {/* 🔄 Dynamic: Streamed */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

✅ **Best of Both Worlds:**
- ⚡ Fast initial load (static shell)
- 🔄 Fresh dynamic data
- 🎯 Granular control
- 📊 Better Core Web Vitals

**Project Example:** Dashboard overview (`app/dashboard/(overview)/page.tsx`)

### 📊 Strategy Comparison

| Feature | Static (SSG) | Dynamic (SSR) | Partial (PPR) |
|---------|--------------|---------------|---------------|
| **Speed** | 🏎️ Fastest | 🐌 Slowest | ⚡ Fast initial |
| **Data Freshness** | 📅 Build-time | 🔄 Real-time | 🎯 Mixed |
| **Personalization** | ❌ None | ✅ Full | 🎯 Selective |
| **Cost** | 💰 Lowest | 💸 Highest | 💵 Medium |
| **SEO** | 🔍 Perfect | 🔍 Good | 🔍 Perfect |

---

## 4. Data Fetching

### 🎣 Server Components (Default)

Fetch data directly in Server Components using `async/await`.

```tsx
// Server Component - can be async
import { fetchRevenue } from '@/app/lib/data';

export default async function RevenueChart() {
  const revenue = await fetchRevenue(); // Direct database access
  
  return <Chart data={revenue} />;
}
```

✅ **Advantages:**
- 🔒 Secure (credentials stay on server)
- ⚡ Direct database access
- 📦 Smaller JavaScript bundle
- 🚀 Better performance

**Project Location:** `app/ui/dashboard/revenue-chart.tsx`

### 🔄 Data Fetching Patterns

#### **Sequential (Waterfall)** ❌
```tsx
// Bad: Each request waits for previous
export default async function Page() {
  const revenue = await fetchRevenue();    // Wait...
  const invoices = await fetchInvoices();  // Wait...
  const customers = await fetchCustomers(); // Wait...
}
```

⏱️ **Total Time:** 3 seconds (1s + 1s + 1s)

#### **Parallel** ✅
```tsx
// Good: All requests start simultaneously
export default async function Page() {
  const [revenue, invoices, customers] = await Promise.all([
    fetchRevenue(),
    fetchInvoices(),
    fetchCustomers(),
  ]);
}
```

⏱️ **Total Time:** 1 second (max of all requests)

**Project Location:** `app/dashboard/invoices/[id]/edit/page.tsx`

#### **Streaming with Suspense** ✅✅
```tsx
// Best: Progressive rendering
export default function Page() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Revenue />  {/* Renders when ready */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Invoices /> {/* Renders independently */}
      </Suspense>
    </>
  );
}
```

⏱️ **User Experience:** Instant shell → Progressive content

**Project Location:** `app/dashboard/(overview)/page.tsx`

### 🔄 Revalidation

#### **Cache Management**

```tsx
import { revalidatePath } from 'next/cache';

export async function createInvoice(formData: FormData) {
  await sql`INSERT INTO invoices ...`;
  
  // Refresh cached data for this path
  revalidatePath('/dashboard/invoices');
  
  // Optional: revalidate multiple paths
  // revalidatePath('/dashboard');
  // revalidatePath('/dashboard/invoices', 'layout'); // Revalidate layout
}
```

🎯 **Use Cases:**
- After creating/updating/deleting data
- Refresh current page with new data
- Clear cache without navigation

**Project Location:** `app/lib/actions.ts`

#### **Time-Based Revalidation**

```tsx
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

---

## 5. API Calls: Client vs Server

> **Key Question:** Should you call an API endpoint from the server-side or client-side?
> 
> **Short Answer:** Default to **server-side** unless you need client-side interactivity.

### 🎯 Decision Tree

```
Need to fetch data from an API?
│
├─ For initial page load? ────────────────→ SERVER-SIDE ✅
├─ For SEO (needs to be in HTML)? ────────→ SERVER-SIDE ✅
├─ Using sensitive API keys? ─────────────→ SERVER-SIDE ✅
├─ After user interaction (click/type)? ──→ CLIENT-SIDE 🎯
├─ Real-time updates (polling)? ──────────→ CLIENT-SIDE 🎯
├─ Dependent on client state? ────────────→ CLIENT-SIDE 🎯
└─ Static data that rarely changes? ──────→ SERVER-SIDE ✅
```

### 🖥️ Server-Side API Calls

**Fetch data on the server** - Default and recommended approach.

#### **When to Use:**
- ✅ Initial page load
- ✅ SEO-critical content
- ✅ Sensitive API keys/credentials
- ✅ Database queries
- ✅ Heavy computation
- ✅ Data aggregation

#### **How to Implement:**

```tsx
// app/dashboard/stats/page.tsx (Server Component)
export default async function StatsPage() {
  // Fetch from external API on the server
  const res = await fetch('https://api.example.com/stats', {
    next: { revalidate: 60 } // Cache for 60 seconds
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  const data = await res.json();
  
  return (
    <div>
      <h1>Statistics</h1>
      <p>Total: {data.total}</p>
    </div>
  );
}
```

#### **Fetch Options for Server Components:**

```tsx
// 1. Force cache (default for GET requests)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache' // Static at build time
});

// 2. No caching (dynamic, always fresh)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store' // Fetch on every request
});

// 3. Revalidate after time period (ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Revalidate every hour
});

// 4. With headers (API keys, auth)
const data = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`, // Safe on server!
    'Content-Type': 'application/json',
  },
});
```

#### **✅ Advantages:**

| Benefit | Description |
|---------|-------------|
| 🔒 **Security** | API keys stay on server |
| ⚡ **Performance** | Faster - no client round-trip |
| 🔍 **SEO** | Content in initial HTML |
| 📦 **Bundle Size** | No fetch code in client JS |
| 🎯 **Simplicity** | Just use `async/await` |

#### **Example: Calling Your Own API Route**

```tsx
// app/products/page.tsx (Server Component)
export default async function ProductsPage() {
  // Call your own API route from server
  const res = await fetch('http://localhost:3000/api/products', {
    next: { revalidate: 60 }
  });
  
  const products = await res.json();
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**⚠️ Note:** When calling your own API routes from Server Components, you're adding an extra hop. Consider calling the database/function directly instead:

```tsx
// ✅ Better: Skip API route, call directly
import { getProducts } from '@/app/lib/data';

export default async function ProductsPage() {
  const products = await getProducts(); // Direct function call
  return <div>{/* ... */}</div>;
}
```

### 💻 Client-Side API Calls

**Fetch data in the browser** - Use when you need interactivity.

#### **When to Use:**
- 🎯 User interactions (search, filter, paginate)
- 🔄 Real-time updates (polling, websockets)
- 📊 Data based on client state
- 🎨 Progressive enhancement
- 👤 User-specific actions

#### **Pattern 1: useEffect + fetch**

```tsx
// app/dashboard/live-stats/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function LiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/stats');
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
    
    // Optional: Poll every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Live Statistics</h2>
      <p>Active Users: {stats?.activeUsers}</p>
    </div>
  );
}
```

#### **Pattern 2: Event Handler**

```tsx
'use client';

import { useState } from 'react';

export default function SearchProducts() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async (searchTerm: string) => {
    setQuery(searchTerm);
    
    if (!searchTerm) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${searchTerm}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search products..."
      />
      
      {loading && <p>Searching...</p>}
      
      <ul>
        {results.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### **Pattern 3: Hybrid (Server + Client)**

Best approach: Initial data from server, updates from client.

```tsx
// app/products/page.tsx (Server Component)
import ProductsList from '@/app/ui/products-list';
import { getProducts } from '@/app/lib/data';

export default async function ProductsPage() {
  // Fetch initial data on server
  const initialProducts = await getProducts();
  
  return (
    <div>
      <h1>Products</h1>
      {/* Pass to Client Component */}
      <ProductsList initialData={initialProducts} />
    </div>
  );
}
```

```tsx
// app/ui/products-list.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';

export default function ProductsList({ initialData }) {
  const [products, setProducts] = useState(initialData);
  const [filter, setFilter] = useState('');
  
  // Refetch when filter changes
  useEffect(() => {
    if (!filter) {
      setProducts(initialData);
      return;
    }
    
    async function fetchFiltered() {
      const res = await fetch(`/api/products?filter=${filter}`);
      const data = await res.json();
      setProducts(data);
    }
    
    fetchFiltered();
  }, [filter, initialData]);
  
  return (
    <div>
      <input
        type="text"
        placeholder="Filter products..."
        onChange={(e) => setFilter(e.target.value)}
      />
      
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### **❌ Disadvantages:**

| Issue | Description |
|-------|-------------|
| 📦 **Bundle Size** | Adds fetch code to client JS |
| 🐌 **Slower** | Additional client→server→client round-trip |
| ❌ **No SEO** | Content not in initial HTML |
| 🔓 **Exposed** | API endpoints visible to users |
| 🐛 **More Complex** | Need loading/error states |

### 🔄 API Routes (Backend for Frontend)

Create API endpoints in Next.js for client-side fetching.

#### **How API Routing Works**

Next.js uses **file-system based routing** for API endpoints:

| File Location | URL Path | HTTP Method |
|--------------|----------|-------------|
| `app/api/stats/route.ts` | `/api/stats` | Exported function name |
| `app/api/products/route.ts` | `/api/products` | GET, POST, etc. |
| `app/api/users/[id]/route.ts` | `/api/users/123` | Dynamic parameter |

**Key Concepts:**
- **Folder structure = URL path**: `app/api/stats/route.ts` → `/api/stats`
- **HTTP methods = exported functions**: `GET()`, `POST()`, `PUT()`, `DELETE()`, `PATCH()`
- **Each `route.ts` can export multiple methods**
- **Dynamic routes**: Use `[param]` for URL parameters

#### **Basic Example**

```tsx
// app/api/stats/route.ts
import { NextResponse } from 'next/server';

// GET /api/stats
export async function GET() {
  try {
    // Fetch from external API or database
    const data = await fetch('https://external-api.com/stats', {
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}` // Safe on server!
      }
    });
    
    const stats = await data.json();
    
    // Return with cache headers
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// POST /api/stats
export async function POST(request: Request) {
  const body = await request.json();
  // Handle POST request
  return NextResponse.json({ success: true });
}
```

#### **Dynamic Routes**

```tsx
// app/api/products/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = params.id; // From URL: /api/products/123
  const product = await fetchProduct(productId);
  return NextResponse.json(product);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await deleteProduct(params.id);
  return NextResponse.json({ success: true });
}
```

#### **When to Use API Routes**

✅ **Use API routes for:**
- Proxying external APIs to hide keys
- Webhooks from external services
- Client-side data fetching endpoints
- Third-party integrations

❌ **Don't use API routes for:**
- Fetching your own database from Server Components
- (Call database functions directly instead - faster and simpler)

**Project Location:** Create in `app/api/` directory

### 📊 Comparison Table

| Aspect | Server-Side | Client-Side |
|--------|-------------|-------------|
| **Initial Load** | ✅ Faster (no client fetch) | 🐌 Slower (waterfall) |
| **SEO** | ✅ Content in HTML | ❌ Not in initial HTML |
| **Security** | ✅ Hide API keys | ⚠️ Keys exposed (use API routes) |
| **Interactivity** | ❌ Static after render | ✅ Dynamic updates |
| **Code Location** | Server Component | Client Component |
| **Bundle Size** | ✅ Zero client JS | 📦 Adds to bundle |
| **Use Case** | Initial page data | User interactions |
| **Caching** | Next.js cache | Browser cache |
| **Error Handling** | `error.tsx` boundary | Try/catch + state |

### 🎯 Real-World Examples

#### **Example 1: Dashboard Stats (Server-Side)**

```tsx
// app/dashboard/page.tsx
// ✅ Server-side: Initial load, SEO important
export default async function Dashboard() {
  const stats = await fetch('https://api.example.com/stats', {
    next: { revalidate: 300 } // Cache 5 minutes
  }).then(res => res.json());
  
  return (
    <div>
      <h1>Dashboard</h1>
      <StatsCard data={stats} />
    </div>
  );
}
```

#### **Example 2: Search (Client-Side)**

```tsx
// app/search/page.tsx
'use client';
// ✅ Client-side: User interaction, real-time
export default function SearchPage() {
  const [results, setResults] = useState([]);
  
  const handleSearch = async (query) => {
    const res = await fetch(`/api/search?q=${query}`);
    const data = await res.json();
    setResults(data);
  };
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <SearchResults results={results} />
    </div>
  );
}
```

#### **Example 3: Your Current Project Pattern**

```tsx
// ✅ Your codebase: Direct database access (best!)
// app/ui/dashboard/revenue-chart.tsx
export default async function RevenueChart() {
  const revenue = await fetchRevenue(); // Direct DB call, not API
  return <Chart data={revenue} />;
}
```

**Why this is best:**
- No unnecessary API route
- Faster (no HTTP overhead)
- Simpler code
- Direct database access

### ⚠️ Common Mistakes

#### **❌ Mistake 1: Client Component with Sensitive Keys**

```tsx
'use client';
// ❌ BAD: API key exposed in browser!
export default function Products() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('https://api.example.com/products', {
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}` // 🚨 EXPOSED!
      }
    });
  }, []);
}
```

#### **✅ Fix: Use API Route as Proxy**

```tsx
// app/api/products/route.ts (Server-side)
export async function GET() {
  const products = await fetch('https://api.example.com/products', {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}` // ✅ Safe on server
    }
  });
  return NextResponse.json(await products.json());
}

// app/products/page.tsx (Client Component)
'use client';
export default function Products() {
  useEffect(() => {
    fetch('/api/products'); // ✅ Call your API route
  }, []);
}
```

#### **❌ Mistake 2: Unnecessary API Route**

```tsx
// ❌ BAD: Extra hop for no reason
// app/api/invoices/route.ts
export async function GET() {
  const invoices = await sql`SELECT * FROM invoices`;
  return NextResponse.json(invoices);
}

// app/invoices/page.tsx (Server Component)
export default async function InvoicesPage() {
  const res = await fetch('http://localhost:3000/api/invoices');
  const invoices = await res.json();
  return <InvoicesList invoices={invoices} />;
}
```

#### **✅ Fix: Call Database Directly**

```tsx
// ✅ GOOD: Direct call, no API route needed
// app/invoices/page.tsx (Server Component)
import { fetchInvoices } from '@/app/lib/data';

export default async function InvoicesPage() {
  const invoices = await fetchInvoices(); // Direct DB call
  return <InvoicesList invoices={invoices} />;
}
```

### 📝 Best Practices Summary

1. **Default to server-side fetching** in Server Components
2. **Use client-side only for interactivity** (search, filters, real-time)
3. **Direct database access** is better than calling your own API
4. **API routes are for** protecting keys or acting as a proxy
5. **Hybrid approach** when you need both: initial server data + client updates
6. **Never expose sensitive keys** in client-side code
7. **Use proper caching** with `next: { revalidate }` on server
8. **Handle loading and error states** on client

### 🔗 Quick Reference

| Task | Approach | Code Location |
|------|----------|---------------|
| **Fetch for initial page** | Server Component | `app/page.tsx` |
| **Search as you type** | Client Component | `'use client'` + `useEffect` |
| **Protect API keys** | API Route | `app/api/*/route.ts` |
| **Database queries** | Direct function call | `app/lib/data.ts` |
| **Real-time polling** | Client Component | `setInterval` in `useEffect` |
| **External API (build time)** | Server Component | `fetch` with `cache: 'force-cache'` |
| **External API (runtime)** | Server Component | `fetch` with `cache: 'no-store'` |

---

## 6. Caching Strategies

### 🎯 What is Caching?

**Caching** is the practice of storing data in a temporary storage location (cache) so future requests for that data can be served faster. Instead of fetching data from the original source every time, you retrieve it from the cache.

#### **Why Use Caching?**

| Benefit | Description |
|---------|-------------|
| ⚡ **Performance** | Faster response times - data served from cache instead of database/API |
| 💰 **Cost Reduction** | Fewer database queries and API calls = lower costs |
| 📉 **Reduced Server Load** | Less work for servers = better scalability |
| 🌐 **Better UX** | Instant loading for users with cached data |
| 🔄 **Resilience** | Can serve stale data if backend is down |

#### **Cache Layers in Next.js**

```
User Request
    ↓
1. Browser Cache (HTTP headers)
    ↓
2. CDN Cache (Vercel Edge Network)
    ↓
3. Next.js Data Cache (Server-side)
    ↓
4. React Cache (Request Memoization)
    ↓
5. Database
```

---

### 🗄️ Next.js Data Cache

Next.js has a built-in **Data Cache** on the server that persists across requests and deployments.

#### **Default Behavior: fetch() is Cached**

```tsx
// ✅ Automatically cached by default
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  // Subsequent requests use cached data
  return <div>{JSON.stringify(data)}</div>;
}
```

#### **Cache Options**

##### **1. Force Cache (Static - Default)**
```tsx
// Cached at build time, never revalidated
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache' // Default behavior
});
```

✅ **Use for:**
- Static content that rarely changes
- Marketing pages
- Documentation
- Product catalogs

##### **2. No Store (Dynamic - Always Fresh)**
```tsx
// Never cached, fetched on every request
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});
```

✅ **Use for:**
- User-specific data
- Real-time data
- Personalized content
- Shopping carts

##### **3. Revalidate (ISR - Time-Based)**
```tsx
// Cached, but revalidated every 60 seconds
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 } // Seconds
});
```

✅ **Use for:**
- Content that updates periodically
- News feeds
- Product prices
- Stock levels

**How it works:**
1. First request: Fetch from source → Cache it
2. Next 60 seconds: Serve from cache (fast!)
3. After 60 seconds: Serve stale cache, fetch fresh data in background
4. Future requests: Serve fresh cached data

##### **4. Tags-Based Revalidation (On-Demand)**
```tsx
// Cache with a tag, revalidate when needed
const data = await fetch('https://api.example.com/products', {
  next: { tags: ['products'] }
});

// Later, in a Server Action:
import { revalidateTag } from 'next/cache';

export async function updateProduct() {
  await sql`UPDATE products ...`;
  revalidateTag('products'); // Invalidate all 'products' cache
}
```

✅ **Use for:**
- Manual cache invalidation
- When you know data changed
- CRUD operations

**Project Location:** `app/lib/actions.ts` (uses `revalidatePath`)

#### **Page-Level Revalidation**

```tsx
// app/products/page.tsx
// Revalidate entire page every 3600 seconds
export const revalidate = 3600;

export default async function ProductsPage() {
  const products = await db.product.findMany();
  return <ProductList products={products} />;
}
```

#### **Route Segment Config**

```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-static'; // Default
export const dynamic = 'force-dynamic'; // Like cache: 'no-store'
export const dynamic = 'error'; // Error if dynamic functions used
export const dynamic = 'auto'; // Smart default

export const revalidate = 60; // Time-based revalidation
export const revalidate = false; // Cache forever
```

---

### 🌐 HTTP Caching (Cache-Control Headers)

HTTP caching is browser and CDN caching controlled by headers.

#### **Cache-Control Directives**

```tsx
// app/api/products/route.ts
export async function GET() {
  const products = await db.product.findMany();
  
  return new Response(JSON.stringify(products), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}
```

#### **Common Directives**

| Directive | Meaning | Use Case |
|-----------|---------|----------|
| `public` | Can be cached by browsers and CDNs | Public data |
| `private` | Only browser cache, not CDNs | User-specific data |
| `no-cache` | Must revalidate with server before using | Always verify freshness |
| `no-store` | Never cache | Sensitive data |
| `max-age=60` | Cache for 60 seconds | Browser cache duration |
| `s-maxage=60` | CDN cache for 60 seconds | CDN cache duration |
| `stale-while-revalidate=120` | Serve stale for 120s while fetching fresh | Better UX during updates |

#### **Real-World Example**

```tsx
// app/api/stats/route.ts
export async function GET() {
  const stats = await sql`SELECT COUNT(*) FROM invoices`;
  
  return NextResponse.json(stats, {
    headers: {
      // Browser: cache 30s
      // CDN: cache 30s
      // If stale: serve cached version for 60s while fetching new
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
    }
  });
}
```

**Timeline:**
- 0-30s: Serve from cache (CDN + browser)
- 30-90s: Serve stale cache + fetch new in background
- 90s+: Must fetch fresh

**Project Location:** `app/api/stats/route.ts`

---

### 📦 React Cache (Request Memoization)

React automatically deduplicates `fetch()` requests within the same render pass.

#### **Automatic Deduplication**

```tsx
// These three identical requests are deduplicated into ONE
export default async function Page() {
  const data1 = await fetch('https://api.example.com/user/1');
  const data2 = await fetch('https://api.example.com/user/1'); // Same URL
  const data3 = await fetch('https://api.example.com/user/1'); // Same URL
  
  // Only ONE network request is made!
}
```

#### **Manual Memoization with `cache()`**

For non-fetch functions (database queries):

```tsx
import { cache } from 'react';

// Without cache: Called 3 times = 3 DB queries
export const getUser = async (id: string) => {
  return await db.user.findUnique({ where: { id } });
};

// With cache: Called 3 times = 1 DB query
export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});
```

✅ **Benefits:**
- Reduces duplicate database queries
- Automatic within single request
- No configuration needed

⚠️ **Limitations:**
- Only works within single request/render
- Cleared after request completes
- Not persisted across requests

**Project Location:** Can be used in `app/lib/data.ts`

---

### 🔄 Client-Side Caching with React Query

For client-side data fetching and caching, use **React Query** (TanStack Query).

#### **Setup**

```bash
npm install @tanstack/react-query
```

```tsx
// app/layout.tsx (or providers.tsx)
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data fresh for 60 seconds
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    },
  },
});

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### **Basic Usage**

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';

export default function Products() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'], // Cache key
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <ProductList products={data} />;
}
```

#### **Key Concepts**

| Concept | Description | Default |
|---------|-------------|---------|
| `staleTime` | How long data is considered fresh | 0 (immediately stale) |
| `gcTime` | How long unused data stays in cache | 5 minutes |
| `refetchOnMount` | Refetch when component mounts | true (if stale) |
| `refetchOnWindowFocus` | Refetch when window focused | true |
| `refetchOnReconnect` | Refetch when internet reconnects | true |

#### **Mutations (Updates)**

```tsx
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AddProduct() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (newProduct) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: 'New Product' })}>
      Add Product
    </button>
  );
}
```

#### **Optimistic Updates**

```tsx
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (updatedProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['products'] });
    
    // Snapshot previous value
    const previousProducts = queryClient.getQueryData(['products']);
    
    // Optimistically update cache
    queryClient.setQueryData(['products'], (old) => 
      old.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    
    return { previousProducts };
  },
  onError: (err, updatedProduct, context) => {
    // Rollback on error
    queryClient.setQueryData(['products'], context.previousProducts);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

---

### 📊 Caching Strategy Comparison

| Strategy | Scope | Persistence | Use Case | Freshness |
|----------|-------|-------------|----------|-----------|
| **Next.js Data Cache** | Server | Across requests/deployments | Server Components | Time-based or on-demand |
| **HTTP Cache (CDN)** | CDN/Browser | Until TTL expires | API routes, static assets | Time-based (Cache-Control) |
| **React Cache** | Server | Single request | Dedupe DB queries in same request | Request lifecycle |
| **React Query** | Client (browser) | Until tab closed | Client Components, user interactions | Configurable (staleTime) |

---

### 🎯 Choosing the Right Strategy

#### **Decision Tree**

```
Where is the data fetched?
│
├─ Server Component?
│  │
│  ├─ Static content? ──────────→ Next.js Data Cache (force-cache)
│  ├─ Updates periodically? ────→ Next.js Data Cache (revalidate: 60)
│  ├─ Real-time/user-specific? ─→ No cache (cache: 'no-store')
│  └─ Multiple same queries? ───→ React cache() function
│
└─ Client Component?
   │
   ├─ User interactions? ───────→ React Query
   ├─ Real-time polling? ───────→ React Query (refetchInterval)
   ├─ Form submissions? ────────→ React Query mutations
   └─ API endpoint? ────────────→ HTTP Cache-Control headers
```

#### **Practical Examples**

##### **Example 1: E-commerce Product Page**

```tsx
// Server Component - Product details (updates occasionally)
export default async function ProductPage({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  
  return (
    <div>
      <ProductDetails product={product} />
      <AddToCartButton productId={product.id} /> {/* Client Component */}
    </div>
  );
}
```

```tsx
// Client Component - Cart (user-specific, real-time)
'use client';
import { useQuery } from '@tanstack/react-query';

export default function Cart() {
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetch('/api/cart').then(r => r.json()),
    staleTime: 0, // Always refetch (user-specific)
    refetchOnWindowFocus: true, // Update when user returns
  });
  
  return <CartItems items={cart.items} />;
}
```

##### **Example 2: Dashboard with Real-Time Stats**

```tsx
// Server Component - Static layout
export default async function DashboardLayout() {
  const config = await fetch('https://api.example.com/config', {
    cache: 'force-cache' // Static, rarely changes
  });
  
  return (
    <div>
      <Sidebar config={config} />
      <LiveStats /> {/* Client Component */}
    </div>
  );
}
```

```tsx
// Client Component - Real-time polling
'use client';
import { useQuery } from '@tanstack/react-query';

export default function LiveStats() {
  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
    refetchInterval: 5000, // Poll every 5 seconds
  });
  
  return <StatsCards data={data} />;
}
```

##### **Example 3: Blog with Comments**

```tsx
// Server Component - Blog post (static)
export default async function BlogPost({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { 
      tags: ['posts', `post-${params.slug}`],
      revalidate: 86400 // 24 hours
    }
  });
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      <Comments postId={post.id} /> {/* Client Component */}
    </article>
  );
}

// Server Action - Revalidate when post updated
export async function updatePost(slug: string) {
  await db.post.update(...);
  revalidateTag(`post-${slug}`); // Clear specific post cache
}
```

```tsx
// Client Component - Comments (interactive)
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Comments({ postId }) {
  const queryClient = useQueryClient();
  
  const { data: comments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetch(`/api/comments?postId=${postId}`).then(r => r.json()),
    staleTime: 60 * 1000, // Fresh for 1 minute
  });
  
  const addComment = useMutation({
    mutationFn: (text) => fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ postId, text }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
  
  return (
    <div>
      {comments.map(c => <Comment key={c.id} {...c} />)}
      <AddCommentForm onSubmit={addComment.mutate} />
    </div>
  );
}
```

---

### ⚠️ Common Caching Pitfalls

#### **❌ Mistake 1: Not Invalidating Cache After Mutations**

```tsx
// ❌ BAD: Cache not updated after creating invoice
export async function createInvoice(formData: FormData) {
  await sql`INSERT INTO invoices ...`;
  redirect('/dashboard/invoices'); // Old cached data shown
}

// ✅ GOOD: Revalidate path to clear cache
export async function createInvoice(formData: FormData) {
  await sql`INSERT INTO invoices ...`;
  revalidatePath('/dashboard/invoices'); // Clear cache
  redirect('/dashboard/invoices');
}
```

#### **❌ Mistake 2: Caching User-Specific Data**

```tsx
// ❌ BAD: User data cached, might show wrong user's data
export default async function ProfilePage() {
  const user = await fetch('https://api.example.com/me', {
    next: { revalidate: 60 } // ❌ Cached across users!
  });
  return <Profile user={user} />;
}

// ✅ GOOD: Never cache user-specific data
export default async function ProfilePage() {
  const user = await fetch('https://api.example.com/me', {
    cache: 'no-store' // ✅ Always fresh
  });
  return <Profile user={user} />;
}
```

#### **❌ Mistake 3: Over-Caching Dynamic Data**

```tsx
// ❌ BAD: Stock levels cached for 1 hour (might show wrong stock)
const stock = await fetch('https://api.example.com/stock', {
  next: { revalidate: 3600 }
});

// ✅ GOOD: Real-time data with short cache or no cache
const stock = await fetch('https://api.example.com/stock', {
  next: { revalidate: 10 } // 10 seconds
});
```

#### **❌ Mistake 4: Not Using React Query for Client Fetching**

```tsx
// ❌ BAD: Manual fetch in useEffect, no caching
'use client';
export default function Products() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts);
  }, []); // Refetches on every mount, no cache
  
  return <ProductList products={products} />;
}

// ✅ GOOD: React Query with caching
'use client';
export default function Products() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // Cached for 5 minutes
  });
  
  return <ProductList products={products} />;
}
```

---

### 🛠️ Debugging Cache Issues

#### **Clear Next.js Cache**

```bash
# Delete .next folder (build cache)
rm -rf .next

# Clear data cache (development)
# In your Server Action or API route:
import { revalidatePath, revalidateTag } from 'next/cache';

revalidatePath('/'); // Clear specific path
revalidateTag('products'); // Clear specific tag
```

#### **Inspect HTTP Cache Headers**

```bash
# Check Cache-Control headers
curl -I http://localhost:3000/api/products

# Look for:
# Cache-Control: public, s-maxage=60, stale-while-revalidate=120
```

#### **React Query Devtools**

```tsx
// Install devtools
npm install @tanstack/react-query-devtools

// Add to layout
'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

### 📝 Caching Best Practices

#### **✅ Do's**

1. **Cache static content aggressively**
   ```tsx
   // Blog posts, docs, marketing pages
   cache: 'force-cache'
   ```

2. **Use time-based revalidation for semi-static data**
   ```tsx
   // Product prices, news feeds
   next: { revalidate: 300 } // 5 minutes
   ```

3. **Invalidate cache after mutations**
   ```tsx
   revalidatePath('/products');
   revalidateTag('products');
   ```

4. **Use React Query for client-side data**
   ```tsx
   // Better than useEffect + fetch
   useQuery({ queryKey: ['data'], queryFn: fetchData })
   ```

5. **Set appropriate Cache-Control headers for APIs**
   ```tsx
   'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
   ```

6. **Use React cache() for duplicate DB queries**
   ```tsx
   export const getUser = cache(async (id) => db.user.findUnique({ where: { id } }));
   ```

#### **❌ Don'ts**

1. **Don't cache user-specific data**
   ```tsx
   // Use cache: 'no-store' for user profiles, carts, dashboards
   ```

2. **Don't forget to invalidate after mutations**
   ```tsx
   // Always revalidatePath or revalidateTag after updates
   ```

3. **Don't use long cache times for real-time data**
   ```tsx
   // Stock levels, live scores: use short revalidate or no-store
   ```

4. **Don't manually manage loading states for cached data**
   ```tsx
   // Use React Query instead of useState + useEffect
   ```

5. **Don't cache sensitive data in CDN**
   ```tsx
   // Use 'Cache-Control': 'private' for sensitive data
   ```

---

### 🎓 Summary

| Type | Best For | Configuration | Persistence |
|------|----------|---------------|-------------|
| **Next.js Data Cache** | Server Components, initial load | `cache`, `revalidate` | Build + runtime |
| **HTTP Caching** | API routes, CDN | `Cache-Control` headers | Until TTL |
| **React Cache** | Dedupe DB queries | `cache()` wrapper | Single request |
| **React Query** | Client interactions | `staleTime`, `gcTime` | Browser session |

**Golden Rule:** Start with server-side caching (Next.js Data Cache), add HTTP caching for APIs, use React Query for client-side interactivity.

---

## 7. Server vs Client Components

### 🖥️ Server Components (Default)

**No directive needed** - Default in App Router.

```tsx
// Server Component (default)
import { db } from '@/lib/db';

export default async function UserList() {
  const users = await db.user.findMany(); // ✅ Direct DB access
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

✅ **Can:**
- Be `async` functions
- Access databases directly
- Use environment variables
- Import server-only modules

❌ **Cannot:**
- Use state (`useState`)
- Use effects (`useEffect`)
- Use event handlers (`onClick`)
- Use browser APIs

🎯 **Use For:**
- Data fetching
- Accessing backend resources
- Keeping sensitive information on server
- Static content

### 💻 Client Components

**Requires `'use client'` directive** at top of file.

```tsx
'use client'; // 👈 Required

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0); // ✅ Can use state
  
  return (
    <button onClick={() => setCount(count + 1)}> {/* ✅ Event handlers */}
      Count: {count}
    </button>
  );
}
```

✅ **Can:**
- Use React hooks (`useState`, `useEffect`)
- Use event handlers
- Access browser APIs (localStorage, etc.)
- Use browser-only libraries

❌ **Cannot:**
- Access database directly
- Use server-only modules
- Access environment variables (server-side)

🎯 **Use For:**
- Interactivity (forms, buttons)
- State management
- Browser APIs
- Event listeners
- Real-time features

**Project Location:** `app/ui/search.tsx`, `app/ui/invoices/create-form.tsx`

### 🎯 Component Strategy

#### **Recommended Pattern**
```tsx
// ✅ Good: Push 'use client' down to leaf components
// Page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData(); // Server data fetching
  
  return (
    <div>
      <h1>My Page</h1>
      <InteractiveButton data={data} /> {/* Client Component */}
    </div>
  );
}

// InteractiveButton.tsx (Client Component)
'use client';
export default function InteractiveButton({ data }) {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>Click me</button>;
}
```

#### **Anti-Pattern**
```tsx
// ❌ Bad: Entire page is client component
'use client'; // Entire page loses server benefits

export default function Page() {
  const [state, setState] = useState();
  // Now you can't fetch data on server!
  return <div>...</div>;
}
```

### 📊 Comparison Table

| Feature | Server Component | Client Component |
|---------|------------------|------------------|
| **Directive** | None (default) | `'use client'` |
| **Async** | ✅ Yes | ❌ No |
| **Data Fetching** | ✅ Direct DB access | ❌ API routes only |
| **State** | ❌ No | ✅ `useState`, etc. |
| **Effects** | ❌ No | ✅ `useEffect`, etc. |
| **Event Handlers** | ❌ No | ✅ `onClick`, etc. |
| **Browser APIs** | ❌ No | ✅ Yes |
| **JS Bundle** | ✅ Zero | 📦 Adds to bundle |
| **When** | Default choice | Only when needed |

---

## 6. Server Actions

Server Actions allow you to run server-side code directly from components.

### 📝 Definition

```tsx
'use server'; // 👈 File-level directive

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
  // This function runs on the server
  const customerId = formData.get('customerId');
  const amount = formData.get('amount');
  
  // Direct database access
  await sql`INSERT INTO invoices (customer_id, amount) VALUES (${customerId}, ${amount})`;
  
  // Cache management
  revalidatePath('/dashboard/invoices');
  
  // Navigation
  redirect('/dashboard/invoices');
}
```

**Project Location:** `app/lib/actions.ts`

### 🎯 Usage in Forms

#### **Server Component Form**
```tsx
// Server Component
import { createInvoice } from '@/app/lib/actions';

export default function Page() {
  return (
    <form action={createInvoice}> {/* Direct action reference */}
      <input name="customerId" />
      <input name="amount" />
      <button type="submit">Create</button>
    </form>
  );
}
```

#### **Client Component Form (with state)**
```tsx
'use client';
import { useActionState } from 'react';
import { createInvoice } from '@/app/lib/actions';

export default function Form() {
  const initialState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);
  
  return (
    <form action={formAction}>
      <input name="customerId" />
      {state.errors?.customerId && <p>{state.errors.customerId}</p>}
      <button type="submit">Create</button>
    </form>
  );
}
```

**Project Location:** `app/ui/invoices/create-form.tsx`

### ✅ Advantages

- 🔒 **Security** - Server-side execution
- 📦 **Bundle Size** - No client JavaScript
- ⚡ **Performance** - Direct database access
- 🎯 **Progressive Enhancement** - Works without JS
- 🔄 **Automatic Revalidation** - Built-in cache management

### 🔧 Common Operations

```tsx
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// CREATE
export async function createInvoice(formData: FormData) {
  await sql`INSERT INTO invoices ...`;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// UPDATE
export async function updateInvoice(id: string, formData: FormData) {
  await sql`UPDATE invoices SET ... WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// DELETE
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices'); // Stay on same page
}
```

**Project Location:** `app/lib/actions.ts`

### 🎭 useActionState Hook

Manages form state with Server Actions in Client Components.

```tsx
'use client';
import { useActionState } from 'react';

export default function Form() {
  // initialState: Starting state
  // formAction: Server action to call
  // state: Current state (errors, messages)
  const [state, formAction] = useActionState(createInvoice, initialState);
  
  return (
    <form action={formAction}>
      {/* Form fields */}
      {state.errors && <div>{state.errors}</div>}
    </form>
  );
}
```

---

## 7. Streaming & Suspense

### 🌊 What is Streaming?

Streaming allows you to progressively render UI on the server and stream it to the client.

```
Traditional SSR:  [Server: Fetch all + Render] → [Client: Display]
                  ⏱️ 3 seconds                  ⏱️ 0s visible

Streaming:        [Server: Render shell] → [Client: Show shell] → [+ Dynamic 1] → [+ Dynamic 2]
                  ⏱️ 100ms               ⏱️ Immediate        ⏱️ +500ms      ⏱️ +1s
```

### 🎯 Implementation: Suspense

#### **Route-Level Loading** (Coarse)
```tsx
// app/dashboard/(overview)/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

✅ Shows loading state for **entire route**  
❌ Blocks all content until page is ready

**Project Location:** `app/dashboard/(overview)/loading.tsx`

#### **Component-Level Streaming** (Granular) ✅
```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <main>
      <h1>Dashboard</h1> {/* ✅ Immediate */}
      
      {/* Each component loads independently */}
      <Suspense fallback={<CardsSkeleton />}>
        <CardWrapper /> {/* Streams when ready */}
      </Suspense>
      
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart /> {/* Doesn't block cards */}
      </Suspense>
      
      <Suspense fallback={<LatestInvoicesSkeleton />}>
        <LatestInvoices /> {/* Independent loading */}
      </Suspense>
    </main>
  );
}
```

**Project Location:** `app/dashboard/(overview)/page.tsx`

### 🔑 Suspense Key Prop

Force Suspense boundary to remount when dependencies change.

```tsx
<Suspense key={query + currentPage} fallback={<Skeleton />}>
  <Table query={query} currentPage={currentPage} />
</Suspense>
```

🎯 **Why?** When `query` or `currentPage` changes:
1. Suspense boundary resets
2. Shows skeleton immediately
3. Fetches new data
4. Updates table when ready

**Project Location:** `app/dashboard/invoices/page.tsx`

### ✅ Best Practices

#### **Do:**
✅ Use granular Suspense boundaries
```tsx
<Suspense fallback={<Skeleton1 />}>
  <Component1 />
</Suspense>
<Suspense fallback={<Skeleton2 />}>
  <Component2 />
</Suspense>
```

#### **Don't:**
❌ Wrap everything in one Suspense
```tsx
<Suspense fallback={<BigSkeleton />}>
  <Component1 />
  <Component2 />
  <Component3 /> {/* All or nothing */}
</Suspense>
```

### 📊 Benefits

| Benefit | Description |
|---------|-------------|
| ⚡ **Fast Initial Load** | Static shell renders immediately |
| 🎯 **Progressive Rendering** | Content appears as it's ready |
| 📊 **Better UX** | Users see progress, not blank page |
| 🔄 **Parallel Fetching** | Components fetch data simultaneously |
| 📉 **Reduced Perceived Load Time** | Feels faster even if total time is same |

---

## 8. Error Handling

### 🚨 Error Boundaries (error.tsx)

Catch React errors in route segments.

```tsx
'use client'; // ⚠️ Must be Client Component

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);
  
  return (
    <main>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </main>
  );
}
```

✅ **Features:**
- Catches errors in child components
- Prevents entire app from crashing
- Allows recovery with `reset()`
- Can log to monitoring services

⚠️ **Must be a Client Component** to use hooks

**Project Location:** `app/dashboard/invoices/error.tsx`

### 🔍 Not Found (not-found.tsx)

Handle 404 errors gracefully.

```tsx
// app/dashboard/invoices/[id]/edit/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h2>404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      <Link href="/dashboard/invoices">Go Back</Link>
    </main>
  );
}
```

**Trigger in page:**
```tsx
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const invoice = await fetchInvoiceById(params.id);
  
  if (!invoice) {
    notFound(); // 👈 Triggers not-found.tsx
  }
  
  return <EditForm invoice={invoice} />;
}
```

**Project Location:** `app/dashboard/invoices/[id]/edit/not-found.tsx`, `app/dashboard/invoices/[id]/edit/page.tsx`

### 📊 Error Hierarchy

```
Root Layout (app/layout.tsx)
├── Error: global-error.tsx (catches layout errors)
│
├── Route Segment (app/dashboard/)
│   ├── Error: error.tsx (catches page/children errors)
│   ├── Not Found: not-found.tsx (404 errors)
│   └── Page: page.tsx
```

### 🎯 Error Handling Strategy

| Error Type | File | Scope | Use Case |
|------------|------|-------|----------|
| **Runtime Errors** | `error.tsx` | Route segment | API failures, data fetching errors |
| **Not Found** | `not-found.tsx` | Route segment | Missing resources (404) |
| **Global Errors** | `global-error.tsx` | Root layout | Last resort error boundary |

---

## 9. Authentication & Middleware

### 🔐 NextAuth.js Setup

#### **Auth Configuration**
```tsx
// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Custom login page
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

**Project Location:** `auth.config.ts`

#### **Credentials Provider**
```tsx
// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate credentials
        const parsedCredentials = z
          .object({ 
            email: z.string().email(), 
            password: z.string().min(6) 
          })
          .safeParse(credentials);
        
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        
        return null;
      },
    })
  ]
});
```

**Project Location:** `auth.ts`

### 🛡️ Middleware

Runs before request is completed - perfect for authentication.

```tsx
// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Matcher: which routes to protect
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

✅ **Benefits:**
- Runs before page renders
- Protects routes efficiently
- No flash of unprotected content
- Better performance

**Project Location:** `middleware.ts`

### 🔄 Authentication Flow

```
1. User visits /dashboard
2. Middleware checks authentication
3. If not logged in → Redirect to /login
4. User submits credentials
5. Server Action validates credentials
6. If valid → Create session → Redirect to /dashboard
7. If invalid → Return error
```

### 🎯 Server Action for Login

```tsx
'use server';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
```

---

## 10. Authorization & Access Control

> **Authentication vs Authorization:**
> - **Authentication** = "Who are you?" (Login, proving identity)
> - **Authorization** = "What can you do?" (Permissions, access control)

### 🎯 Authorization Basics

After a user logs in (authentication), you need to control what they can access and do (authorization).

```
User logs in → Gets a session → Session contains user info → Check permissions
```

### 🔑 Common Authorization Patterns

#### **1. Role-Based Access Control (RBAC)**

Users have roles, roles have permissions.

```typescript
// User types
type User = {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
};

// Check role
function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

// Usage in component
export default async function Page() {
  const session = await auth();
  const user = session?.user;
  
  if (!isAdmin(user)) {
    redirect('/unauthorized');
  }
  
  return <AdminDashboard />;
}
```

#### **2. Resource-Based Access Control**

Check if user owns/can access specific resources.

```typescript
// Check if user owns the invoice
export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const invoice = await fetchInvoiceById(params.id);
  
  // Only the invoice creator can edit it
  if (invoice.userId !== userId) {
    redirect('/unauthorized');
  }
  
  return <EditForm invoice={invoice} />;
}
```

#### **3. Permission-Based Access Control**

More granular than roles - specific permissions.

```typescript
type Permission = 'invoice:create' | 'invoice:edit' | 'invoice:delete' | 'user:manage';

type User = {
  id: string;
  email: string;
  permissions: Permission[];
};

function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

// Usage
export default async function CreateInvoicePage() {
  const session = await auth();
  const user = session?.user;
  
  if (!hasPermission(user, 'invoice:create')) {
    redirect('/unauthorized');
  }
  
  return <CreateForm />;
}
```

### 🛡️ Authorization in Different Places

#### **1. Page-Level Authorization (Server Components)**

Protect entire pages before rendering.

```tsx
// app/admin/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();
  
  // Check if user is logged in
  if (!session?.user) {
    redirect('/login');
  }
  
  // Check if user is admin
  if (session.user.role !== 'admin') {
    redirect('/unauthorized'); // or return <Unauthorized />
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin-only content */}
    </div>
  );
}
```

✅ **Best for:** Entire pages that require specific roles/permissions

#### **2. Component-Level Authorization**

Show/hide parts of UI based on permissions.

```tsx
// app/dashboard/page.tsx
import { auth } from '@/auth';

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user;
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Everyone can see this */}
      <UserStats user={user} />
      
      {/* Only admins can see this */}
      {user?.role === 'admin' && (
        <AdminPanel />
      )}
      
      {/* Only users with permission can see this */}
      {user?.permissions?.includes('invoice:create') && (
        <CreateInvoiceButton />
      )}
    </div>
  );
}
```

✅ **Best for:** Conditional UI elements within a page

#### **3. Server Action Authorization**

Protect actions (create, update, delete).

```tsx
// app/lib/actions.ts
'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function deleteInvoice(id: string) {
  // Get current user
  const session = await auth();
  
  // Check if logged in
  if (!session?.user) {
    throw new Error('You must be logged in');
  }
  
  // Get the invoice
  const invoice = await fetchInvoiceById(id);
  
  // Check if user owns the invoice OR is admin
  const canDelete = 
    invoice.userId === session.user.id || 
    session.user.role === 'admin';
  
  if (!canDelete) {
    throw new Error('Not authorized to delete this invoice');
  }
  
  // Perform deletion
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
```

✅ **Best for:** Protecting mutations (create, update, delete)

#### **4. Middleware Authorization**

Protect routes before they even load.

```tsx
// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/dashboard/:path*',  // Protect all dashboard routes
    '/admin/:path*',      // Protect all admin routes
  ],
};

// auth.config.ts
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      // Protect dashboard routes
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      
      // Protect admin routes - require admin role
      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === 'admin') return true;
        return false; // Redirect to login or unauthorized
      }
      
      // Redirect logged-in users away from login page
      if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
  providers: [],
};
```

✅ **Best for:** Route-level protection before rendering

### 📊 Authorization Strategy Guide

| Location | When to Use | Example |
|----------|-------------|---------|
| **Middleware** | Protect entire route sections | All `/admin/*` routes require admin |
| **Page Component** | Protect specific pages | Admin settings page |
| **Component** | Conditional UI | Show "Delete" button only to admins |
| **Server Action** | Protect mutations | Only owner can delete invoice |

### 🔧 Practical Implementation

#### **Step 1: Extend User Type**

Add role/permissions to your user object.

```typescript
// auth.ts or types.ts
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    permissions?: string[];
  }
  
  interface Session {
    user: User;
  }
}
```

#### **Step 2: Store Roles in Database**

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';

-- Optional: Create permissions table
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  permission VARCHAR(100) NOT NULL
);
```

#### **Step 3: Include Role in Session**

```typescript
// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email);
        
        if (!user) return null;
        
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (passwordMatch) {
          // Include role in returned user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // 👈 Include role
          };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Store role in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role; // Include role in session
      }
      return session;
    },
  },
});
```

#### **Step 4: Create Helper Functions**

```typescript
// lib/auth-helpers.ts
import { auth } from '@/auth';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    redirect('/unauthorized');
  }
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireAuth();
  if (!user.permissions?.includes(permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
  return user;
}

export function canAccess(user: User, resource: any): boolean {
  // Check if user owns resource OR is admin
  return resource.userId === user.id || user.role === 'admin';
}
```

#### **Step 5: Use Helpers in Pages**

```tsx
// app/admin/page.tsx
import { requireAdmin } from '@/lib/auth-helpers';

export default async function AdminPage() {
  const admin = await requireAdmin(); // Throws/redirects if not admin
  
  return <AdminDashboard user={admin} />;
}

// app/dashboard/invoices/[id]/edit/page.tsx
import { requireAuth, canAccess } from '@/lib/auth-helpers';

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  const invoice = await fetchInvoiceById(params.id);
  
  if (!canAccess(user, invoice)) {
    notFound(); // or redirect('/unauthorized')
  }
  
  return <EditForm invoice={invoice} />;
}
```

### 🎯 Complete Example

Here's a full example with role-based access:

```tsx
// Database Schema
/*
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password TEXT,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' -- 'admin', 'user', 'guest'
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INTEGER,
  status VARCHAR(50)
);
*/

// lib/auth-helpers.ts
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'user' | 'guest';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role) redirect('/unauthorized');
  return user;
}

export function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}

export function canModifyInvoice(user: any, invoice: any): boolean {
  return user.id === invoice.userId || isAdmin(user);
}

// app/dashboard/invoices/page.tsx - List invoices
import { requireAuth } from '@/lib/auth-helpers';

export default async function InvoicesPage() {
  const user = await requireAuth();
  
  // Regular users see only their invoices
  // Admins see all invoices
  const invoices = user.role === 'admin' 
    ? await fetchAllInvoices()
    : await fetchUserInvoices(user.id);
  
  return (
    <div>
      <h1>Invoices</h1>
      <InvoicesTable invoices={invoices} userRole={user.role} />
    </div>
  );
}

// app/dashboard/invoices/[id]/edit/page.tsx - Edit specific invoice
import { requireAuth, canModifyInvoice } from '@/lib/auth-helpers';
import { notFound } from 'next/navigation';

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  const invoice = await fetchInvoiceById(params.id);
  
  if (!invoice) notFound();
  
  // Check if user can edit this invoice
  if (!canModifyInvoice(user, invoice)) {
    redirect('/unauthorized');
  }
  
  return <EditInvoiceForm invoice={invoice} />;
}

// app/lib/actions.ts - Delete invoice action
'use server';

import { requireAuth, canModifyInvoice } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function deleteInvoice(id: string) {
  const user = await requireAuth();
  const invoice = await fetchInvoiceById(id);
  
  if (!invoice) {
    return { error: 'Invoice not found' };
  }
  
  // Authorization check
  if (!canModifyInvoice(user, invoice)) {
    return { error: 'Not authorized to delete this invoice' };
  }
  
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete invoice' };
  }
}

// app/admin/users/page.tsx - Admin only page
import { requireRole } from '@/lib/auth-helpers';

export default async function UsersManagementPage() {
  await requireRole('admin'); // Only admins can access
  
  const users = await fetchAllUsers();
  
  return (
    <div>
      <h1>User Management</h1>
      <UsersTable users={users} />
    </div>
  );
}

// app/ui/invoices/table.tsx - Conditional UI
import { isAdmin } from '@/lib/auth-helpers';

export function InvoicesTable({ invoices, userRole }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Amount</th>
          <th>Status</th>
          {isAdmin({ role: userRole }) && <th>Customer</th>}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(invoice => (
          <tr key={invoice.id}>
            <td>{invoice.id}</td>
            <td>{invoice.amount}</td>
            <td>{invoice.status}</td>
            {isAdmin({ role: userRole }) && <td>{invoice.customerName}</td>}
            <td>
              <EditButton id={invoice.id} />
              {isAdmin({ role: userRole }) && <DeleteButton id={invoice.id} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### ⚠️ Common Mistakes

#### ❌ **Mistake 1: Only checking on client**
```tsx
'use client';
// ❌ Bad: Client-side check can be bypassed
export default function AdminPanel() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'admin') {
    return <div>Not authorized</div>;
  }
  
  return <AdminContent />; // User can still see HTML source!
}
```

#### ✅ **Fix: Always check on server**
```tsx
// ✅ Good: Server-side check
import { requireAdmin } from '@/lib/auth-helpers';

export default async function AdminPanel() {
  await requireAdmin(); // Server-side protection
  
  return <AdminContent />;
}
```

#### ❌ **Mistake 2: Forgetting to check in Server Actions**
```tsx
// ❌ Bad: Anyone can call this action
'use server';
export async function deleteUser(userId: string) {
  await sql`DELETE FROM users WHERE id = ${userId}`;
}
```

#### ✅ **Fix: Always authorize in actions**
```tsx
// ✅ Good: Check permissions
'use server';
export async function deleteUser(userId: string) {
  const currentUser = await requireAdmin(); // Must be admin
  await sql`DELETE FROM users WHERE id = ${userId}`;
}
```

#### ❌ **Mistake 3: Trusting client data**
```tsx
// ❌ Bad: Trust userId from client
'use server';
export async function updateInvoice(invoiceId: string, userId: string) {
  const invoice = await fetchInvoice(invoiceId);
  if (invoice.userId === userId) { // Client could send any userId!
    await updateInvoice(invoiceId);
  }
}
```

#### ✅ **Fix: Get user from session**
```tsx
// ✅ Good: Get userId from authenticated session
'use server';
export async function updateInvoice(invoiceId: string) {
  const user = await requireAuth(); // Get real user from session
  const invoice = await fetchInvoice(invoiceId);
  
  if (invoice.userId === user.id) {
    await updateInvoice(invoiceId);
  }
}
```

### 📋 Authorization Checklist

When implementing authorization, check:

- [ ] ✅ User's role/permissions stored in database
- [ ] ✅ Role included in authentication session
- [ ] ✅ Middleware protects route sections (if needed)
- [ ] ✅ Page components check authorization (server-side)
- [ ] ✅ Server Actions validate user permissions
- [ ] ✅ UI conditionally shows elements based on permissions
- [ ] ✅ Error handling for unauthorized access
- [ ] ✅ Redirect to appropriate page when unauthorized
- [ ] ✅ Never trust client-side checks alone
- [ ] ✅ Always get user from session, not from request body

### 🎯 Quick Reference

| Task | Code Pattern |
|------|--------------|
| **Get current user** | `const user = await auth().then(s => s?.user)` |
| **Require login** | `const user = await requireAuth()` |
| **Require admin** | `await requireRole('admin')` |
| **Check ownership** | `if (resource.userId !== user.id) redirect('/unauthorized')` |
| **Admin or owner** | `if (!isAdmin(user) && resource.userId !== user.id)` |
| **Conditional UI** | `{user.role === 'admin' && <AdminButton />}` |
| **Protect action** | Put `await requireAuth()` at start of Server Action |

### 🔒 Security Best Practices

1. **Always authorize on the server** - Never trust the client
2. **Check permissions at every level** - Middleware, page, component, action
3. **Use session data** - Don't accept userId from client
4. **Fail securely** - Default to denying access if unsure
5. **Log authorization failures** - Track suspicious activity
6. **Use TypeScript** - Type-safe roles and permissions
7. **Test authorization** - Try accessing as different user roles

---

## 11. Form Validation

### 🔍 Validation with Zod

#### **Schema Definition**
```tsx
import { z } from 'zod';

const FormSchema = z.object({
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }).min(1, 'Customer is required'),
  
  amount: z.coerce
    .number({
      invalid_type_error: 'Please enter an amount.',
    })
    .gt(0, 'Amount must be greater than $0.'),
    
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a status.',
  }),
  
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
```

**Project Location:** `app/lib/actions.ts`

#### **Server-Side Validation**
```tsx
'use server';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate with Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  
  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  
  // Process validated data
  const { customerId, amount, status } = validatedFields.data;
  
  try {
    await sql`INSERT INTO invoices ...`;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.' };
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

**Project Location:** `app/lib/actions.ts`

### 🎨 Client-Side Error Display

```tsx
'use client';
import { useActionState } from 'react';

export default function Form() {
  const initialState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);
  
  return (
    <form action={formAction}>
      {/* Customer Field */}
      <select 
        name="customerId"
        aria-describedby="customer-error"
      >
        <option value="">Select a customer</option>
        {customers.map(customer => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
      
      {/* Error Display */}
      <div id="customer-error" aria-live="polite" aria-atomic="true">
        {state.errors?.customerId?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
      
      {/* Amount Field */}
      <input 
        type="number"
        name="amount"
        step="0.01"
        aria-describedby="amount-error"
      />
      
      <div id="amount-error" aria-live="polite" aria-atomic="true">
        {state.errors?.amount?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
      
      {/* General Error Message */}
      {state.message && (
        <p className="mt-2 text-sm text-red-500">{state.message}</p>
      )}
      
      <button type="submit">Create Invoice</button>
    </form>
  );
}
```

**Project Location:** `app/ui/invoices/create-form.tsx`

### ✅ Validation Best Practices

| Practice | Reason |
|----------|--------|
| ✅ **Always validate server-side** | Security - client can be bypassed |
| ✅ **Progressive enhancement** | Works without JavaScript |
| ✅ **Clear error messages** | Better user experience |
| ✅ **Field-specific errors** | Users know exactly what to fix |
| ✅ **ARIA attributes** | Accessibility for screen readers |
| ✅ **Type coercion** | Handle FormData strings properly |

### 🔒 Security Principles

```tsx
// ❌ Bad: Trust client data
export async function createInvoice(formData: FormData) {
  const amount = formData.get('amount');
  await sql`INSERT INTO invoices (amount) VALUES (${amount})`; // Unsafe!
}

// ✅ Good: Validate everything
export async function createInvoice(formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    amount: formData.get('amount'),
  });
  
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { amount } = validatedFields.data; // Type-safe and validated
  await sql`INSERT INTO invoices (amount) VALUES (${amount})`;
}
```

---

## 12. Optimization

### 🖼️ Image Optimization

Next.js automatically optimizes images with the `<Image>` component.

```tsx
import Image from 'next/image';

<Image
  src="/hero-desktop.png"
  width={1000}
  height={760}
  className="hidden md:block"
  alt="Screenshots of the dashboard project"
  priority // Load immediately (above fold)
/>
```

✅ **Automatic Optimizations:**
- Responsive images (different sizes)
- Modern formats (WebP, AVIF)
- Lazy loading by default
- Prevents layout shift
- On-demand optimization

❌ **Don't use `<img>`** - loses all optimizations

**Project Location:** `app/page.tsx`

### 🔤 Font Optimization

Load fonts efficiently with `next/font`.

```tsx
// app/ui/fonts.ts
import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ 
  subsets: ['latin'], 
  weight: ['400', '700'] 
});

// Usage in layout
import { inter } from '@/app/ui/fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

✅ **Benefits:**
- Self-hosted fonts (no external requests)
- Zero layout shift
- Automatic font subsetting
- Preloaded fonts

**Project Location:** `app/ui/fonts.ts`, `app/layout.tsx`

### 🔍 Search with Debouncing

Reduce unnecessary API calls during search.

```tsx
'use client';
import { useDebouncedCallback } from 'use-debounce';

export default function Search() {
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    term ? params.set('query', term) : params.delete('query');
    replace(`${pathname}?${params}`);
  }, 300); // Wait 300ms after typing stops
  
  return (
    <input onChange={(e) => handleSearch(e.target.value)} />
  );
}
```

✅ **Benefits:**
- Fewer server requests
- Better performance
- Smoother UX
- Reduced costs

**Project Location:** `app/ui/search.tsx`

> 💡 **For comprehensive performance optimization guide**, see [Performance Notes](./performance-notes.md)
> 
> Covers: Code splitting, lazy loading, Lighthouse audits, Core Web Vitals, and more.

---

### ♿ Accessibility

#### **ESLint Configuration**
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"]
}
```

#### **Common Patterns**
```tsx
// ✅ Proper labels
<label htmlFor="email">Email</label>
<input id="email" name="email" type="email" />

// ✅ ARIA for errors
<input aria-describedby="email-error" />
<div id="email-error" aria-live="polite">
  {errors.email && <p>{errors.email}</p>}
</div>

// ✅ Screen reader only text
<span className="sr-only">Search</span>

// ✅ Semantic HTML
<button type="submit">Submit</button> // Not <div onClick>
<Link href="/page">Link</Link> // Not <span onClick>
```

**Project Locations:** Forms in `app/ui/invoices/`, Search in `app/ui/search.tsx`

---

## 13. Best Practices

### ✅ Do's

#### **Routing**
✅ Use `<Link>` for navigation (not `<a>`)  
✅ Use route groups `()` for organization  
✅ Keep layouts simple and shared  

#### **Components**
✅ Default to Server Components  
✅ Push `'use client'` to leaf components  
✅ Fetch data where it's used  

#### **Data Fetching**
✅ Use parallel fetching (`Promise.all`)  
✅ Implement Suspense boundaries  
✅ Show loading states  

#### **Forms**
✅ Use Server Actions  
✅ Validate server-side  
✅ Display field-specific errors  
✅ Use ARIA attributes  

#### **Performance**
✅ Use `<Image>` component  
✅ Optimize fonts with `next/font`  
✅ Implement debouncing for search  
✅ Use streaming with Suspense  

### ❌ Don'ts

❌ Don't make entire pages Client Components  
❌ Don't use `<a>` tags for internal navigation  
❌ Don't trust client-side data  
❌ Don't ignore accessibility  
❌ Don't use `<img>` instead of `<Image>`  
❌ Don't fetch data in waterfalls  
❌ Don't skip error boundaries  

### 🎯 Component Checklist

When creating a new component, ask:

1. **Does it need interactivity?**
   - No → Server Component ✅
   - Yes → Client Component with `'use client'`

2. **Does it fetch data?**
   - Server Component → `async/await`
   - Client Component → Use API route

3. **Should it stream?**
   - Yes → Wrap in `<Suspense>`
   - No → Direct render
   
   **When to use streaming:**
   - Component has slow data fetching (database queries, API calls)
   - Data isn't critical for initial page render
   - You want to show loading state while data loads
   - Multiple components can load independently
   
   **When NOT to stream:**
   - Fast data fetching (< 100ms)
   - Critical above-the-fold content
   - Data needed for layout calculations
   - Simple static content
   
   **Example:** Dashboard cards with database aggregations → Stream ✅  
   **Example:** Page title or navigation → Don't stream ❌
   
   💡 **Tip:** See [Section 7: Streaming & Suspense](#7-streaming--suspense) for detailed explanation and implementation patterns.

4. **Can it error?**
   - Yes → Add `error.tsx` boundary
   - Maybe → Use try/catch

5. **Is it accessible?**
   - Forms → Proper labels + ARIA
   - Interactive → Keyboard support
   - Images → Alt text

### 📁 File Organization

```
app/
├── (auth)/           # Route group for auth pages
│   ├── login/
│   └── register/
├── (dashboard)/      # Route group for dashboard
│   ├── layout.tsx
│   └── ...
├── api/             # API routes
├── lib/             # Server utilities
│   ├── actions.ts   # Server Actions
│   ├── data.ts      # Data fetching
│   └── utils.ts     # Utilities
└── ui/              # UI components
    ├── dashboard/   # Feature-specific
    ├── invoices/
    └── shared/      # Reusable components
```

### 🔄 Development Workflow

1. **Plan Route Structure** → Create folder hierarchy
2. **Add Layout** → Shared UI across routes
3. **Create Page** → Route content (Server Component)
4. **Add Data Fetching** → Direct in Server Component
5. **Implement Streaming** → Wrap slow components in Suspense
6. **Add Interactivity** → Client Components where needed
7. **Error Handling** → Add error.tsx boundaries
8. **Form Actions** → Server Actions for mutations
9. **Validation** → Zod schemas + error display
10. **Optimization** → Images, fonts, debouncing

---

## 📚 Key Takeaways

### 🎯 Core Concepts

1. **App Router** - File-system based routing with special files
2. **Server Components** - Default, fetch data directly
3. **Client Components** - Only when you need interactivity
4. **Streaming** - Progressive rendering with Suspense
5. **Server Actions** - Mutations without API routes
6. **Middleware** - Protect routes before rendering

### 🚀 Performance Features

- ⚡ Static rendering by default
- 🌊 Streaming with Suspense
- 📦 Automatic code splitting
- 🖼️ Image optimization
- 🔤 Font optimization
- 🔍 Search debouncing

### 🔒 Security Features

- Server-side validation
- Middleware authentication
- Credentials on server only
- SQL injection prevention (parameterized queries)

### ♿ Accessibility Features

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support
- ESLint enforcement

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Course](https://nextjs.org/learn)
- [React Server Components](https://react.dev/reference/react/use-server)
- [NextAuth.js](https://next-auth.js.org/)
- [Zod Validation](https://zod.dev/)

---

**Project Structure:** `c:\Projects\Learning\nextjs-dashboard`  
**Framework:** Next.js 15.0.0 with App Router  
**Database:** PostgreSQL with Vercel Postgres  
**Styling:** Tailwind CSS  
**Authentication:** NextAuth.js v5  
**Validation:** Zod

---

*This guide is a living document based on the nextjs-dashboard learning project.*


