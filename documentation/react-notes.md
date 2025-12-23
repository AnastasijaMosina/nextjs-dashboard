
# React Quick Notes: Components, Hooks, and Functions

## 1. React Components: Class vs Function

**Function Components** (modern, recommended):
```jsx
function Hello({ name }) {
	return <h1>Hello, {name}!</h1>;
}
```

**Class Components** (older, less common):
```jsx
class Hello extends React.Component {
	render() {
		return <h1>Hello, {this.props.name}!</h1>;
	}
}
```

**When to use:**
- Use **function components** for most cases. They are simpler and support hooks.
- Use **class components** only if you need legacy features or are working in old codebases.

## 2. React Hooks


Hooks let you use state and other React features in function components. Here are the most common hooks and how to use them:

### useState
Lets you add local state to a function component (e.g., counters, form fields).
```jsx
const [count, setCount] = useState(0);
```
- **When to use:** Any time you need to store and update a value in a component.
- **Tips:** You can use multiple useState calls for different pieces of state.
- **Real-world scenario:** Track the value of a text input in a login form, or keep score in a game.

### useEffect
Runs code after render (side effects: data fetching, subscriptions, timers, etc.).
```jsx
useEffect(() => {
	// Runs after every render by default
	// Return a cleanup function if needed
	return () => {/* cleanup */};
}, [count]); // Only runs when 'count' changes
```
- **When to use:** Fetch data, set up listeners, update the DOM, or clean up resources.
- **Tips:**
	- The dependency array controls when the effect runs.
	- Return a function for cleanup (e.g., remove event listeners).
- **Real-world scenario:** Fetch user profile data from an API when a component loads, or set up a timer that updates every second.

### useMemo
Memoizes (remembers) the result of a calculation until dependencies change.
```jsx
const expensiveValue = useMemo(() => computeExpensive(count), [count]);
```
- **When to use:** Avoid recalculating expensive values on every render.
- **Tips:** Use only for performance optimization; not needed for simple values.
- **Real-world scenario:** Calculate filtered search results from a large dataset only when the search term changes, not on every render.

### useCallback
Memoizes a function so it keeps the same reference between renders unless dependencies change.
```jsx
const handleClick = useCallback(() => setCount(c => c + 1), []);
```
- **When to use:** Pass stable functions to child components or dependencies.
- **Tips:** Useful when passing callbacks to optimized child components (e.g., React.memo).
- **Real-world scenario:** Pass a click handler to a list of todo items so only the changed item re-renders, improving performance.

### Custom Hooks
Create your own hooks to reuse logic across components.
```jsx
function useWindowWidth() {
	const [width, setWidth] = useState(window.innerWidth);
	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	return width;
}
```
- **When to use:** Extract and share logic (e.g., data fetching, event listeners).
- **Real-world scenario:** Create a hook to track if a user is online/offline, or to fetch and cache data for multiple components.

### Other Useful Hooks
**useRef:** Store mutable values that persist across renders (e.g., DOM refs, timers).
```jsx
const inputRef = useRef();
<input ref={inputRef} />
```
- **Real-world scenario:** Focus an input field when a button is clicked, or store a timer ID for clearing intervals.

**useContext:** Access values from React context (global state, themes, etc.).
```jsx
const theme = useContext(ThemeContext);
```
- **Real-world scenario:** Get the current theme (dark/light) or user authentication status from a global context and use it in any component.

## 3. Component Composition

**Component composition** is the practice of building complex UIs by combining simpler, reusable components. It's a fundamental React pattern that promotes code reuse and maintainability.

### Why Composition over Inheritance?
React recommends using composition instead of inheritance to reuse code between components. Composition is more flexible and easier to understand.

### The Children Prop Pattern

The most common composition pattern uses the `children` prop to pass content into components:

```jsx
function Card({ children }) {
	return (
		<div className="card">
			{children}
		</div>
	);
}

// Usage
function App() {
	return (
		<Card>
			<h2>Title</h2>
			<p>Content goes here</p>
		</Card>
	);
}
```

**When to use:**
- Creating wrapper components (containers, layouts, modals)
- Building flexible, reusable UI components
- When you don't know what content will be passed in advance

