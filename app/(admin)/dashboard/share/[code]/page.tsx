import ShareClient from "@/components/ShareClient";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return <ShareClient code={params.code} />;
}