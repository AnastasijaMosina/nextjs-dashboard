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
import { revalidatePath } from 'next/cache'; // Function to revalidate cached paths in Next.js
import { redirect } from 'next/navigation'; // Import redirect function for navigation
import postgres from 'postgres'; // Import Postgres client for database interactions

const sql = postgres(process.env.DATABASE_URL!,  {ssl: 'require'}); // Initialize Postgres client. SSL required for some hosting providers.

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // setup to coerce(change) string to number
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// Use Zod to update the expected types
const CreateInvoice = FormSchema.omit({ id: true, date: true }); // Schema for creating a new invoice without id and date. Alternative syntax: .omit(['id', 'date'])
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// ACTIONS

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

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

  const amountInCents = Math.round(amount * 100); // Convert dollars to cents
  const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  redirect('/dashboard/invoices'); // Redirect to 'ANOTHER PAGE' the invoices dashboard after creation
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  //evalidatePath('/dashboard/invoices') // don't need revalidation when redirecting
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices'); // Revalidate DATA on /dashboard/invoices page to reflect the new invoice (stays on the same page)
}