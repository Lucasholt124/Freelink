// components/brain/SettingsModal.tsx - CONFIGURAÇÕES BUFFER (MOBILE OPTIMIZED)
"use client";

import { useState, useEffect } from "react";
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
  Copy,
} from "lucide-react";
import { useBufferIntegration } from "@/app/hooks/useBrain";
import { cn } from "@/lib/utils";

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
  const [isMobile, setIsMobile] = useState(false);

  const {
    integration,
    isConnected,
    hasProfiles,
    saveToken,
    disconnect,
    fetchProfiles,
  } = useBufferIntegration();

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleConnect = async () => {
    if (!token.trim()) {
      toast.error("Cole o Access Token do Buffer");
      return;
    }

    setIsConnecting(true);

    try {
      await saveToken({ accessToken: token.trim() });
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
    } catch {
      toast.error("Erro ao desconectar");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        isMobile
          ? "max-w-full h-[100dvh] w-full rounded-none p-0"
          : "max-w-2xl"
      )}>
        <div className={cn(
          "flex flex-col h-full",
          !isMobile && "max-h-[85vh]"
        )}>
          <DialogHeader className={cn(
            isMobile ? "p-4 border-b" : "p-6 pb-4"
          )}>
            <DialogTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-lg" : "text-2xl"
            )}>
              <Settings className={cn(
                "text-blue-500",
                isMobile ? "w-5 h-5" : "w-6 h-6"
              )} />
              Configurações de Publicação
            </DialogTitle>
            <DialogDescription className={cn(
              isMobile && "text-xs"
            )}>
              Configure o Buffer para publicar automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className={cn(
            "flex-1 overflow-y-auto",
            isMobile ? "p-4" : "px-6 py-4"
          )}>
            <div className="space-y-4 md:space-y-6">
              {/* Status da Conexão */}
              <div
                className={cn(
                  "p-3 md:p-4 rounded-xl border-2",
                  isConnected
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    : "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
                )}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  {isConnected ? (
                    <Check className={cn(
                      "text-green-600 flex-shrink-0",
                      isMobile ? "w-5 h-5" : "w-6 h-6"
                    )} />
                  ) : (
                    <AlertCircle className={cn(
                      "text-orange-600 flex-shrink-0",
                      isMobile ? "w-5 h-5" : "w-6 h-6"
                    )} />
                  )}
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-semibold",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {isConnected ? "Buffer Conectado" : "Buffer Não Conectado"}
                    </h3>
                    <p className={cn(
                      "text-muted-foreground mt-0.5 md:mt-1",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {isConnected
                        ? "Você pode publicar posts automaticamente"
                        : "Configure o Buffer para ativar a publicação automática"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Perfis Conectados */}
              {isConnected && hasProfiles && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Label className={cn(
                    "font-semibold",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    Perfis Conectados
                  </Label>
                  <div className={cn(
                    "grid gap-2 md:gap-3",
                    isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  )}>
                    {integration?.bufferProfiles?.map((profile) => {
                      const Icon =
                        PLATFORM_ICONS[
                          profile.service as keyof typeof PLATFORM_ICONS
                        ] || Settings;

                      return (
                        <div
                          key={profile.id}
                          className={cn(
                            "flex items-center gap-2 md:gap-3 bg-white dark:bg-gray-800 rounded-lg border",
                            isMobile ? "p-2.5" : "p-3"
                          )}
                        >
                          {profile.avatar ? (
                            <img
                              src={profile.avatar}
                              alt={profile.serviceUsername}
                              className={cn(
                                "rounded-full",
                                isMobile ? "w-8 h-8" : "w-10 h-10"
                              )}
                            />
                          ) : (
                            <div className={cn(
                              "rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center",
                              isMobile ? "w-8 h-8" : "w-10 h-10"
                            )}>
                              <Icon className={cn(
                                "text-white",
                                isMobile ? "w-4 h-4" : "w-5 h-5"
                              )} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-semibold truncate",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {profile.serviceUsername}
                            </p>
                            <p className={cn(
                              "text-muted-foreground capitalize",
                              isMobile ? "text-[10px]" : "text-xs"
                            )}>
                              {profile.serviceName}
                            </p>
                          </div>
                          <Badge variant="secondary" className={cn(
                            isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs"
                          )}>
                            <Check className={cn(
                              "mr-0.5 md:mr-1",
                              isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                            )} />
                            Ativo
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <Separator />

              {/* Formulário de Conexão */}
              {!isConnected ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token" className={cn(
                      "font-semibold",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      Access Token do Buffer
                    </Label>
                    <p className={cn(
                      "text-muted-foreground mt-0.5 mb-2 md:mb-3",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      Obtenha seu token gratuitamente no Buffer
                    </p>
                    <Input
                      id="token"
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Cole seu Access Token aqui..."
                      className={cn(
                        "font-mono",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                    />
                  </div>

                  {/* Tutorial */}
                  <div className={cn(
                    "bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800",
                    isMobile ? "p-3" : "p-4"
                  )}>
                    <h4 className={cn(
                      "font-semibold mb-2 flex items-center gap-1.5 md:gap-2",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      <ExternalLink className={cn(
                        isMobile ? "w-3 h-3" : "w-4 h-4"
                      )} />
                      Como obter o Access Token
                    </h4>
                    <ol className={cn(
                      "space-y-1 list-decimal list-inside text-muted-foreground",
                      isMobile ? "text-[10px]" : "text-xs"
                    )}>
                      <li>
                        Acesse:{" "}
                        <button
                          onClick={() => copyToClipboard("https://buffer.com/")}
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          buffer.com
                          <Copy className={cn(
                            isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                          )} />
                        </button>
                      </li>
                      <li>Crie uma conta gratuita (até 3 perfis)</li>
                      <li>Conecte Instagram, Facebook, LinkedIn ou Twitter</li>
                      <li>
                        Acesse:{" "}
                        <button
                          onClick={() => copyToClipboard("https://publish.buffer.com/account/developer")}
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Developer Settings
                          <Copy className={cn(
                            isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                          )} />
                        </button>
                      </li>
                      <li>Clique em Create Access Token</li>
                      <li>Copie o token e cole acima</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 md:py-6">
                  <div className={cn(
                    "bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4",
                    isMobile ? "w-12 h-12" : "w-16 h-16"
                  )}>
                    <Check className={cn(
                      "text-green-600",
                      isMobile ? "w-6 h-6" : "w-8 h-8"
                    )} />
                  </div>
                  <h3 className={cn(
                    "font-semibold mb-1.5 md:mb-2",
                    isMobile ? "text-base" : "text-lg"
                  )}>
                    Tudo Pronto!
                  </h3>
                  <p className={cn(
                    "text-muted-foreground mb-3 md:mb-4",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    Seus posts serão publicados automaticamente
                  </p>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={handleDisconnect}
                    className={isMobile ? "text-xs" : ""}
                  >
                    <X className={cn(
                      "mr-1.5 md:mr-2",
                      isMobile ? "w-3 h-3" : "w-4 h-4"
                    )} />
                    Desconectar Buffer
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className={cn(
            "border-t",
            isMobile ? "p-4 flex-row gap-2" : "p-6 pt-4"
          )}>
            <Button
              variant="ghost"
              onClick={onClose}
              className={cn(
                isMobile && "flex-1 text-xs"
              )}
            >
              Fechar
            </Button>
            {!isConnected && (
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !token.trim()}
                className={cn(
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  isMobile && "flex-1 text-xs"
                )}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className={cn(
                      "animate-spin",
                      isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"
                    )} />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Check className={cn(
                      isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"
                    )} />
                    Conectar Buffer
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}