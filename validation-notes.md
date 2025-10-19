# 🔍 Form Validation in Next.js - Complete Guide

## 🎯 Overview

This project implements **server-side validation** with **client-side error display** using:
- **Zod** for schema validation
- **Server Actions** for form processing
- **useActionState** for state management
- **Progressive Enhancement** for better UX

---

## 🏗️ Architecture Flow

```
User Input → Client Form → Server Action → Zod Validation → Database/Error Response → UI Update
```

### **Visual Flow:**
```
[Form Submit] → [Server Action] → [Zod Schema] → [Valid?] 
                                                    ↓
                                                   No: Return Errors
                                                    ↓
                                               [Display in UI]
                                                    ↓
                                                   Yes: Save to DB
                                                    ↓
                                               [Redirect Success]
```

---

## 🧩 Key Components

### **1. Zod Schema Definition**

```typescript
import { z } from 'zod';

const FormSchema = z.object({
  // String validation with minimum length
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }).min(1, 'Please select a customer'),
  
  // Number validation with coercion and range check
  amount: z.coerce
    .number({
      invalid_type_error: 'Please enter an amount',
    })
    .gt(0, 'Please enter an amount greater than $0'),
    
  // Enum validation for specific values
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status',
  }),
  
  date: z.string(),
});

// Create validation schema (omit auto-generated fields)
const CreateInvoice = FormSchema.omit({ id: true, date: true });
```

### **2. State Type Definition**

```typescript
export type State = {
  errors?: {
    customerId?: string[];  // Array of error messages
    amount?: string[];
    status?: string[];
  };
  message?: string | null;  // General error message
};
```

### **3. Server Action Implementation**

```typescript
export async function createInvoice(prevState: State, formData: FormData) {
  // Step 1: Extract form data
  console.log('Raw form data:');
  console.log('customerId:', formData.get('customerId'));
  console.log('amount:', formData.get('amount'));
  console.log('status:', formData.get('status'));

  // Step 2: Validate with Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // Step 3: Handle validation failure
  if (!validatedFields.success) {
    console.log('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Step 4: Process validated data
  const { customerId, amount, status } = validatedFields.data;
  
  try {
    // Database operation
    await sql`INSERT INTO invoices ...`;
    
    // Success: redirect
    redirect('/dashboard/invoices');
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.' };
  }
}
```

### **4. Client Component Setup**

```tsx
'use client'; // Required for useActionState

import { useActionState } from 'react';

export default function Form({ customers }) {
  // Initial state
  const initialState = {
    message: '',
    errors: {} as {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    }
  };

  // State management hook
  const [state, formAction] = useActionState(createInvoice, initialState);

  return (
    <form action={formAction}>
      {/* Form fields with error display */}
    </form>
  );
}
```

---

## 🎨 Error Display Patterns

### **Field-Specific Errors**

```tsx
{/* Customer Selection Field */}
<select
  name="customerId"
  aria-describedby="customer-error"  // Accessibility
>
  <option value="">Select a customer</option>
  {/* Options */}
</select>

{/* Error Display */}
<div id="customer-error" aria-live="polite" aria-atomic="true">
  {state.errors?.customerId &&
    state.errors.customerId.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))}
</div>
```

### **General Error Message**

```tsx
{/* Global error at bottom of form */}
{state.message && (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-600">{state.message}</p>
  </div>
)}
```

---

## 📊 Validation Rules Breakdown

| Field | Type | Rules | Error Messages |
|-------|------|-------|----------------|
| **customerId** | String | `.min(1)` | "Please select a customer" |
| **amount** | Number | `.coerce.gt(0)` | "Please enter an amount greater than $0" |
| **status** | Enum | `['pending', 'paid']` | "Please select an invoice status" |

---

## 🔄 Data Processing Flow

### **1. Form Data Extraction**
```typescript
// FormData values are always strings or null
formData.get('customerId')  // "123" or ""
formData.get('amount')      // "100.50" or ""
formData.get('status')      // "pending" or null
```

### **2. Zod Processing**
```typescript
// Coercion and validation
z.coerce.number()  // "100.50" → 100.5
z.string().min(1)  // "" → validation error
z.enum(['pending', 'paid'])  // null → validation error
```

