// This is the main page for the /dashboard route
// page.tsx files in Next.js are the default pages for their respective directories

// dashboard is static, so any data updates won't appear until the next build
// to make it dynamic, we can use 'export const revalidate = 0;' for ISR or fetch data on the client side

// file was moved from app/dashboard/page.tsx to app/dashboard/(overview)/page.tsx
// to enable nested routing for future features like settings, profile, etc.
// (overview) is a special folder name in Next.js that allows for grouping related routes
// it does not appear in the URL
// everything inside (overview) will be part of the /dashboard route
// but not /dashboard/customers or /dashboard/invoices


import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data'; // remove fetchRevenue
// fetchRevenue is slow request, stoppin full page to load
// we will fetch it inside the RevenueChart component instead
import { Suspense } from 'react';
import { RevenueChartSkeleton, LatestInvoicesSkeleton } from '@/app/ui/skeletons';
 
export default async function Page() {
  // const revenue = await fetchRevenue() // delete this line
  // const latestInvoices = await fetchLatestInvoices();
  const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* <RevenueChart revenue={revenue}  /> */}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}