import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/tasks/queries";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col px-4 py-4 md:px-8 md:py-6">
        <Topbar />
        <main className="mt-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
