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
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.DATABASE_URL!,  {ssl: 'require'}); // Initialize Postgres client. SSL required for some hosting providers.

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.', // setup custom error message for invalid type
  }),
  amount: z.coerce.number() // setup to coerce(change) string to number
    .gt(0, { message: 'Please enter an amount greater than $0.', // setup custom error message for amount less than or equal to 0
  }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// Use Zod to update the expected types
const CreateInvoice = FormSchema.omit({ id: true, date: true }); // Schema for creating a new invoice without id and date. Alternative syntax: .omit(['id', 'date'])
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  message?: string | null;
  errors?: {};
};

// ACTIONS

export async function createInvoice(prevState: State, formData: FormData) { // preState contains previous state info passed from useActionState hook
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({ // changed to safeParse to handle validation errors
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

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

  // Prepare the data for insertion into the database.
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // Convert dollars to cents
  const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // revalidatePath('/dashboard/invoices') // if it is disabled -> after making error in creating invoice new value will not show
  redirect('/dashboard/invoices'); // Redirect to 'ANOTHER PAGE' the invoices dashboard after creation
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update invoice.');
  }
 
  revalidatePath('/dashboard/invoices') // need in case of edit error -> to show the changes
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices'); // Revalidate DATA on /dashboard/invoices page to reflect the new invoice (stays on the same page)
}

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