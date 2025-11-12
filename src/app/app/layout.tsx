import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr] bg-neutral-950 text-neutral-100 theme-dark">
      <Topbar />
      <div className="grid grid-cols-1 md:grid-cols-[16rem,1fr]">
        <Sidebar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