**Real-world scenario:** Create a Modal component that can display any content, or a Button component that can contain text, icons, or both.

### Named Slots Pattern

Use named props to pass multiple pieces of content to specific locations:

```jsx
function SplitPane({ left, right }) {
	return (
		<div className="split-pane">
			<div className="left-pane">{left}</div>
			<div className="right-pane">{right}</div>
		</div>
	);
}

// Usage
function App() {
	return (
		<SplitPane
			left={<Navigation />}
			right={<MainContent />}
		/>
	);
}
```

**When to use:**
- When you need multiple distinct content areas
- Creating complex layouts (sidebars, headers, footers)
- Building flexible component APIs

**Real-world scenario:** A dashboard layout with sidebar, header, and main content areas that can each display different components.

### Specialization Pattern

Create specialized versions of generic components:

```jsx
// Generic component
function Dialog({ title, message, children }) {
	return (
		<div className="dialog">
			<h1>{title}</h1>
			<p>{message}</p>
			{children}
		</div>
	);
}

// Specialized component
function WelcomeDialog() {
	return (
		<Dialog
			title="Welcome"
			message="Thank you for visiting!"
		>
			<button>Get Started</button>
		</Dialog>
	);
}
```

**When to use:**
- Creating specific use cases of generic components
- Reducing duplication of common configurations
- Building a component library with variants

**Real-world scenario:** Create a generic Alert component, then specialize it into SuccessAlert, ErrorAlert, and WarningAlert with preset styles and icons.

### Composition with Hooks

Hooks enable powerful composition of logic without nesting components:

```jsx
function useFormInput(initialValue) {
	const [value, setValue] = useState(initialValue);
	
	function handleChange(e) {
		setValue(e.target.value);
	}
	
	return {
		value,
		onChange: handleChange
	};
}

// Usage: Compose logic from multiple hooks
function SignupForm() {
	const nameInput = useFormInput('');
	const emailInput = useFormInput('');
	
	return (
		<form>
			<input {...nameInput} placeholder="Name" />
			<input {...emailInput} placeholder="Email" type="email" />
		</form>
	);
}
```

**When to use:**
- Sharing stateful logic between components
- Extracting complex logic from components
- Building reusable behaviors

**Real-world scenario:** Create a `useAuth` hook that provides login/logout functionality to any component, or a `useLocalStorage` hook for persisting state.

### Render Props Pattern

Pass a function as a prop that returns elements to render:

```jsx
function DataFetcher({ url, render }) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	
	useEffect(() => {
		fetch(url)
			.then(res => res.json())
			.then(data => {
				setData(data);
				setLoading(false);
			});
	}, [url]);
	
	return render({ data, loading });
}

// Usage
function App() {
	return (
		<DataFetcher 
			url="/api/users"
			render={({ data, loading }) => 
				loading ? <div>Loading...</div> : <UserList users={data} />
			}
		/>
	);
}
```

**When to use:**
- Sharing component logic with different rendering
- When children prop isn't flexible enough
- Building highly reusable data-fetching components

**Note:** Hooks are now the preferred way to share logic, but render props are still useful in some cases.

### Higher-Order Components (HOC)

A function that takes a component and returns a new enhanced component:

```jsx
function withAuth(Component) {
	return function AuthenticatedComponent(props) {
		const { user, loading } = useAuth();
		
		if (loading) return <div>Loading...</div>;
		if (!user) return <div>Please log in</div>;
		
		return <Component {...props} user={user} />;
	};
}

// Usage
const ProtectedProfile = withAuth(ProfilePage);
```

**When to use:**
- Adding common behavior to multiple components
- Wrapping components with authentication, authorization, or analytics
- Cross-cutting concerns

**Note:** Custom hooks are now preferred over HOCs in most cases, but HOCs are still useful for wrapping third-party components or legacy code.

### Composition Best Practices

1. **Keep components small and focused** - Each component should do one thing well
2. **Use composition over props** - Instead of many boolean props, compose smaller components
3. **Think in terms of containers and presentational components** - Separate logic from UI
4. **Avoid deep nesting** - Extract nested components into separate, named components
5. **Use hooks for logic composition** - Share behavior without component nesting

