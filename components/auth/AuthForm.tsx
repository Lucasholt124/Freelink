"use client";

import { useEffect, useState } from "react";
import { ClerkLoaded, ClerkLoading, SignIn, SignUp } from "@clerk/nextjs";

export default function AuthForm({ kind }: { kind: "sign-in" | "sign-up" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const loading = (
    <p className="py-8 text-center text-sm text-[#746b80]" role="status">
      Preparando seu acesso…
    </p>
  );
  // Clerk can already be loaded after client navigation. Keep the initial
  // server and browser markup identical before mounting its interactive UI.
  if (!mounted) return loading;
  const appearance = { elements: { rootBox: "w-full", cardBox: "w-full" } };
  return (
    <>
      <ClerkLoading>{loading}</ClerkLoading>
      <ClerkLoaded>
        {kind === "sign-in" ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/onboarding"
            appearance={appearance}
          />
        ) : (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/onboarding"
            signInFallbackRedirectUrl="/dashboard"
            appearance={appearance}
          />
        )}
      </ClerkLoaded>
    </>
  );
}
