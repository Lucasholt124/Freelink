import Header from "@/components/Header";

export default function LinkAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header /> {/* Renderiza o seu header principal e funcional */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* 'children' será a sua página de análise (`page.tsx`) */}
        {children}
      </main>
    </div>
  );
}