### Real-world Example: Building a Card System

```jsx
// Base Card component
function Card({ children, className = '' }) {
	return (
		<div className={`card ${className}`}>
			{children}
		</div>
	);
}

// Specialized components
function CardHeader({ children }) {
	return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
	return <div className="card-body">{children}</div>;
}

function CardFooter({ children }) {
	return <div className="card-footer">{children}</div>;
}

// Usage: Compose a complete card
function ProductCard({ product }) {
	return (
		<Card>
			<CardHeader>
				<h3>{product.name}</h3>
			</CardHeader>
			<CardBody>
				<img src={product.image} alt={product.name} />
				<p>{product.description}</p>
			</CardBody>
			<CardFooter>
				<button>Add to Cart</button>
				<span>${product.price}</span>
			</CardFooter>
		</Card>
	);
}
```

**Summary:** Component composition is about building complex UIs from simple, reusable pieces. Use children props, named slots, and hooks to create flexible, maintainable component architectures.


## 4. React 19 New Features

React 19 introduces several new features and improvements that enhance developer experience and application performance.

### The `use` Hook (New in React 19)

The `use` hook is a new primitive that lets you read resources like Promises and Context in a more flexible way than existing hooks.

```jsx
import { use } from 'react';

// Reading a Promise
function UserProfile({ userPromise }) {
	const user = use(userPromise); // Suspends until promise resolves
	return <div>{user.name}</div>;
}

// Reading Context
function ThemeButton() {
	const theme = use(ThemeContext); // Alternative to useContext
	return <button className={theme}>Click me</button>;
}
```

**Key differences from other hooks:**
- Can be called conditionally (unlike other hooks)
- Can be called in loops
- Can be called after early returns
- Works with Promises and Context

**When to use:**
- Reading async data directly in components
- Conditional context reading
- Simplifying async component logic

**Real-world scenario:** Fetch user data in a Server Component and pass the Promise to a Client Component that uses `use()` to read it.

### `useActionState` Hook (Replaces `useFormState`)

Manages form state and handles server actions, perfect for forms with validation and loading states.

```jsx
'use client';
import { useActionState } from 'react';
import { createInvoice } from '@/app/lib/actions';

export default function InvoiceForm() {
	const initialState = { message: null, errors: {} };
	const [state, formAction] = useActionState(createInvoice, initialState);
	
	return (
		<form action={formAction}>
			<input name="amount" />
			{state.errors?.amount && (
				<p className="error">{state.errors.amount}</p>
			)}
			<button type="submit">Submit</button>
		</form>
	);
}
```

**When to use:**
- Forms with server-side validation
- Progressive enhancement (works without JS)
- Server Actions integration

**Real-world scenario:** Create/edit forms that validate on the server and show field-specific errors (as used in your Next.js dashboard project).

### `useOptimistic` Hook

Provides optimistic UI updates while waiting for async operations to complete.

```jsx
'use client';
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
	const [optimisticTodos, addOptimisticTodo] = useOptimistic(
		todos,
		(state, newTodo) => [...state, { ...newTodo, pending: true }]
	);
	
	async function handleAdd(formData) {
		const newTodo = { id: Date.now(), text: formData.get('text') };
		addOptimisticTodo(newTodo);
		await addTodo(newTodo);
	}
	
	return (
		<>
			<form action={handleAdd}>
				<input name="text" />
				<button type="submit">Add</button>
			</form>
			<ul>
				{optimisticTodos.map(todo => (
					<li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
						{todo.text}
					</li>
				))}
			</ul>
		</>
	);
}
```

**When to use:**
- Instant UI feedback for async operations
- Better perceived performance
- Like buttons, todo lists, cart updates

**Real-world scenario:** Show a todo item immediately when added, with a faded appearance until the server confirms it's saved.

### React Compiler (Experimental)

React 19 introduces an automatic compiler that optimizes your components without manual memoization.

