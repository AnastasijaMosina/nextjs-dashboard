# 📚 Next.js Learning Notes

## 🖥️ Server vs Client Components in Next.js

### 🌐 Server Components (Default)

#### 📍 **Where they run:**
- 🏗️ Execute on the **server** during build time or request time
- 📄 HTML is generated on the server and sent to the browser

#### ✨ **Characteristics:**
- 📦 **No JavaScript bundle** - Don't add to client-side JavaScript
- 🔧 **Server resource access** - Databases, file system, environment variables
- ⚡ **Better performance** - Faster initial page loads
- 🚫 **No interactivity** - Can't use event handlers, state, or browser APIs

#### 🔍 **How to identify:**
- ❌ No `'use client'` directive at the top
- ⏳ Can be `async` functions
- 📂 Can directly import server-only modules
- 🎯 Default in App Router

---

### 💻 Client Components

#### 📍 **Where they run:**
- 🌐 Execute in the **browser** after being downloaded
- 📥 JavaScript is sent to the client and runs there

#### ✨ **Characteristics:**
- 🎯 **Interactive** - Can use event handlers, state, effects
- 🔧 **Browser APIs** - Access to localStorage, geolocation, etc.
- 📦 **Larger bundle** - Adds to client-side JavaScript
- 🚫 **No server access** - Can't directly access databases or server resources

#### 🔍 **How to identify:**
- ✅ Has `'use client'` directive at the top of the file
- 🪝 Can use React hooks (`useState`, `useEffect`, etc.)
- 🌐 Can use browser APIs
- 🎮 Can handle user interactions

---

## 🎯 When to Use Which?

### 🖥️ **Use Server Components for:**
- 📊 Data fetching
- 🔍 SEO content
- 🏗️ Static layouts
- ⚡ Performance-critical content

### 💻 **Use Client Components for:**
- 🎮 User interactions
- 📱 State management
- 🌐 Browser APIs
- ⚡ Real-time features

---

## 💡 **Key Principle**
> **Server by default, Client when you need interactivity** 

---

## 📝 Code Examples

### Server Component Example:
```tsx
// ✅ Server Component (default - no 'use client')
import { db } from '@/lib/database';

export default async function UserProfile() {
  const user = await db.user.findFirst(); // ✅ Can access database
  
  return <div>Hello {user.name}</div>;
  // ❌ Can't use onClick, useState, etc.
}
```

### Client Component Example:
```tsx
// ✅ Client Component
'use client'; // 👈 This directive makes it a Client Component

import { useState } from 'react';

export default function Search({ placeholder }) {
  const [query, setQuery] = useState(''); // ✅ Can use state
  
  const handleSearch = (e) => { // ✅ Can use event handlers
    setQuery(e.target.value);
  };
  
  return (
    <input 
      onChange={handleSearch} // ✅ Interactive
      placeholder={placeholder} 
    />
  );
}
```

---

## 🎭 Visual Comparison

| Feature | 🖥️ Server Component | 💻 Client Component |
|---------|-------------------|-------------------|
| **JavaScript Bundle** | ❌ None | ✅ Added to bundle |
| **Interactivity** | ❌ Static | ✅ Interactive |
| **Server Access** | ✅ Direct access | ❌ No access |
| **Performance** | ⚡ Faster initial load | 📦 Larger bundle |
| **Use Cases** | 📊 Data, SEO, Static | 🎮 Interactions, State |

---

## 🚀 Rendering Strategies in Next.js

### 🔧 Static Rendering (SSG - Static Site Generation)

#### 📍 **How it works:**
- 📦 Pages are pre-built at **build time**
- 📄 HTML is generated once and served from CDN
- ⚡ Fastest possible loading times

#### ✨ **Characteristics:**
- 🏎️ **Lightning fast** - No server processing needed
- 💰 **Cost effective** - Can be served from CDN
- 🔍 **SEO friendly** - Content is immediately available to crawlers
- 📊 **Perfect for static content** - Blogs, marketing pages, documentation

#### 🎯 **Best for:**
- 📝 Blog posts
- 🏪 Product catalogs
- 📋 Documentation sites
- 🎨 Marketing pages

---

### ⚡ Dynamic Rendering (SSR - Server-Side Rendering)

#### 📍 **How it works:**
- 🔄 Pages are rendered on **every request**
- 🖥️ Server generates fresh HTML for each user
- ⏳ User waits for complete page generation

