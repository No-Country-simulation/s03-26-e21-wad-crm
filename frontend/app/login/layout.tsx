export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-clip">
      <main className="flex-1 flex">{children}</main>
    </div>
  );
}
