// app/giveaway/[id]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Participar do Sorteio | Freelinnk",
  description: "Participe do sorteio e concorra a prêmios incríveis!",
};

export default function GiveawayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout limpo - sem header/footer do app principal
  return <>{children}</>;
}