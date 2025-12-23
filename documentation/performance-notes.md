# 🚀 Performance Optimization Guide

Complete guide to optimizing Next.js applications for maximum performance.

---

## Table of Contents

1. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
2. [Performance Measurement](#performance-measurement)
3. [Loading Optimization](#loading-optimization)
4. [Image Optimization](#image-optimization)
5. [Font Optimization](#font-optimization)
6. [Search Optimization](#search-optimization)

---

## 📦 Code Splitting & Lazy Loading

Code splitting is the practice of breaking your JavaScript bundle into smaller chunks that are loaded on demand. This reduces initial load time and improves performance.

### **Automatic Code Splitting**

Next.js automatically code-splits your application by route.

```
Each route is a separate chunk:
- /dashboard          → dashboard.js
- /dashboard/invoices → invoices.js  
- /dashboard/customers → customers.js
```

✅ **Benefits:**
- Users only download code they need
- Faster initial page load
- Smaller bundle sizes
- Better performance on mobile

**No configuration needed** - happens automatically with Next.js App Router.

---

### **Manual Code Splitting with `next/dynamic`**

Use `next/dynamic` to lazy load components that aren't needed immediately.

#### **Basic Dynamic Import**

```tsx
import dynamic from 'next/dynamic';

// ❌ Without lazy loading: Chart loaded immediately
import Chart from '@/app/ui/chart';

// ✅ With lazy loading: Chart loaded only when needed
const Chart = dynamic(() => import('@/app/ui/chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable server-side rendering if not needed
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Chart data={data} /> {/* Loaded on demand */}
    </div>
  );
}
```

#### **When to Use Lazy Loading**

| Use Case | Example | Why |
|----------|---------|-----|
| **Heavy components** | Chart libraries, maps, editors | Large bundle size |
| **Below the fold** | Footer, comments section | Not immediately visible |
| **Conditional rendering** | Modals, dropdowns, tooltips | Only needed sometimes |
| **Client-only code** | Browser-specific libraries | Uses `window`, `document` |
| **Third-party widgets** | Chat widgets, analytics | External dependencies |

#### **Real-World Examples**

**Example 1: Lazy Load Chart Library**

```tsx
// app/dashboard/analytics/page.tsx
import dynamic from 'next/dynamic';

// Chart library is large (100KB+) - load it only when needed
const RevenueChart = dynamic(() => import('@/app/ui/revenue-chart'), {
  loading: () => <div className="h-80 w-full animate-pulse bg-gray-100" />,
  ssr: true, // Keep SSR for SEO
});

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Revenue Analytics</h1>
      {/* Chart loads after page renders */}
      <RevenueChart />
    </div>
  );
}
```

**Example 2: Lazy Load Modal**

```tsx
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Modal only loaded when user clicks "Edit"
const EditModal = dynamic(() => import('@/app/ui/edit-modal'), {
  loading: () => <div>Opening...</div>,
  ssr: false, // Modals don't need SSR
});

export default function InvoiceRow({ invoice }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <tr>
      <td>{invoice.amount}</td>
      <td>
        <button onClick={() => setShowModal(true)}>Edit</button>
      </td>
      {showModal && <EditModal invoice={invoice} onClose={() => setShowModal(false)} />}
    </tr>
  );
}
```

**Example 3: Lazy Load Third-Party Library**

```tsx
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Load Markdown editor only on client
const MarkdownEditor = dynamic(() => import('react-markdown-editor-lite'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false, // Editor needs browser APIs
});

export default function BlogPostEditor() {
  const [content, setContent] = useState('');
  
  return (
    <div>
      <h2>Write Post</h2>
      <MarkdownEditor 
        value={content}
        onChange={({ text }) => setContent(text)}
      />
    </div>
  );
}
```

**Example 4: Lazy Load with Named Exports**

```tsx
import dynamic from 'next/dynamic';

// When component is not the default export
const AdvancedChart = dynamic(
  () => import('@/app/ui/charts').then((mod) => mod.AdvancedChart),
  {
    loading: () => <div>Loading advanced chart...</div>,
  }
);
```

---

### **Dynamic Imports with Loading States**

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <p className="ml-4">Loading component...</p>
    </div>
  ),
});
```

---

### **Lazy Loading Images**

Images are lazy-loaded by default with Next.js `<Image>` component.

```tsx
import Image from 'next/image';

// ✅ Automatically lazy loaded (below the fold)
<Image
  src="/product.jpg"
  width={500}
  height={300}
  alt="Product"
  // loading="lazy" is default
/>

// For above-the-fold images: disable lazy loading
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority // Load immediately
/>
```

---

### **Bundle Analysis**

Analyze your bundle size to find optimization opportunities.

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your Next.js config
});

# Run analysis
ANALYZE=true npm run build
```

**What to look for:**
- 🔍 Large dependencies (>100KB)
- 📦 Duplicated code
- 🎯 Unused imports
- 📊 Route bundle sizes

---

### **Code Splitting Best Practices**

#### **✅ Do's**

1. **Lazy load heavy libraries**
   ```tsx
   const Chart = dynamic(() => import('recharts'));
   ```

2. **Split routes naturally**
   ```
   ✅ Each page in app/ directory is automatically split
   ```

3. **Use loading states**
   ```tsx
   loading: () => <Skeleton />
   ```

4. **Disable SSR for client-only code**
   ```tsx
   ssr: false // For browser APIs
   ```

5. **Lazy load below-the-fold content**
   ```tsx
   const Comments = dynamic(() => import('./comments'));
   ```

#### **❌ Don'ts**

1. **Don't lazy load critical content**
   ```tsx
   // ❌ BAD: Main navigation shouldn't be lazy loaded
   const Navigation = dynamic(() => import('./nav'));
   ```

2. **Don't lazy load small components**
   ```tsx
   // ❌ Overkill: Button component is tiny
   const Button = dynamic(() => import('./button'));
   
   // ✅ Just import normally
   import Button from './button';
   ```

3. **Don't create loading waterfalls**
   ```tsx
   // ❌ BAD: Sequential loading
   const A = dynamic(() => import('./A'));
   // Inside A: const B = dynamic(() => import('./B'));
   
   // ✅ GOOD: Load in parallel if both needed
   const A = dynamic(() => import('./A'));
   const B = dynamic(() => import('./B'));
   ```

---

### **Performance Impact**

| Technique | Initial Load | Time to Interactive | Total Size |
|-----------|--------------|---------------------|------------|
| No splitting | 🐌 Slow (500KB) | 🐌 Slow | 📦 Large |
| Route splitting | ⚡ Fast (100KB) | ⚡ Fast | 📦 Same |
| + Lazy loading | 🚀 Fastest (50KB) | 🚀 Fastest | 📦 Same |

---

### **Quick Reference**

```tsx
// ✅ Lazy load heavy component
const Heavy = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />,
});

// ✅ Lazy load with named export
const Chart = dynamic(
  () => import('./charts').then(mod => mod.LineChart)
);

// ✅ Client-only component
const Editor = dynamic(() => import('./Editor'), {
  ssr: false, // Disable server rendering
});

// ✅ Lazy load on condition
const Modal = dynamic(() => import('./Modal'));
{showModal && <Modal />}

// ✅ Lazy load third-party
const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
});
```

---

## 🎯 Performance Measurement

### **Lighthouse Audits**

Lighthouse is a tool that audits your web app for performance, accessibility, SEO, and best practices.

#### **How to Run Lighthouse**

**Method 1: Chrome DevTools**

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select categories to audit:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Choose device (Mobile/Desktop)
5. Click "Analyze page load"

**Method 2: Command Line**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --output html --output-path ./report.html

# Run with specific options
lighthouse https://your-site.com \
  --only-categories=performance \
  --view
```

**Method 3: CI/CD Integration**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-site.com
          uploadArtifacts: true
```

---

### **Core Web Vitals**

Core Web Vitals are the key metrics Google uses to measure user experience.

#### **The Three Core Metrics**

| Metric | Measures | Good | Needs Improvement | Poor | What It Means |
|--------|----------|------|-------------------|------|---------------|
| **LCP** (Largest Contentful Paint) | Loading performance | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | How fast main content loads |
| **FID** (First Input Delay) → **INP** | Interactivity | ≤ 100ms | 100ms - 300ms | > 300ms | How fast page responds |
| **CLS** (Cumulative Layout Shift) | Visual stability | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | How much content moves |

#### **1. Largest Contentful Paint (LCP)**

**What it measures:** Time until the largest content element (image, text block) is visible.

**How to improve LCP:**

```tsx
// ❌ BAD: Large image not optimized
<img src="/hero.jpg" alt="Hero" />

// ✅ GOOD: Optimized with Next.js Image
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority // Load immediately
  quality={90}
/>
```

**Optimization checklist:**
- ✅ Use `<Image priority>` for above-fold images
- ✅ Optimize images (WebP, correct size)
- ✅ Use CDN for static assets
- ✅ Minimize render-blocking resources
- ✅ Implement proper caching
- ✅ Use Server Components for fast initial render

```tsx
// Server Component loads fast
export default async function Page() {
  const data = await fetchData(); // Server-side
  return (
    <div>
      <Image src="/hero.jpg" priority /> {/* Fast LCP */}
      <h1>{data.title}</h1>
    </div>
  );
}
```

#### **2. First Input Delay (FID) / Interaction to Next Paint (INP)**

**What it measures:** Time between user interaction and browser response.

**How to improve FID/INP:**

```tsx
// ❌ BAD: Heavy computation blocks main thread
'use client';
export default function Page() {
  const data = expensiveCalculation(); // Blocks rendering
  return <div>{data}</div>;
}

// ✅ GOOD: Use useMemo to cache
'use client';
export default function Page() {
  const data = useMemo(() => expensiveCalculation(), []);
  return <div>{data}</div>;
}

// ✅ BETTER: Move to Server Component
export default async function Page() {
  const data = await expensiveCalculation(); // On server
  return <div>{data}</div>;
}
```

**Optimization checklist:**
- ✅ Split long tasks into smaller chunks
- ✅ Use `useMemo` and `useCallback` wisely
- ✅ Defer non-critical JavaScript
- ✅ Use Server Components for heavy logic
- ✅ Lazy load heavy components
- ✅ Minimize third-party scripts

#### **3. Cumulative Layout Shift (CLS)**

**What it measures:** Visual stability - how much content moves during page load.

**How to improve CLS:**

```tsx
// ❌ BAD: Image without dimensions
<img src="/product.jpg" alt="Product" />
// Content shifts when image loads!

// ✅ GOOD: Image with fixed dimensions
<Image
  src="/product.jpg"
  width={500}
  height={300}
  alt="Product"
/>
// Space reserved, no shift
```

**Common CLS issues and fixes:**

```tsx
// ❌ Issue 1: Images without dimensions
<img src="/banner.jpg" />

// ✅ Fix: Specify dimensions
<Image src="/banner.jpg" width={1200} height={400} />

// ❌ Issue 2: Web fonts causing shift
// ✅ Fix: Use next/font (automatic font optimization)
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

// ❌ Issue 3: Dynamic content inserted above fold
const [data, setData] = useState();
useEffect(() => {
  fetchData().then(setData); // Causes shift!
}, []);

// ✅ Fix: Reserve space or load on server
export default async function Page() {
  const data = await fetchData(); // No shift
  return <div>{data}</div>;
}

// ❌ Issue 4: Ads/embeds without size
<div>{/* Ad loads and pushes content */}</div>

// ✅ Fix: Reserve space
<div className="h-64 w-full"> {/* Fixed height */}
  <AdComponent />
</div>
```

**Optimization checklist:**
- ✅ Always specify image dimensions
- ✅ Use `next/font` for font optimization
- ✅ Reserve space for dynamic content
- ✅ Avoid inserting content above existing content
- ✅ Use CSS `aspect-ratio` for responsive media
- ✅ Avoid non-composited animations (use transform/opacity)

---

### **Measuring Core Web Vitals**

#### **In Development**

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* Track page views */}
        <SpeedInsights /> {/* Measure Core Web Vitals */}
      </body>
    </html>
  );
}
```

#### **With Web Vitals Library**

```bash
npm install web-vitals
```

```tsx
// app/components/web-vitals.tsx
'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    onCLS(console.log); // Cumulative Layout Shift
    onFID(console.log); // First Input Delay
    onLCP(console.log); // Largest Contentful Paint
    onFCP(console.log); // First Contentful Paint
    onTTFB(console.log); // Time to First Byte
  }, []);

  return null;
}
```

#### **Google Search Console**

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Click "Core Web Vitals" in sidebar
4. View real-world user data

---

### **Performance Optimization Workflow**

```
1. Measure
   ↓ Run Lighthouse audit
   ↓ Check Core Web Vitals
   
