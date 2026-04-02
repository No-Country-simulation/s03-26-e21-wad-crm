export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-clip bg-[url(/images/background.jpg)] bg-cover bg-center bg-no-repeat bg-fixed before:absolute before:inset-0 before:bg-black/25 before:-z-1 z-1">
      <main className="flex-1 flex w-full self-center">{children}</main>
    </div>
  );
}
