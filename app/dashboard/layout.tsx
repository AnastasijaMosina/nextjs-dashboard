import SideNav from '@/app/ui/dashboard/sidenav';

// this enables partial page rendering. won't be seen in local 
// but can be noticed that production performance is improved 
export const experimental_ppr = true; 

// This is the layout for all /dashboard routes

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
