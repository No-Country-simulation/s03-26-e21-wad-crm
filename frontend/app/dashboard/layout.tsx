import { Header } from "@src/components/layout/Header";
import { Sidebar } from "@src/components/layout/Sidebar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-clip">
      <Sidebar />
      <Header />
      <main className="col-start-2 row-start-2 w-full h-full flex gap-8 p-4 min-h-[300vh] bg-neutral-800">{children}</main>
    </div>
  );
}
