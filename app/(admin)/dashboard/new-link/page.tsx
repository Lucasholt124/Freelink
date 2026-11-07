"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  WorkspaceBoundary,
  usePageWorkspace,
} from "@/components/page-editor/WorkspaceProvider";
function OpenNewLink() {
  const router = useRouter();
  const { selected, withPage } = usePageWorkspace();
  useEffect(() => {
    const path = withPage("/dashboard/links");
    router.replace(`${path}${path.includes("?") ? "&" : "?"}new=1`);
  }, [router, selected?.userId]);
  return <p role="status">Abrindo o editor de links…</p>;
}
export default function NewLinkPage() {
  return (
    <WorkspaceBoundary>
      <OpenNewLink />
    </WorkspaceBoundary>
  );
}
