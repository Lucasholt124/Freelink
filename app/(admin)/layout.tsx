import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link na Bio",
  description: "Link na Bio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <main className="max-w-7xl lg:mx-auto pt-10 px-4 xl:px-0">
        {children}
      </main>
    </div>
  );
}