2. Identify Issues
   ↓ Poor LCP? → Optimize images, reduce server response time
   ↓ Poor FID? → Reduce JavaScript, lazy load components
   ↓ Poor CLS? → Add dimensions, optimize fonts
   
3. Fix
   ↓ Implement optimizations
   
4. Re-measure
   ↓ Run Lighthouse again
   ↓ Compare scores
   
5. Monitor
   ↓ Use RUM (Real User Monitoring)
   ↓ Track over time
```

---

### **Next.js-Specific Optimizations**

| Feature | What It Does | Core Web Vital Impact |
|---------|--------------|----------------------|
| `<Image>` component | Optimizes images automatically | ✅ LCP, CLS |
| `next/font` | Optimizes font loading | ✅ CLS |
| Route prefetching | Preloads next pages | ✅ FID |
| Code splitting | Smaller bundles | ✅ FID |
| Server Components | Server-side rendering | ✅ LCP, FID |
| Streaming | Progressive rendering | ✅ LCP |
| Metadata API | Optimized meta tags | ✅ SEO |

---

### **Lighthouse Scoring**

Each category is scored 0-100:

| Score | Rating | Color | Meaning |
|-------|--------|-------|---------|
| 90-100 | Good | 🟢 Green | Passing |
| 50-89 | Needs Improvement | 🟠 Orange | Some issues |
| 0-49 | Poor | 🔴 Red | Critical issues |

**Performance score breakdown:**
- LCP: 25%
- Total Blocking Time: 30%
- FID: 10%
- CLS: 25%
- Speed Index: 10%

---

### **Quick Wins for Better Performance**

```tsx
// 1. Use Next.js Image
<Image src="/hero.jpg" width={1200} height={600} priority />

