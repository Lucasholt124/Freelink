
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Participar do Sorteio | Freelinnk",
  description: "Participe do sorteio e concorra a prêmios incríveis!",
};

export default function GiveawayPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}