**What it does:**
- Automatically memoizes components and values
- Eliminates need for manual `useMemo`, `useCallback`, `React.memo`
- Optimizes re-renders automatically

```jsx
// Before: Manual optimization
const MemoizedComponent = memo(function Component({ data }) {
	const expensiveValue = useMemo(() => computeExpensive(data), [data]);
	const handleClick = useCallback(() => doSomething(), []);
	return <div onClick={handleClick}>{expensiveValue}</div>;
});

// After: Compiler handles it automatically
function Component({ data }) {
	const expensiveValue = computeExpensive(data);
	const handleClick = () => doSomething();
	return <div onClick={handleClick}>{expensiveValue}</div>;
}
```

**Current status:** Experimental, opt-in
**When to use:** Once stable, enable it to get automatic performance optimizations

### Server Components (React 19 + Next.js)

React 19 fully supports Server Components, allowing components to run on the server without sending JavaScript to the client.

```jsx
// Server Component (default in Next.js App Router)
async function UserProfile({ userId }) {
	const user = await db.user.findById(userId); // Direct DB access
	return (
		<div>
			<h1>{user.name}</h1>
			<ClientButton /> {/* Only this sends JS */}
		</div>
	);
}
```

**Benefits:**
- Zero JavaScript for server components
- Direct backend access (no API needed)
- Better performance
- Smaller bundle sizes

**Note:** See `nextjs-notes.md` for comprehensive Server Components documentation.

### Document Metadata (React 19)

React 19 improves how you handle document metadata with better SSR support.

```jsx
function BlogPost({ post }) {
	return (
		<>
			<title>{post.title}</title>
			<meta name="description" content={post.excerpt} />
			<article>
				<h1>{post.title}</h1>
				<p>{post.content}</p>
			</article>
		</>
	);
}
```

**In Next.js App Router:** Use the `metadata` export instead:
```jsx
export const metadata = {
	title: 'My Page',
	description: 'Page description'
};
```

### Asset Loading Improvements

React 19 provides better control over resource loading:

```jsx
import { preload, preinit } from 'react-dom';

// Preload assets
function Component() {
	preload('/font.woff2', { as: 'font' });
	preinit('/script.js', { as: 'script' });
	return <div>Content</div>;
}
```

**When to use:**
- Optimize critical resource loading
- Improve perceived performance
- Better control over loading order

### Form Actions Enhancement

React 19 enhances form handling with better integration of actions:

```jsx
function SearchForm() {
	return (
		<form action="/search">
			<input name="query" />
			<button type="submit">Search</button>
		</form>
	);
}

// With Server Action
function CreateForm() {
	async function create(formData) {
		'use server';
		const data = formData.get('name');
		await db.create(data);
	}
	
	return (
		<form action={create}>
			<input name="name" />
			<button type="submit">Create</button>
		</form>
	);
}
```

### React 19 Improvements Summary

| Feature | Purpose | Status |
|---------|---------|--------|
| `use()` hook | Read Promises/Context flexibly | ✅ Stable |
| `useActionState()` | Form state management | ✅ Stable |
| `useOptimistic()` | Optimistic UI updates | ✅ Stable |
| React Compiler | Auto optimization | 🧪 Experimental |
| Server Components | Zero-JS server rendering | ✅ Stable |
| Document Metadata | Better meta tag handling | ✅ Stable |
| Asset Loading | Resource preloading control | ✅ Stable |

### Migration Tips

1. **`useFormState` → `useActionState`:** Rename in existing code
2. **Start using `use()`:** For conditional context/promise reading
3. **Try `useOptimistic()`:** For better UX in mutations
4. **Monitor React Compiler:** Test when stable for automatic optimizations
5. **Embrace Server Components:** In Next.js for better performance

**Summary:** React 19 brings powerful new primitives for async data, forms, and optimistic updates, plus experimental compiler optimizations. Combined with Server Components, it enables building faster, more efficient applications with less boilerplate code.


## 5. React Query

**React Query** is a popular library for managing server state (data from APIs) in React apps. It makes fetching, caching, updating, and synchronizing data much easier than using hooks like `useEffect` and `useState` alone.

