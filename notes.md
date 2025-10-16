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

*Last updated: October 16, 2025* 📅