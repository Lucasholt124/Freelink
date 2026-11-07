import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<p role="status">Preparando seu cadastro…</p>}>
      <AuthForm kind="sign-up" />
    </Suspense>
  );
}
