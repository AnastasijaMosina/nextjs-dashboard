'use server';

/**
 * Server Actions Module
 * 
 * All exported functions in this file are automatically treated as Server Actions.
 * These functions can be safely imported and used in both Client and Server Components.
 * 
 * Note: Unused Server Actions are automatically tree-shaken from the final build bundle.
 */

export async function createInvoice(formData: FormData) {
  // Extract individual form fields
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };

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
