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

## 🔄 Next.js Data Management: revalidate vs redirect

### 🔄 **revalidate**

#### **What it does:**
- **Refreshes cached data** on the current page
- **Stays on the same page** - no navigation happens
- **Updates the UI** with fresh data from the server

#### **When to use:**
- After creating/updating/deleting data
- When you want to show updated data immediately
- User stays on the current page but sees fresh content

---

### 🚀 **redirect**

#### **What it does:**
- **Navigates the user** to a different page
- **Changes the URL** in the browser
- **Loads a completely new page**

#### **When to use:**
- After successful form submission
- When you want to navigate somewhere else
- Prevent duplicate submissions (PRG pattern)

---

## 📊 revalidate vs redirect Comparison

| Feature | 🔄 **revalidate** | 🚀 **redirect** |
|---------|-------------------|-----------------|
| **Page Change** | ❌ Stays on same page | ✅ Navigates to new page |
| **URL Change** | ❌ URL stays the same | ✅ URL changes |
| **Purpose** | 🔄 Refresh data | 🧭 Navigate user |
| **User Experience** | Sees updated content | Goes to different page |
| **Cache** | ♻️ Clears cache for specified path | 🆕 Loads fresh page |
| **Network Request** | 🔄 Background data refresh | 🌐 Full page navigation |
| **Use Case** | Update current view | Change user location |

---

## 💻 Code Examples

### **revalidate Example:**
```tsx
import { revalidatePath } from 'next/cache';

export async function addComment(formData: FormData) {
  await saveComment(formData);
  revalidatePath('/blog/post-123'); // Show new comment on same page
  // User stays on blog post, sees new comment appear
}
```

### **redirect Example:**
```tsx
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
  const invoice = await saveInvoice(formData);
  redirect('/dashboard/invoices'); // Take user to invoices page
  // User is navigated to invoices list
}
```

### **Combined Usage:**
```tsx
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
  await saveInvoice(formData);
  
  revalidatePath('/dashboard/invoices'); // Ensure invoices list is fresh
  redirect('/dashboard/invoices');       // Navigate to invoices page
}
```

---

## 🎯 Real-world Usage Patterns

### **Use `revalidate` when:**
- 👍 Adding likes to a post
- 💬 Adding comments to a discussion
- ✅ Marking tasks as complete
- 🔄 Refreshing dashboard data

### **Use `redirect` when:**
- 📝 Creating new records (forms)
- 🔐 After login/logout
- ❌ Deleting items
- 🧭 Navigation after actions

---

## 💡 **Pro Tip: PRG Pattern**

**PRG Pattern** (Post-Redirect-Get): After a successful form submission, always redirect to prevent users from accidentally resubmitting the form if they refresh the page!

```tsx
// ✅ Good: PRG Pattern
export async function createInvoice(formData: FormData) {
  await saveInvoice(formData);           // POST: Save data
  revalidatePath('/dashboard/invoices'); // Refresh cache
  redirect('/dashboard/invoices');       // GET: Navigate to fresh page
}

// ❌ Bad: No redirect
export async function createInvoice(formData: FormData) {
  await saveInvoice(formData);           // POST: Save data
  // User stays on form - refresh = duplicate submission!
}
```

**The pattern:** **Create data → revalidate cache → redirect user** 🔄➡️🚀

---

## ♿ Accessibility (A11y) in Next.js

### 🛠️ **Accessibility Tools & Configuration**

#### **ESLint Plugin: jsx-a11y**
- **Package**: `eslint-plugin-jsx-a11y`
- **Purpose**: Catches accessibility issues during development
- **Integration**: Added to `.eslintrc.json` configuration

