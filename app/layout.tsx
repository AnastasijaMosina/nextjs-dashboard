import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

// This is the root layout that wraps the entire application

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