### **3. Error Formatting**
```typescript
// Zod error structure
validatedFields.error.flatten().fieldErrors
// Result: { customerId: ["Error message"], amount: ["Error message"] }
```

---

## 🎯 Validation Strategies

### **Client-Side Enhancement**
```tsx
// HTML5 validation (progressive enhancement)
<input 
  type="number" 
  step="0.01" 
  required        // Basic browser validation
  min="0.01"      // Browser-level constraint
/>

<select required>  // Browser validation for selection
```

### **Server-Side Security**
```typescript
// Always validate on server (security)
const validatedFields = CreateInvoice.safeParse(data);
// Never trust client-side validation alone
```

---

## 🛠️ Common Validation Patterns

### **String Validation**
```typescript
// Basic string
z.string()

// Required string (not empty)
z.string().min(1, "Field is required")

// Email validation
z.string().email("Invalid email format")

// Custom validation
z.string().refine(val => val !== "admin", "Username cannot be 'admin'")
```

### **Number Validation**
```typescript
// Basic number
z.number()

// String to number conversion
z.coerce.number()

// Range validation
z.number().min(0).max(100)
z.number().positive()  // > 0
z.number().int()       // Integer only
```

### **Enum Validation**
```typescript
// Specific values only
z.enum(['option1', 'option2', 'option3'])

// With custom error
z.enum(['pending', 'paid'], {
  invalid_type_error: "Status must be pending or paid"
})
```

### **Array Validation**
```typescript
// Array of strings
z.array(z.string())

// Non-empty array
z.array(z.string()).nonempty("At least one item required")

// Array with min/max length
z.array(z.string()).min(2).max(10)
```

---

## 🔍 Debugging Tips

### **1. Console Logging**
```typescript
// Log raw form data
console.log('Form data:', Object.fromEntries(formData.entries()));

// Log validation results
console.log('Validation success:', validatedFields.success);
console.log('Errors:', validatedFields.error?.flatten().fieldErrors);
```

### **2. Error Investigation**
```typescript
// Detailed error analysis
if (!validatedFields.success) {
  console.log('Full error object:', validatedFields.error);
  console.log('Formatted errors:', validatedFields.error.flatten());
  console.log('Field errors:', validatedFields.error.flatten().fieldErrors);
}
```

### **3. Network Tab Monitoring**
- Check browser DevTools Network tab
- Look for form submissions returning error state
- Verify server responses contain error data

---

## 🚀 Best Practices

### **✅ Do's**
- Always validate on server-side for security
- Use TypeScript for better error catching
- Provide clear, actionable error messages
- Use progressive enhancement (HTML5 + Server validation)
- Test with various input combinations
- Use ARIA attributes for accessibility

### **❌ Don'ts**
- Don't rely only on client-side validation
- Don't trust any data from the frontend
- Don't ignore accessibility in error display
- Don't use generic error messages
- Don't forget to handle edge cases (null, undefined, empty strings)

---

## 🔧 Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|---------|
| **Errors not showing** | Wrong field names in state | Check state.errors field names match |
| **Validation always passes** | Missing validation rules | Add .min(1) for required fields |
| **Numbers not validating** | String "0" passes validation | Use .gt(0) instead of .min(0) |
| **Enum validation fails** | FormData returns null for unchecked | Expected behavior for radio/select |
| **TypeScript errors** | State type mismatch | Update State type definition |

---

## 💡 Advanced Patterns

### **Conditional Validation**
```typescript
const schema = z.object({
  type: z.enum(['individual', 'business']),
  taxId: z.string().optional()
}).refine(data => {
  if (data.type === 'business') {
    return data.taxId && data.taxId.length > 0;
  }
  return true;
}, "Business accounts require Tax ID");
```

### **Cross-Field Validation**
```typescript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
```

### **Async Validation**
```typescript
// In server action
const existingUser = await checkUserExists(email);
if (existingUser) {
  return { errors: { email: ['Email already exists'] }};
}
```

---

*Last updated: October 19, 2025* 📅