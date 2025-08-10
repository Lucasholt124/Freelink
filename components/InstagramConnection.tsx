// Em /components/InstagramConnection.tsx
// (Crie este novo arquivo)

"use client";

import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "./ui/button";
import { Instagram, CheckCircle } from "lucide-react";

// O tipo de conexão que vem do Convex
type Connection = Doc<"connections"> | null;

export function InstagramConnection({ connection }: { connection: Connection }) {
  // Se já estiver conectado, mostramos um status de sucesso
  if (connection) {
    return (
      <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Instagram Conectado</p>
            <p className="text-sm text-green-700">
              Conectado como <strong>@{connection.providerAccountId}</strong> {/* Exibirá o ID por enquanto */}
            </p>
          </div>
        </div>
        <Button variant="destructive" size="sm" disabled>Desconectar (em breve)</Button>
      </div>
    );
  }

  // Se não estiver conectado, mostramos o botão para iniciar o fluxo
  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-gray-800">Conectar com Instagram</p>
        <p className="text-sm text-gray-600">
          Autorize o Freelinnk para analisar seu perfil e habilitar ferramentas avançadas.
        </p>
      </div>
      <Button asChild>
        <Link href="/api/connect/instagram">
          <Instagram className="w-4 h-4 mr-2" /> Conectar Agora
        </Link>
      </Button>
    </div>
  );
}