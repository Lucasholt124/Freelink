
import BillingContent from "@/components/BillingContent";
import React, { Suspense } from "react";


export default function BillingPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <BillingContent />
    </Suspense>
  );
}