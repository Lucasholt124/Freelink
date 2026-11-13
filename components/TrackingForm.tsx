"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  usePageWorkspace,
  WorkspaceBoundary,
} from "@/components/page-editor/WorkspaceProvider";
import TrackingWorkspace from "@/components/tracking/TrackingWorkspace";
import { trackingPayload, type TrackingValues } from "@/lib/tracking";

export function TrackingForm() {
  return (
    <WorkspaceBoundary>
      <TrackingController />
    </WorkspaceBoundary>
  );
}

export function TrackingController() {
  const { pages, selected, selectPage, status } = usePageWorkspace();
  const settings = useQuery(
    api.tracking.getMyTrackingIds,
    status === "ready" && selected ? { userId: selected.userId } : "skip",
  );
  const save = useMutation(api.tracking.saveTrackingIds);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
    if (settings !== undefined) return;
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [selected?.userId, settings === undefined]);
  const availablePages = pages.map((page) => ({
    id: page.userId,
    name: page.displayName,
    username: page.username,
    isMain: page.isMain,
    color: page.accentColor,
  }));
  async function savePage(pageId: string, values: TrackingValues) {
    await save(trackingPayload(availablePages, pageId, values));
  }
  return (
    <TrackingWorkspace
      pages={availablePages}
      selectedId={selected?.userId ?? ""}
      onSelect={selectPage}
      settings={settings}
      loading={settings === undefined && !timedOut}
      loadError={timedOut}
      onSave={savePage}
    />
  );
}