// 2. Lazy load heavy components
const Chart = dynamic(() => import('./Chart'));

// 3. Optimize fonts
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

// 4. Server Components by default
async function Page() {
  const data = await fetchData(); // Fast!
  return <div>{data}</div>;
}

// 5. Proper caching
export const revalidate = 3600; // Cache 1 hour

// 6. Streaming with Suspense
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

---

### **Debugging Performance Issues**

**Chrome DevTools Performance Tab:**

1. Open DevTools → Performance tab
2. Click Record (⏺️)
3. Interact with page
4. Stop recording
5. Analyze:
   - 🔍 Look for long tasks (>50ms)
   - 📊 Check main thread activity
   - 🎨 Identify layout shifts
   - 📦 Find large JavaScript bundles

**React DevTools Profiler:**

1. Install React DevTools extension
2. Open "Profiler" tab
3. Click Record
4. Interact with your app
5. Analyze render times

---

## 🔄 Loading Optimization

Optimize how your application loads and displays content to improve perceived performance and user experience.

### **Loading States & Skeletons**

Show meaningful loading states instead of blank screens or spinners.

#### **Route-Level Loading**

Next.js provides automatic loading UI for entire routes.

```tsx
// app/dashboard/(overview)/loading.tsx
import DashboardSkeleton from '@/app/ui/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

✅ **Benefits:**
- Automatic loading UI when navigating
- Shows instantly while page loads
- Built-in with Next.js App Router
- No additional code in page component

**Project Location:** `app/dashboard/(overview)/loading.tsx`

---

#### **Component-Level Loading with Suspense**

Use React Suspense for granular loading control.

```tsx
// app/dashboard/(overview)/page.tsx
import { Suspense } from 'react';
import { 
  RevenueChart, 
  LatestInvoices, 
  Cards 
} from '@/app/ui/dashboard';
import { 
  RevenueChartSkeleton, 
  LatestInvoicesSkeleton, 
  CardsSkeleton 
} from '@/app/ui/skeletons';

