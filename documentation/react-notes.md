
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