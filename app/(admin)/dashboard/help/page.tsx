import type { Metadata } from "next";
import HelpCenter from "@/components/help/HelpCenter";

export const metadata: Metadata = {
  title: "Central de ajuda",
  robots: { index: false, follow: false },
};
export default function HelpPage() {
  return <HelpCenter />;
}
