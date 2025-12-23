import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}


// In this file, we set up NextAuth with a Credentials provider for authentication.
// This allows users to sign in using a username and password combination.
// NOTE: There are other alternative providers such as OAuth or email
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({ 
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      // Authorize function to validate user credentials
      async authorize(credentials) {
        // Validate credentials using Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        // If validation is successful, proceed to check user in database  
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // Fetch user by email from the database
          const user = await getUser(email);
          if (!user) return null;

          // Compare hashed password with user password
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        console.log('Invalid credentials provided.');
        return null;
      },
    })
  ]
});