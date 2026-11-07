import BillingContent from "@/components/BillingContent";
import React, { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plano e cobrança",
  robots: { index: false, follow: false },
};

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="py-12 text-center text-sm text-slate-500">
          Carregando seus planos…
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
