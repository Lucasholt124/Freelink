"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";
import { MobileMenu } from "@/components/MobileMenu";
import { LayoutDashboard, Link as LinkIcon, CreditCard, Zap } from "lucide-react";

const loggedInNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/links", label: "Meus Links", icon: <LinkIcon className="w-5 h-5" /> },
  { href: "/dashboard/billing", label: "Meu Plano", icon: <CreditCard className="w-5 h-5" /> },
];

const loggedOutNavLinks = [
  { href: "/#features", label: "Recursos", icon: <Zap className="w-5 h-5" /> },
  { href: "/#pricing", label: "Preços", icon: <CreditCard className="w-5 h-5" /> },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Freelinnk<span className="text-purple-600">.</span>
        </Link>

        <Unauthenticated>
          <nav className="hidden md:flex items-center gap-8">
            {loggedOutNavLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-purple-600">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <SignInButton mode="modal">
                <Button>Comece Grátis</Button>
              </SignInButton>
            </div>
            <div className="md:hidden"><MobileMenu navLinks={loggedOutNavLinks} /></div>
          </div>
        </Unauthenticated>

        <Authenticated>
          <nav className="hidden md:flex items-center gap-8">
            {loggedInNavLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-purple-600">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex"><UserButton afterSignOutUrl="/" /></div>
            <div className="md:hidden"><MobileMenu navLinks={loggedInNavLinks} /></div>
          </div>
        </Authenticated>
      </div>
    </header>
  );
}