### Why use React Query?
- Handles loading, error, and success states automatically
- Caches data and keeps it up-to-date
- Refetches data when needed (e.g., window refocus, network reconnect)
- Makes code cleaner and easier to maintain

### Basic Example: Fetching Data
First, install React Query:
```bash
npm install @tanstack/react-query
```

Set up the QueryClient in your app:
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			{/* your app components */}
		</QueryClientProvider>
	);
}
```

Use the `useQuery` hook to fetch data:
```jsx
import { useQuery } from '@tanstack/react-query';

function Users() {
	const { data, isLoading, error } = useQuery({
		queryKey: ['users'],
		queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<ul>
			{data.map(user => <li key={user.id}>{user.name}</li>)}
		</ul>
	);
}
```

### Mutations: Changing Data
Use `useMutation` to POST, PUT, or DELETE data:
```jsx
import { useMutation } from '@tanstack/react-query';

function AddUser() {
	const mutation = useMutation({
		mutationFn: newUser => fetch('/api/users', {
			method: 'POST',
			body: JSON.stringify(newUser),
			headers: { 'Content-Type': 'application/json' }
		})
	});

	// Call mutation.mutate(newUser) to add a user
}
```

### Real-world Scenarios
- Fetch a list of products from an API and show loading/error states automatically
- Update a user's profile and refresh the data after saving
- Cache search results so users see instant results when searching again
- Refetch data when the user comes back to the app after being away

### Tips
- Use `useQuery` for GET requests (fetching data)
- Use `useMutation` for POST/PUT/DELETE (changing data)
- React Query works great with REST and GraphQL APIs
- You can easily invalidate and refetch queries after mutations

**Summary:** React Query simplifies data fetching and state management for remote data. It helps you write less code and handle complex scenarios (loading, errors, caching) with ease.

## 6. SWR Library

**SWR** ("stale-while-revalidate") is a lightweight React library for data fetching, caching, and revalidation. It is developed by Vercel and is popular for its simplicity and automatic data updates.

### What is SWR?
- SWR fetches data and keeps it fresh by revalidating in the background.
- It is designed for remote data (APIs) and works well for REST and GraphQL.
- SWR is very easy to use and requires minimal setup.

### Basic Example: Fetching Data
First, install SWR:
```bash
npm install swr
```

Use the `useSWR` hook to fetch data:
```jsx
import useSWR from 'swr';

function fetcher(url) {
	return fetch(url).then(res => res.json());
}

function Profile() {
	const { data, error, isLoading } = useSWR('https://jsonplaceholder.typicode.com/users/1', fetcher);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error!</div>;
	return <div>Name: {data.name}</div>;
}
```

### Key Features
- Automatic caching and background revalidation
- Fast UI updates (shows cached data instantly, then updates)
- Focus and network recovery refetching
- Minimal API (just one main hook: `useSWR`)

### Real-world Scenarios
- Show user profile info and keep it up-to-date automatically
- Display a list of posts that refreshes when the user returns to the page
- Fetch and cache product details for a shop

### Comparison: Normal Fetching vs SWR vs React Query

#### Normal Data Fetching (useEffect + useState)
```jsx
function Profile() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  return <div>Name: {data.name}</div>;
}
```

#### Comparison Table
| Feature                | Normal Fetching (useEffect) | SWR                        | React Query                |
|------------------------|----------------------------|----------------------------|----------------------------|
| API Complexity         | Manual setup               | Very simple (1 hook)       | More powerful, more hooks  |
| Caching                | No                         | Yes                        | Yes                        |
| Background Refetch     | No                         | Yes                        | Yes                        |
| Loading/Error States   | Manual                     | Automatic                  | Automatic                  |
| Mutations (POST/PUT)   | Manual                     | Manual (not built-in)      | Built-in with useMutation  |
| Devtools               | No                         | No official devtools       | Has devtools               |
| Query Invalidation     | Manual                     | Manual                     | Built-in                   |
| Pagination, Infinite   | Manual                     | Manual                     | Built-in                   |
| Code Amount            | Most code                  | Less code                  | Less code                  |

#### Advantages of SWR
- Extremely simple and lightweight
- Great for read-only or mostly read data
- Automatic background updates

#### Disadvantages of SWR
- No built-in mutation support (you handle POST/PUT/DELETE yourself)
- Advanced features (pagination, query invalidation) require manual work
- No official devtools

#### When to use SWR?
- Use SWR for simple data fetching, especially read-only data or when you want minimal setup.
- Use React Query for more complex needs: mutations, pagination, query invalidation, or when you want devtools.

**Summary:** SWR is a great choice for simple, fast, and automatic data fetching. React Query is better for complex data management and advanced scenarios.

## 7. React Caching Patterns

### 🎯 What is Caching in React?

**Caching** in React refers to storing and reusing previously computed values or fetched data to avoid unnecessary recalculations or network requests. React provides several mechanisms for caching at different levels.

#### **Why Cache in React?**

| Benefit | Description |
|---------|-------------|
| ⚡ **Performance** | Avoid expensive recalculations and re-renders |
| 🌐 **Better UX** | Instant data display from cache |
| 📉 **Reduced Load** | Fewer API calls and computations |
| 💾 **Memory Efficiency** | Reuse computed values across renders |

---

### 🔄 React Memoization Hooks

#### **useMemo - Memoize Expensive Calculations**

Cache the result of a computation until dependencies change.

```jsx
import { useMemo } from 'react';