#### **Configuration Setup:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"]
}
```

---

### 📋 **Accessibility Rules Implemented**

| Rule | Level | Purpose |
|------|-------|---------|
| **jsx-a11y/alt-text** | Error | Images must have meaningful alt text |
| **jsx-a11y/aria-props** | Error | ARIA properties must be valid |
| **jsx-a11y/aria-proptypes** | Error | ARIA property values must be valid |
| **jsx-a11y/aria-unsupported-elements** | Error | Elements must support ARIA roles |
| **jsx-a11y/role-has-required-aria-props** | Error | Roles must have required ARIA properties |
| **jsx-a11y/role-supports-aria-props** | Error | ARIA props must be supported by role |
| **jsx-a11y/img-redundant-alt** | Error | Avoid redundant alt text (e.g., "image of") |
| **jsx-a11y/no-redundant-roles** | Error | Don't use redundant roles |
| **jsx-a11y/anchor-is-valid** | Error | Links must be properly formed |
| **jsx-a11y/click-events-have-key-events** | Warning | Click handlers need keyboard support |
| **jsx-a11y/no-static-element-interactions** | Warning | Interactive elements need proper roles |

---

### 🎯 **Common Accessibility Patterns in Project**

#### **Image Accessibility:**
```tsx
// ✅ Good: Meaningful alt text
<Image
  src={invoice.image_url}
  width={28}
  height={28}
  alt={`${invoice.name}'s profile picture`}
/>

// ❌ Bad: Missing or generic alt text
<Image src="/logo.png" /> // Missing alt
<Image src="/icon.png" alt="image" /> // Generic alt
```

#### **Form Accessibility:**
```tsx
// ✅ Good: Proper labels and ARIA
<label htmlFor="customer" className="mb-2 block text-sm font-medium">
  Choose customer
</label>
<select
  id="customer"
  name="customerId"
  aria-describedby="customer-error"
>
  <option value="" disabled>Select a customer</option>
</select>

// ✅ Good: Screen reader only text
<span className="sr-only">Search</span>
```

#### **Interactive Elements:**
```tsx
// ✅ Good: Proper button semantics
<Button type="submit">Create Invoice</Button>

// ✅ Good: Link semantics for navigation
<Link href="/dashboard/invoices">
  Cancel
</Link>

// ❌ Bad: Div with click handler (without keyboard support)
<div onClick={handleClick}>Clickable</div>
```

---

### 🔍 **How to Check Accessibility**

#### **1. Run ESLint:**
```bash
pnpm lint
```

#### **2. Manual Testing:**
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
- **Color Contrast**: Ensure sufficient contrast ratios

#### **3. Browser DevTools:**
- **Lighthouse Accessibility Audit**
- **Chrome DevTools Accessibility Panel**
- **Firefox Accessibility Inspector**

---

### 🎨 **Accessibility Best Practices Used**

#### **Visual Design:**
- **Color Contrast**: Meet WCAG AA standards (4.5:1 for normal text)
- **Focus Indicators**: Visible focus rings on interactive elements
- **Responsive Design**: Works across different screen sizes and zoom levels

#### **Semantic HTML:**
- **Proper Headings**: Hierarchical heading structure (h1 → h2 → h3)
- **Form Labels**: Every form input has associated labels
- **Button vs Link**: Buttons for actions, links for navigation

#### **ARIA Usage:**
- **aria-describedby**: Link form controls to error messages
- **role**: Provide semantic meaning when HTML isn't enough
- **aria-label**: Provide accessible names for complex components

---

### 🚨 **Common Issues & Solutions**

| Issue | Solution | Example |
|-------|----------|---------|
| **Missing alt text** | Add descriptive alt attribute | `alt="User profile picture"` |
| **Unlabeled form inputs** | Use proper label association | `<label htmlFor="email">` |
| **Poor color contrast** | Use darker colors or different approach | Check with contrast checker |
| **No keyboard support** | Add keyboard event handlers | `onKeyDown` with `onClick` |
| **Missing focus indicators** | Ensure CSS doesn't remove `:focus` | Use `focus:` Tailwind classes |

---

### 💡 **Pro Tips for Accessibility**

1. **Test Early**: Run `pnpm lint` frequently during development
2. **Use Semantic HTML**: Choose the right HTML element for the job
3. **Test with Keyboard**: Navigate your app using only keyboard
4. **Screen Reader Testing**: Test with actual assistive technology
5. **Color Isn't Enough**: Don't rely solely on color to convey information

---

### 🔧 **Project-Specific A11y Setup**

#### **Tailwind Classes for Accessibility:**
```tsx
// Screen reader only text
className="sr-only"

// Focus styles
className="focus:ring-2 focus:ring-blue-500"

// High contrast borders
className="border-gray-200 focus:border-blue-500"
```

#### **Next.js Image Optimization + A11y:**
- **Automatic lazy loading** for better performance
- **Responsive images** for different screen sizes  
- **Required alt attributes** enforced by linting

---

*Last updated: October 19, 2025* 📅





