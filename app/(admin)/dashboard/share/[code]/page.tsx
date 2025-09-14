import ShareClient from "@/components/ShareClient";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function Page({ params }: PageProps) {
  const { code } = await params;
  return <ShareClient code={code} />;
}