function ProductList({ products, searchTerm }) {
  // ❌ Without useMemo: Filters on every render (even if products/searchTerm unchanged)
  // const filteredProducts = products.filter(p => p.name.includes(searchTerm));
  
  // ✅ With useMemo: Only recalculates when products or searchTerm changes
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...'); // Only logs when dependencies change
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);
  
  return (
    <ul>
      {filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

**When to use:**
- ✅ Expensive calculations (sorting, filtering large arrays)
- ✅ Derived data that doesn't change often
- ✅ Preventing unnecessary child re-renders

**When NOT to use:**
- ❌ Simple, cheap calculations (just do them directly)
- ❌ Values that change on every render anyway
- ❌ Premature optimization (measure first!)

**Real-world scenarios:**
- Filter/sort large datasets
- Calculate statistics from data
- Generate complex derived state

#### **useCallback - Memoize Functions**

Cache a function reference to prevent unnecessary re-renders of child components.

```jsx
import { useState, useCallback } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  
  // ❌ Without useCallback: New function on every render
  // const handleAddTodo = (text) => setTodos([...todos, { id: Date.now(), text }]);
  
  // ✅ With useCallback: Same function reference unless dependencies change
  const handleAddTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  }, []); // Empty deps: function never changes
  
  return (
    <div>
      <TodoForm onAdd={handleAddTodo} /> {/* Won't re-render unnecessarily */}
      <TodoList todos={todos} />
    </div>
  );
}

// Child component wrapped in memo to prevent unnecessary re-renders
const TodoForm = React.memo(({ onAdd }) => {
  const [text, setText] = useState('');
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onAdd(text);
      setText('');
    }}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
});
```

**When to use:**
- ✅ Passing callbacks to optimized child components (React.memo)
- ✅ Functions in useEffect dependencies
- ✅ Event handlers passed to many children

**When NOT to use:**
- ❌ Every function (unnecessary overhead)
- ❌ Functions not passed to child components
- ❌ Functions that need to change often

**Real-world scenarios:**
- Form handlers passed to form components
- Click handlers for list items
- Functions used in useEffect dependencies

---

### 🧩 React.memo - Component Memoization

Prevent component re-renders when props haven't changed.

```jsx
import { memo } from 'react';

// ❌ Without memo: Re-renders every time parent re-renders
function ExpensiveComponent({ data, onAction }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{/* Complex rendering logic */}</div>;
}

// ✅ With memo: Only re-renders when props change
const ExpensiveComponent = memo(function ExpensiveComponent({ data, onAction }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{/* Complex rendering logic */}</div>;
});

// Usage
function Parent() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState({ items: [] });
  
  const handleAction = useCallback(() => {
    // Action logic
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {/* ExpensiveComponent won't re-render when count changes */}
      <ExpensiveComponent data={data} onAction={handleAction} />
    </div>
  );
}
```

**Custom comparison function:**

```jsx
const UserCard = memo(
  ({ user, theme }) => <div>{user.name}</div>,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**When to use:**
- ✅ Components that render often with same props
- ✅ Expensive rendering logic
- ✅ List items in large lists

**When NOT to use:**
- ❌ Components that always get new props
- ❌ Simple, fast components
- ❌ Every component (measure performance first)

---

### 📦 React Server Components Cache (Next.js 15+)

In Next.js with React Server Components, use the `cache()` function to deduplicate requests.

```jsx
import { cache } from 'react';

// ❌ Without cache: Multiple identical queries
export const getUser = async (id) => {
  console.log('Fetching user...'); // Logs multiple times
  return await db.user.findUnique({ where: { id } });
};

// ✅ With cache: Deduplicates within single request
export const getUser = cache(async (id) => {
  console.log('Fetching user...'); // Logs once per unique ID
  return await db.user.findUnique({ where: { id } });
});

// Usage in Server Components
async function UserProfile({ userId }) {
  const user = await getUser(userId); // First call
  return <div>{user.name}</div>;
}

async function UserPosts({ userId }) {
  const user = await getUser(userId); // Cached! No second query
  return <div>Posts by {user.name}</div>;
}

async function Page({ params }) {
  return (
    <div>
      <UserProfile userId={params.id} />
      <UserPosts userId={params.id} /> {/* Reuses cached user */}
    </div>
  );
}
```

**Key points:**
- ✅ Only works in Server Components (Next.js)
- ✅ Caches within single request/render
- ✅ Automatic cleanup after request
- ❌ Not persisted across requests

**Use for:**
- Database queries used in multiple components
- Deduplicating fetch calls in Server Components
- Avoiding waterfalls in data fetching

---

### 🔄 Client-Side Data Caching

#### **React Query (TanStack Query)**

The most popular solution for client-side data caching.

```jsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function Products() {
  // Fetch and cache products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'], // Cache key
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refetch when user returns
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// Mutations with cache invalidation
function AddProductForm() {
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
      // Invalidate products cache to trigger refetch
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

**Key features:**
- ✅ Automatic caching with configurable freshness
- ✅ Background refetching
- ✅ Cache invalidation
- ✅ Optimistic updates
- ✅ Pagination and infinite queries
- ✅ DevTools for debugging

#### **SWR (Stale-While-Revalidate)**

Lightweight alternative to React Query.

```jsx
'use client';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

function Profile() {
  const { data, error, isLoading, mutate } = useSWR('/api/user', fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds
    revalidateOnFocus: true,
    dedupingInterval: 2000, // Dedupe requests within 2 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}
```

---

### 🎯 Caching Strategy Comparison

| Pattern | Scope | Purpose | Use Case |
|---------|-------|---------|----------|
| **useMemo** | Component | Cache computed values | Expensive calculations |
| **useCallback** | Component | Cache function references | Event handlers, callbacks |
| **React.memo** | Component | Prevent re-renders | Expensive components |
| **cache()** | Server (request) | Dedupe DB queries | Server Components |
| **React Query** | Client (app) | API data caching | Client-side data fetching |
| **SWR** | Client (app) | API data caching | Simple client-side fetching |

---

### 🎓 Best Practices

#### **✅ Do's**

1. **Measure before optimizing**
   ```jsx
   // Use React DevTools Profiler to identify slow components
   // Only optimize what needs optimization
   ```

2. **Use useMemo for expensive calculations**
   ```jsx
   const sortedItems = useMemo(() => 
     items.sort((a, b) => a.value - b.value),
     [items]
   );
   ```

3. **Combine memo with useCallback**
   ```jsx
   const MemoizedChild = memo(Child);
   const handleClick = useCallback(() => { /* ... */ }, []);
   <MemoizedChild onClick={handleClick} />
   ```

4. **Use React Query for API calls**
   ```jsx
   // Better than useEffect + useState
   const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
   ```

5. **Cache server-side with cache()**
   ```jsx
   export const getData = cache(async (id) => db.query(id));
   ```

#### **❌ Don'ts**

1. **Don't wrap everything in useMemo**
   ```jsx
   // ❌ Overkill for simple operations
   const doubled = useMemo(() => count * 2, [count]);
   
   // ✅ Just do it directly
   const doubled = count * 2;
   ```

2. **Don't use useCallback without memo**
   ```jsx
   // ❌ Pointless if child isn't memoized
   const handleClick = useCallback(() => { /* ... */ }, []);
   <NonMemoizedChild onClick={handleClick} />
   ```

3. **Don't forget dependency arrays**
   ```jsx
   // ❌ Missing dependencies
   const total = useMemo(() => calculateTotal(items, tax), [items]); // Missing tax!
   
   // ✅ Include all dependencies
   const total = useMemo(() => calculateTotal(items, tax), [items, tax]);
   ```

4. **Don't memoize props objects**
   ```jsx
   // ❌ Doesn't work - new object every time
   <MemoChild config={{ theme: 'dark' }} />
   
   // ✅ Memoize the object
   const config = useMemo(() => ({ theme: 'dark' }), []);
   <MemoChild config={config} />
   ```

---

### 🐛 Common Pitfalls

#### **Pitfall 1: Stale Closures in Memoized Functions**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // ❌ BAD: Captures count = 0, never updates
  const logCount = useCallback(() => {
    console.log(count); // Always logs 0
  }, []); // Empty deps!
  
  // ✅ GOOD: Updates when count changes
  const logCount = useCallback(() => {
    console.log(count);
  }, [count]); // Include count in deps
  
  // ✅ BETTER: Use functional update to avoid dependency
  const increment = useCallback(() => {
    setCount(prev => prev + 1); // No count dependency needed
  }, []);
}
```

#### **Pitfall 2: Memoizing with Object/Array Props**

```jsx
// ❌ BAD: New array/object every render
function Parent() {
  return <MemoChild items={[1, 2, 3]} />; // New array every time!
}

// ✅ GOOD: Memoize the array
function Parent() {
  const items = useMemo(() => [1, 2, 3], []);
  return <MemoChild items={items} />;
}

// ✅ BETTER: Define outside component if static
const ITEMS = [1, 2, 3];
function Parent() {
  return <MemoChild items={ITEMS} />;
}
```

#### **Pitfall 3: React Query Not Invalidating**

```jsx
function App() {
  const queryClient = useQueryClient();
  
  const addItem = useMutation({
    mutationFn: createItem,
    // ❌ BAD: Forgot to invalidate cache
    onSuccess: () => {
      // Cache still shows old data!
    }
  });
  
  // ✅ GOOD: Invalidate to refetch
  const addItem = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
}
```

---

### 📝 Quick Reference

#### **When to Use Each Pattern**

```
Need to cache...
│
├─ Computed value? ──────────────→ useMemo
├─ Function reference? ──────────→ useCallback
├─ Component rendering? ─────────→ React.memo
├─ Server DB query? ─────────────→ cache() (Next.js)
├─ Client API data? ─────────────→ React Query / SWR
└─ Simple local state? ──────────→ Just use useState (don't over-optimize!)
```

#### **Performance Checklist**

1. ✅ Identify slow components with React DevTools Profiler
2. ✅ Use React.memo for expensive list items
3. ✅ Memoize expensive calculations with useMemo
4. ✅ Use useCallback for callbacks to memoized children
5. ✅ Use React Query for all API calls (replaces useEffect + fetch)
6. ✅ In Next.js Server Components, use cache() for DB queries
7. ❌ Don't optimize prematurely - measure first!

---

### 🎓 Summary

**React Caching is about:**
- 🧮 **Memoization**: Cache values/functions with useMemo/useCallback
- 🎨 **Component optimization**: Prevent re-renders with React.memo
- 🗄️ **Server-side**: Dedupe queries with cache() in Server Components
- 🌐 **Client-side data**: Use React Query or SWR for API caching

**Golden Rule:** Don't optimize until you measure. Use React DevTools Profiler to find actual bottlenecks, then apply the appropriate caching pattern.
