// Em /app/(main)/layout.tsx
// (Crie este novo arquivo e pasta)

import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";
import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsappFloatingButton />
    </div>
  );
}