'use server';

/**
 * Server Actions Module
 * 
 * All exported functions in this file are automatically treated as Server Actions.
 * These functions can be safely imported and used in both Client and Server Components.
 * 
 * Note: Unused Server Actions are automatically tree-shaken from the final build bundle.
 */


import { z } from 'zod'; // Import Zod for schema validation

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // setup to coerce(change) string to number
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // Schema for creating a new invoice without id and date. Alternative syntax: .omit(['id', 'date'])

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

  const amountInCents = Math.round(amount * 100); // Convert dollars to cents
  const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  /*
   * Alternative approach for forms with many fields:
   * 
   * Method 1: Using FormData.entries() to iterate through all fields
   * Example:
   * for (const [key, value] of formData.entries()) {
   *   console.log(`${key}: ${value}`);
   * }
   * 
   * Method 2: Convert FormData to plain object using Object.fromEntries()
   * Example:
   * const rawFormData = Object.fromEntries(formData.entries());
   * 
   * This approach is useful when you have dynamic or numerous form fields.
   */

  // Development: Log form data for debugging
  // logs seen in console where Next.js server is running
  // not in DevTools
  console.log('=== INVOICE FORM SUBMISSION ===');
  console.log('Raw form data:', rawFormData);
  console.log('================================');
}
