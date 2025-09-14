// Em /components/LandingHeader.tsx
// (Crie este novo arquivo)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { MobileMenu } from "@/components/MobileMenu";
import { Rocket, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

// Links para o menu de visitantes
const navLinks = [
  { href: "/#features", label: "Recursos", icon: <Rocket className="w-5 h-5" /> },
  { href: "/#pricing", label: "Preços", icon: <CreditCard className="w-5 h-5" /> },
];

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur-lg border-b shadow-sm" : "bg-transparent border-b-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Freelinnk<span className="text-purple-600">.</span>
        </Link>

        {/* Menu Desktop para Visitantes */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
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
            {/* O MobileMenu agora é usado aqui, apenas para visitantes */}
            <div className="md:hidden">
              <MobileMenu navLinks={navLinks} />
            </div>
        </div>
      </div>
    </header>
  );
}