import type { ReactNode } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f8f6fc] px-4 py-10 text-[#2d2735]">
      <Link
        href="/"
        aria-label="Freelinnk — voltar ao início"
        className="mb-8 flex items-center gap-2.5 text-2xl font-bold tracking-tight"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7144e8] text-white">
          <Link2 size={23} aria-hidden="true" />
        </span>
        freelinnk<span className="-ml-2 text-[#7144e8]">.</span>
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
      <Link
        href="/"
        className="mt-7 text-sm text-[#746b80] underline underline-offset-4"
      >
        Voltar ao site
      </Link>
    </main>
  );
}
