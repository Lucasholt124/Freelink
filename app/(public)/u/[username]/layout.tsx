import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link na Bio",
  description: "Link na Bio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}