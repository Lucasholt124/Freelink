"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, ShieldCheck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// IMPORTANTE: Substitua pelo seu ID de admin do Clerk
const ADMIN_USER_ID = "user_2pDsdfaGFASDFasd"; // SUBSTITUA AQUI PELO SEU ID!

function AdminInstagramContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Removi a query isUserAdmin que não estava sendo usada
  // Verificação está sendo feita diretamente com ADMIN_USER_ID

  // Buscar token existente
  const adminToken = useQuery(api.connections.getAdminInstagramToken);

  useEffect(() => {
    if (isLoaded && user) {
      if (user.id === ADMIN_USER_ID) {
        setIsAdmin(true);
      } else {
        toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
        router.push("/");
      }
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    // Verificar status da conexão
    const status = searchParams.get('status');
    if (status === 'connected') {
      toast.success("Instagram conectado com sucesso!");
    } else if (status === 'error') {
      toast.error("Erro ao conectar o Instagram. Tente novamente.");
    }
  }, [searchParams]);

  const connectInstagram = () => {
    setIsConnecting(true);
    window.location.href = "/api/connect/instagram";
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>Acesso negado. Apenas administradores.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Painel de Admin - Conexão Instagram
          </CardTitle>
          <CardDescription>
            Configure a conexão master do Instagram para permitir que todos os usuários extraiam comentários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da Conexão */}
          {adminToken?.isValid ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    Instagram conectado com sucesso!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Todos os usuários agora podem extrair comentários de posts públicos.
                  </p>
                  <Button
                    onClick={connectInstagram}
                    variant="outline"
                    className="mt-4"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reconectando...
                      </>
                    ) : (
                      <>
                        <Instagram className="w-4 h-4 mr-2" />
                        Reconectar Instagram
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Instagram não conectado
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Conecte sua conta do Instagram para habilitar a extração automática de comentários.
                  </p>
                  <Button
                    onClick={connectInstagram}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Instagram className="w-4 h-4 mr-2" />
                        Conectar Instagram
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-600" />
              Como funciona o sistema
            </h3>
            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">1</span>
                <span>Você (administrador) conecta sua conta do Instagram uma única vez</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">2</span>
                <span>Todos os usuários podem colar URLs de posts públicos do Instagram</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">3</span>
                <span>O sistema busca automaticamente os comentários usando sua conexão</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">4</span>
                <span>Nenhum outro usuário precisa conectar suas contas pessoais</span>
              </li>
            </ol>
          </div>

          {/* Requisitos */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Requisitos importantes:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Sua conta deve ter um Instagram Business ou Creator</li>
              <li>• O app do Facebook deve estar configurado corretamente</li>
              <li>• Apenas posts públicos podem ter comentários extraídos</li>
              <li>• A conexão precisa ser renovada periodicamente (a cada 60 dias)</li>
            </ul>
          </div>

          {/* Debug Info - só para ajudar */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-xs text-gray-600 dark:text-gray-400">
            <p><strong>Seu User ID:</strong> {user?.id || "Não disponível"}</p>
            <p><strong>Admin ID configurado:</strong> {ADMIN_USER_ID}</p>
            <p><strong>É admin?</strong> {isAdmin ? "Sim" : "Não"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal com Suspense
export default function AdminInstagramPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <AdminInstagramContent />
    </Suspense>
  );
}