export default function DashboardPage() {
  return (
    <main>
      {/* Cards load independently */}
      <Suspense fallback={<CardsSkeleton />}>
        <Cards />
      </Suspense>
      
      {/* Chart loads independently */}
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart />
      </Suspense>
      
      {/* Invoices load independently */}
      <Suspense fallback={<LatestInvoicesSkeleton />}>
        <LatestInvoices />
      </Suspense>
    </main>
  );
}
```

✅ **Benefits:**
- Progressive rendering - fast content shows first
- Each component loads independently
- Better perceived performance
- No blocking on slow queries

**Project Location:** `app/dashboard/(overview)/page.tsx`

---

### **Skeleton Component Best Practices**

Create skeletons that match your actual content layout.

```tsx
// app/ui/skeletons.tsx
export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-100 p-2 shadow-sm">
      <div className="flex p-4">
        {/* Icon placeholder */}
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        {/* Text placeholder */}
        <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        {/* Value placeholder */}
        <div className="h-7 w-32 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

// Animated skeleton
export function RevenueChartSkeleton() {
  return (
    <div className="w-full">
      <div className="h-80 w-full rounded-xl bg-gray-100 p-4">
        <div className="mt-0 grid h-full grid-cols-12 items-end gap-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-md bg-gray-200"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Project Location:** `app/ui/skeletons.tsx`

---

### **Loading States Strategies**

#### **Strategy 1: Parallel Loading (Fastest)**

All components load at the same time.

```tsx
export default async function Page() {
  // ✅ All queries run in parallel
  const [cards, revenue, invoices] = await Promise.all([
    fetchCardData(),
    fetchRevenue(),
    fetchLatestInvoices(),
  ]);
  
  return (
    <main>
      <Cards data={cards} />
      <RevenueChart data={revenue} />
      <LatestInvoices data={invoices} />
    </main>
  );
}
```

**When to use:**
- All data is equally important
- Data loads at similar speeds
- User needs to see everything before interacting

**User experience:** Longer initial wait, everything appears at once

---

#### **Strategy 2: Sequential Loading (Blocking)**

Each component waits for the previous one.

```tsx
export default async function Page() {
  // ❌ Sequential - each waits for previous
  const cards = await fetchCardData();        // 300ms - user waits
  const revenue = await fetchRevenue();       // +400ms - user still waiting
  const invoices = await fetchLatestInvoices(); // +300ms - total 1000ms
  
  return (
    <main>
      <Cards data={cards} />
      <RevenueChart data={revenue} />
      <LatestInvoices data={invoices} />
    </main>
  );
}
```

**When to use:**
- Data depends on previous results
- Rarely recommended for dashboard views

**User experience:** Longest wait time (sum of all queries)

---

#### **Strategy 3: Streaming with Suspense (Best UX)**

Show content progressively as it loads.

```tsx
export default function Page() {
  return (
    <main>
      {/* Fast data: Shows immediately */}
      <Suspense fallback={<CardsSkeleton />}>
        <Cards /> {/* 300ms - appears first */}
      </Suspense>
      
      {/* Medium speed: Shows when ready */}
      <Suspense fallback={<LatestInvoicesSkeleton />}>
        <LatestInvoices /> {/* 300ms - appears second */}
      </Suspense>
      
      {/* Slow data: Shows last */}
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart /> {/* 700ms - appears last */}
      </Suspense>
    </main>
  );
}

// Each component fetches its own data
async function Cards() {
  const data = await fetchCardData(); // Runs independently
  return <CardsGrid data={data} />;
}

async function LatestInvoices() {
  const data = await fetchLatestInvoices(); // Runs independently
  return <InvoiceList data={data} />;
}

async function RevenueChart() {
  const data = await fetchRevenue(); // Runs independently
  return <Chart data={data} />;
}
```

**When to use:**
- Different components have different load times
- Want to show content as soon as possible
- Improve perceived performance

**User experience:** 
- Initial content shows in ~300ms (fast!)
- Additional content streams in progressively
- Always see feedback (skeletons)

---

### **Suspense Key Prop**

Reset Suspense boundary when dependencies change.

```tsx
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  return (
    <Suspense 
      key={query + currentPage}  // 👈 Reset on change
      fallback={<InvoicesTableSkeleton />}
    >
      <InvoicesTable query={query} currentPage={currentPage} />
    </Suspense>
  );
}
```

**Why?** When `query` or `currentPage` changes:
1. Suspense boundary resets
2. Shows skeleton immediately
3. Fetches new data
4. Updates table when ready

**Project Location:** `app/dashboard/invoices/page.tsx`

---

### **Loading Performance Comparison**

| Strategy | Initial Load | Time to Interactive | User Feedback | Best For |
|----------|--------------|-------------------|---------------|----------|
| **Parallel** | 1000ms | 1000ms | ❌ None until complete | Simple pages, fast queries |
| **Sequential** | 1000ms+ | 1000ms+ | ❌ None until complete | Dependent data |
| **Streaming** | 300ms | 1000ms | ✅ Progressive | **Dashboards, complex pages** |

---

### **Optimizing Server Response Time**

Reduce initial load time by optimizing data fetching.

#### **1. Database Query Optimization**

```tsx
// ❌ BAD: Sequential database queries
export async function fetchDashboardData() {
  const revenue = await sql`SELECT * FROM revenue`;           // 400ms
  const invoices = await sql`SELECT * FROM invoices`;         // 300ms
  const customers = await sql`SELECT * FROM customers`;       // 300ms
  // Total: 1000ms sequential
  
  return { revenue, invoices, customers };
}

// ✅ GOOD: Parallel database queries
export async function fetchDashboardData() {
  const [revenue, invoices, customers] = await Promise.all([
    sql`SELECT * FROM revenue`,      // 400ms
    sql`SELECT * FROM invoices`,     // 300ms
    sql`SELECT * FROM customers`,    // 300ms
  ]);
  // Total: ~400ms (fastest query determines time)
  
  return { revenue, invoices, customers };
}
```

**Improvement:** 600ms faster! (1000ms → 400ms)

---

#### **2. Add Database Indexes**

```sql
-- Check existing indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Add indexes for common queries
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Composite index for filtering + sorting
CREATE INDEX idx_invoices_status_date ON invoices(status, date DESC);
```

**Test query performance:**

```sql
-- Before index
EXPLAIN ANALYZE 
SELECT * FROM invoices WHERE customer_id = 'xxx';
-- Seq Scan (cost=0.00..431.00) (actual time=0.123..45.678)

-- After index
EXPLAIN ANALYZE 
SELECT * FROM invoices WHERE customer_id = 'xxx';
-- Index Scan (cost=0.29..8.31) (actual time=0.012..0.045)
```

---

#### **3. Implement Caching**

Cache expensive queries to reduce database load.

```tsx
import { unstable_cache } from 'next/cache';

// ❌ Without cache: Database hit every request
export async function fetchRevenue() {
  const data = await sql`SELECT * FROM revenue`;
  return data.rows;
}

// ✅ With cache: Database hit once per hour
export const fetchRevenue = unstable_cache(
  async () => {
    const data = await sql`SELECT * FROM revenue`;
    return data.rows;
  },
  ['revenue-data'],        // Cache key
  { revalidate: 3600 }     // Cache for 1 hour (3600 seconds)
);

// Page-level caching
export const revalidate = 300; // Revalidate every 5 minutes

export default async function DashboardPage() {
  const data = await fetchData(); // Cached at page level
  return <Dashboard data={data} />;
}
```

**Improvement after first load:** ~1000ms faster!

---

#### **4. React `cache()` for Request Deduplication**

Prevent duplicate queries within the same request.

```tsx
import { cache } from 'react';

// ✅ Deduplicate calls within same request
export const getUser = cache(async (id: string) => {
  console.log('Fetching user:', id);
  const data = await sql`SELECT * FROM users WHERE id = ${id}`;
  return data.rows[0];
});

// Now if multiple components call getUser('123') in same request:
// - First call: Hits database, caches result
// - Subsequent calls: Return cached result
// - Console shows "Fetching user: 123" only once
```

---

### **Progressive Enhancement**

Ensure your app works without JavaScript (for initial render).

```tsx
// Form with Server Action - works without JS
export default function CreateInvoice() {
  return (
    <form action={createInvoice}>
      <input name="amount" required />
      <button type="submit">Create Invoice</button>
    </form>
  );
}

// Enhanced with loading state when JS available
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Invoice'}
    </button>
  );
}
```

**Project Location:** `app/ui/invoices/create-form.tsx`

---

### **Loading Best Practices**

#### **✅ Do's**

1. **Use Suspense for independent sections**
   ```tsx
   <Suspense fallback={<Skeleton />}>
     <SlowComponent />
   </Suspense>
   ```

2. **Show meaningful skeletons**
   ```tsx
   // Match actual layout
   <CardsSkeleton /> // Not just a spinner
   ```

3. **Parallel fetch when possible**
   ```tsx
   await Promise.all([fetch1(), fetch2(), fetch3()])
   ```

4. **Add loading states to buttons**
   ```tsx
   <button disabled={pending}>
     {pending ? 'Loading...' : 'Submit'}
   </button>
   ```

5. **Use Suspense key for dynamic content**
   ```tsx
   <Suspense key={searchQuery} fallback={<Skeleton />}>
   ```

#### **❌ Don'ts**

1. **Don't show blank screens**
   ```tsx
   // ❌ BAD: Nothing shown while loading
   if (loading) return null;
   
   // ✅ GOOD: Show skeleton
   if (loading) return <Skeleton />;
   ```

2. **Don't wrap everything in one Suspense**
   ```tsx
   // ❌ All-or-nothing loading
   <Suspense fallback={<BigSkeleton />}>
     <FastComponent />
     <SlowComponent />
   </Suspense>
   
   // ✅ Independent loading
   <Suspense fallback={<Skeleton1 />}>
     <FastComponent />
   </Suspense>
   <Suspense fallback={<Skeleton2 />}>
     <SlowComponent />
   </Suspense>
   ```

3. **Don't forget error boundaries**
   ```tsx
   // ✅ Always pair Suspense with error handling
   <ErrorBoundary fallback={<Error />}>
     <Suspense fallback={<Loading />}>
       <Component />
     </Suspense>
   </ErrorBoundary>
   ```

4. **Don't use generic spinners for everything**
   ```tsx
   // ❌ Generic spinner
   <div className="spinner" />
   
   // ✅ Content-aware skeleton
   <TableSkeleton rows={5} />
   ```

---

### **Loading Optimization Checklist**

- [ ] ✅ Route-level `loading.tsx` for page navigation
- [ ] ✅ Component-level Suspense for independent sections
- [ ] ✅ Meaningful skeleton components (not just spinners)
- [ ] ✅ Parallel data fetching with `Promise.all()`
- [ ] ✅ Database indexes for common queries
- [ ] ✅ Caching for expensive operations
- [ ] ✅ React `cache()` for request deduplication
- [ ] ✅ Loading states on interactive elements
- [ ] ✅ Suspense `key` prop for dynamic updates
- [ ] ✅ Progressive enhancement (works without JS)

---

## 🖼️ Image Optimization

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

---

## 🔤 Font Optimization

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

---

## 🔍 Search Optimization

Reduce unnecessary API calls during search with debouncing.

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

---

## 📝 Performance Best Practices Summary

### ✅ Do's

1. **Use Next.js Image component** - Automatic optimization
2. **Lazy load heavy components** - Better initial load
3. **Optimize fonts with next/font** - Zero layout shift
4. **Implement debouncing** - Reduce unnecessary calls
5. **Use Server Components** - Faster rendering
6. **Measure regularly** - Lighthouse + Core Web Vitals
7. **Cache effectively** - Reduce server load
8. **Stream with Suspense** - Progressive rendering

### ❌ Don'ts

1. **Don't use `<img>`** - Use `<Image>` instead
2. **Don't lazy load critical content** - Navigation, hero sections
3. **Don't ignore bundle size** - Analyze regularly
4. **Don't forget image dimensions** - Prevents CLS
5. **Don't over-optimize** - Focus on user-facing improvements
6. **Don't skip loading states** - Better UX
7. **Don't cache user-specific data** - Security risk

---

## 🎯 Quick Checklist

Before deploying:

- [ ] ✅ All images use `<Image>` component
- [ ] ✅ Above-fold images have `priority` prop
- [ ] ✅ Fonts optimized with `next/font`
- [ ] ✅ Heavy components lazy loaded
- [ ] ✅ Search implements debouncing
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ Core Web Vitals in "Good" range
- [ ] ✅ Bundle analyzed for large dependencies
- [ ] ✅ Proper caching strategy implemented
- [ ] ✅ Error boundaries in place
- [ ] ✅ Loading states for async operations

---

## 📚 Related Documentation

- [Next.js Notes](./nextjs-notes.md) - Complete Next.js reference
- [React Notes](./react-notes.md) - React fundamentals and optimization
- [Validation Notes](./validation-notes.md) - Form validation patterns

---

**Last Updated:** December 23, 2025
