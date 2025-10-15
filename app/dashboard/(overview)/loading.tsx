// loading page appears while the main page is loading
// this is a special file name in Next.js
// it can be used in any route segment to show a loading state while the main content is being fetched

// implementation of loading page is called streaming

import DashboardSkeleton from "@/app/ui/skeletons";

export default function Loading() {
  return <DashboardSkeleton />;
}