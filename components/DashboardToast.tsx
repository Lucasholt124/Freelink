"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function DashboardToast() {
  const searchParams = useSearchParams();
  const subscribed = searchParams.get("subscribed");

  useEffect(() => {
    if (subscribed === "true") {
      toast.success("Assinatura realizada com sucesso!");
    }
  }, [subscribed]);

  return null;
}
