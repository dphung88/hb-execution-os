import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6">
        <Topbar />
        <main className="mt-6 min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
