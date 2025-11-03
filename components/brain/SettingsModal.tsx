// components/brain/SettingsModal.tsx - CONFIGURAÇÕES BUFFER
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  ExternalLink,
  Check,
  X,
  Loader2,
  AlertCircle,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useBufferIntegration } from "@/app/hooks/useBrain";


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    integration,
    isConnected,
    hasProfiles,
    saveToken,
    disconnect,
    fetchProfiles,
  } = useBufferIntegration();

  const handleConnect = async () => {
    if (!token.trim()) {
      toast.error("Cole o Access Token do Buffer");
      return;
    }

    setIsConnecting(true);

    try {
      // Salvar token
      await saveToken({ accessToken: token.trim() });

      // Buscar perfis
      const profiles = await fetchProfiles();

      toast.success(`✅ Buffer conectado! ${profiles.length} perfis encontrados`);
      setToken("");
    } catch (error) {
      console.error("Erro ao conectar Buffer:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao conectar com Buffer"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Buffer desconectado");
    } catch  {
      toast.error("Erro ao desconectar");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings className="w-6 h-6 text-blue-500" />
            Configurações de Publicação
          </DialogTitle>
          <DialogDescription>
            Configure o Buffer para publicar automaticamente seus posts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* STATUS DA CONEXÃO */}
          <div
            className={`p-4 rounded-xl border-2 ${
              isConnected
                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                : "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
            }`}
          >
            <div className="flex items-start gap-3">
              {isConnected ? (
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  {isConnected ? "Buffer Conectado" : "Buffer Não Conectado"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected
                    ? "Você pode publicar posts automaticamente"
                    : "Configure o Buffer para ativar a publicação automática"}
                </p>
              </div>
            </div>
          </div>

          {/* PERFIS CONECTADOS */}
          {isConnected && hasProfiles && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Label className="text-sm font-semibold">Perfis Conectados</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {integration?.bufferProfiles?.map((profile) => {
                  const Icon =
                    PLATFORM_ICONS[
                      profile.service as keyof typeof PLATFORM_ICONS
                    ] || Settings;

                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.serviceUsername}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {profile.serviceUsername}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {profile.serviceName}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <Separator />

          {/* FORMULÁRIO DE CONEXÃO */}
          {!isConnected ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="token" className="text-sm font-semibold">
                  Access Token do Buffer
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Obtenha seu token gratuitamente no Buffer
                </p>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole seu Access Token aqui..."
                  className="font-mono text-sm"
                />
              </div>

              {/* TUTORIAL */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Como obter o Access Token
                </h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>
                    Acesse:{" "}
                    <a
                      href="https://buffer.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      buffer.com
                    </a>
                  </li>
                  <li>Crie uma conta gratuita (até 3 perfis)</li>
                  <li>Conecte Instagram, Facebook, LinkedIn ou Twitter</li>
                  <li>
                    Acesse:{" "}
                    <a
                      href="https://publish.buffer.com/account/developer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Developer Settings
                    </a>
                  </li>
                  <li>Clique em Create Access Token</li>
                  <li>Copie o token e cole acima</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Tudo Pronto!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seus posts serão publicados automaticamente no horário agendado
              </p>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <X className="w-4 h-4 mr-2" />
                Desconectar Buffer
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          {!isConnected && (
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !token.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Conectar Buffer
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}