#### ✨ **Characteristics:**
- 🔄 **Always fresh** - Data is up-to-date on every request
- 🐌 **Slower TTFB** - Server processing time required
- 💻 **Server resources** - Requires server capacity
- 👤 **Personalized content** - Can show user-specific data

#### 🎯 **Best for:**
- 👤 User dashboards
- 🛒 Shopping carts
- 📊 Real-time data displays
- 🔐 Personalized content

---

### 🌟 Partial Prerendering (PPR) - Best of Both Worlds

#### 📍 **How it works:**
- 🏗️ **Static shell** is prerendered and served instantly
- 🔄 **Dynamic parts** are streamed in as they become available
- 👀 User sees layout immediately, content fills progressively

#### ✨ **Characteristics:**
- ⚡ **Fast initial load** - Static shell loads instantly (< 100ms)
- 🔄 **Fresh dynamic data** - Dynamic content streams in real-time
- 🎯 **Granular control** - Mix static and dynamic on same page
- 🌊 **Streaming** - Progressive content loading

#### 🎯 **Best for:**
- 📊 Dashboards with static navigation + dynamic data
- 🛍️ E-commerce pages with static product info + dynamic inventory
- 📰 News sites with static layout + dynamic articles
- 👤 Social media feeds with static UI + dynamic posts

---

## 📊 Rendering Strategies Comparison

| Feature | 🔧 Static (SSG) | ⚡ Dynamic (SSR) | 🌟 Partial Prerendering |
|---------|-----------------|------------------|------------------------|
| **Loading Speed** | 🏎️ Fastest | 🐌 Slowest | ⚡ Fast initial + Progressive |
| **Data Freshness** | 📅 Build-time only | 🔄 Always fresh | 🎯 Mixed (static + fresh) |
| **Server Load** | ❌ None | 💻 High | 📉 Reduced |
| **SEO** | 🔍 Perfect | 🔍 Good | 🔍 Perfect |
| **Personalization** | ❌ None | ✅ Full | 🎯 Dynamic parts only |
| **Cost** | 💰 Lowest | 💸 Highest | 💵 Medium |
| **Complexity** | 😊 Simple | 😐 Medium | 🤔 Advanced |

---

## 🎯 When to Use Each Strategy

### 🔧 **Choose Static Rendering when:**
- Content doesn't change frequently
- No user-specific data needed
- Performance is critical
- Want to minimize server costs

### ⚡ **Choose Dynamic Rendering when:**
- Content changes frequently
- Heavy personalization required
- Real-time data is essential
- Server resources are abundant

### 🌟 **Choose Partial Prerendering when:**
- Need both speed AND fresh data
- Complex pages with mixed content
- Want to optimize Core Web Vitals
- Building modern, interactive applications

---

## 💻 Code Examples

### Static Rendering:
```tsx
// Automatically static - no dynamic data
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>This content is generated at build time</p>
    </div>
  );
}
```

### Dynamic Rendering:
```tsx
// Dynamic due to searchParams
export default async function UserDashboard(props) {
  const searchParams = await props.searchParams;
  const userData = await fetchUserData(searchParams.userId);
  
  return <div>Welcome {userData.name}</div>;
}
```

### Partial Prerendering:
```tsx
export default function Dashboard() {
  return (
    <div>
      {/* ✅ Static: Prerendered shell */}
      <header>Dashboard</header>
      <nav>Navigation Menu</nav>
      
      {/* 🔄 Dynamic: Streamed content */}
      <Suspense fallback={<Skeleton />}>
        <UserProfile /> {/* Fetches user data */}
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <RecentTransactions /> {/* Fetches transaction data */}
      </Suspense>
    </div>
  );
}
```

---

## 🎨 Visual Flow Comparison

### Static Rendering Flow:
```
Build Time: [Generate HTML] → CDN: [Serve HTML] → User: [Instant Load] ⚡
```

### Dynamic Rendering Flow:
```
Request → Server: [Fetch Data + Generate HTML] → User: [Complete Page] 🐌
         (2-3 seconds)                              (0 seconds visible)
```

### Partial Prerendering Flow:
```
Request → CDN: [Static Shell] → User: [Layout Visible] → [+ Dynamic Content 1] → [+ Dynamic Content 2]
         (100ms)               (Immediate)           (500ms)              (1s)
```

---





