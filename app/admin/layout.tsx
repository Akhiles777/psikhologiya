export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="border-b border-neutral-light/60 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-display text-lg font-semibold text-foreground">
            Админ-панель
          </span>
          <a
            href="/"
            className="text-sm text-neutral-dark hover:text-primary"
          >
            На сайт
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
