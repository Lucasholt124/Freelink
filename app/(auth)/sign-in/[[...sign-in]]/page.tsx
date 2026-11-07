import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <Suspense fallback={<p role="status">Preparando seu acesso…</p>}>
      <AuthForm kind="sign-in" />
    </Suspense>
  );
}
