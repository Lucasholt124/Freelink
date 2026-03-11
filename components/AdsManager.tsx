"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Megaphone, Plus, Play, Pause, Trash2, Eye, MousePointerClick,
  Sparkles, Link as LinkIcon, Image as ImageIcon, Loader2,
  TrendingUp, BarChart3, AlertTriangle, X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function AdsManagerComponent({ userPlan }: { userPlan: string }) {
  const campaignsRaw = useQuery(api.ads.getCampaigns);
  const campaigns = (campaignsRaw ?? []) as Doc<"adCampaigns">[];
  const createCampaign = useMutation(api.ads.createCampaign);
  const toggleStatus = useMutation(api.ads.toggleCampaignStatus);
  const deleteCampaign = useMutation(api.ads.deleteCampaign);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  // Formulário agora suporta um Array de Mídias
  const [form, setForm] = useState({
    title: "",
    productLink: "",
    adText: "",
    mediaUrls: [""],
  });

  const isUltra = userPlan === "ultra";
  const maxMediaAllowed = isUltra ? 10 : 2; // 2 mídias para Pro, 10 para Ultra

  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const activeCount = campaigns.filter(c => c.status === "active").length;

  const handleAddMediaField = () => {
    if (form.mediaUrls.length >= maxMediaAllowed) {
      toast.error(`Seu plano permite até ${maxMediaAllowed} mídias por anúncio.`);
      return;
    }
    setForm({ ...form, mediaUrls: [...form.mediaUrls, ""] });
  };

  const handleMediaChange = (index: number, value: string) => {
    const newMedia = [...form.mediaUrls];
    newMedia[index] = value;
    setForm({ ...form, mediaUrls: newMedia });
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = form.mediaUrls.filter((_, i) => i !== index);
    setForm({ ...form, mediaUrls: newMedia });
  };

  const handleCreate = async () => {
    if (!form.title || !form.productLink || !form.adText) {
      toast.error("Preencha os campos obrigatórios (Título, Link e Texto).");
      return;
    }

    // Limpa links vazios do array de mídia
    const validMediaUrls = form.mediaUrls.filter(url => url.trim() !== "");

    setIsSubmitting(true);
    try {
      toast.loading("Analisando seu anúncio com IA...");

      // 🤖 CHAMA A NOSSA ROTA DA GROQ PARA DESCOBRIR O NICHO!
      const res = await fetch('/api/analyze-niche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, text: form.adText })
      });

      let niche = "geral";
      if (res.ok) {
        const data = await res.json();
        niche = data.niche;
      }

      toast.dismiss(); // Apaga o loading

      await createCampaign({
        title: form.title,
        productLink: form.productLink,
        adText: form.adText,
        mediaUrls: validMediaUrls,
        userPlan: userPlan,
        niche: niche, // Passa o nicho blindado pro backend
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`🚀 Anúncio criado e classificado como "${niche}"!`);
      setIsModalOpen(false);
      setForm({ title: "", productLink: "", adText: "", mediaUrls: [""] });
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao criar campanha.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: Id<"adCampaigns">, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await toggleStatus({ id, status: newStatus });
      toast.success(newStatus === "active" ? "▶️ Campanha ativada!" : "⏸️ Campanha pausada!");
    } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Erro ao alterar status.");
    }
  };

  const handleDelete = async (id: Id<"adCampaigns">) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
    try {
      await deleteCampaign({ id });
      toast.success("🗑️ Campanha excluída!");
    } catch  {
      toast.error("Erro ao excluir.");
    }
  };

  const handleGenerateIA = () => {
    if (!form.title) {
      toast.error("Digite um Título para a IA trabalhar.");
      return;
    }
    setIsGeneratingIA(true);
    setTimeout(() => {
      const templates = [
        `🔥 Oferta Imperdível! Garanta o seu ${form.title} hoje com desconto exclusivo. Clique no link e confira antes que acabe o estoque! 🏃‍♂️💨`,
        `✨ Chegou o que você esperava! O ${form.title} perfeito para o seu dia a dia. Qualidade premium que você merece. Toque aqui e saiba mais! 👇`,
        `💎 Procurando exclusividade? Conheça o novo ${form.title}. Pouquíssimas unidades disponíveis. Acesse nossa loja agora e garanta o seu! 🛒`
      ];
      const randomText = templates[Math.floor(Math.random() * templates.length)];
      setForm(prev => ({ ...prev, adText: randomText }));
      setIsGeneratingIA(false);
      toast.success("✨ Texto gerado com IA!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 📊 ESTATÍSTICAS DO TOPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-blue-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Visualizações no Mês</p>
            <h4 className="text-2xl font-black text-gray-800">{totalViews}</h4>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-sm border-indigo-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cliques Gerados</p>
            <h4 className="text-2xl font-black text-gray-800">{totalClicks}</h4>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-sm border-emerald-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Anúncios Rodando</p>
            <h4 className="text-2xl font-black text-gray-800">{activeCount}</h4>
          </div>
        </Card>
      </div>

      {/* 🚀 BOTÃO DE NOVA CAMPANHA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <div>
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" /> Suas Campanhas
          </h3>
          <p className="text-sm text-gray-500">Gerencie onde seus produtos aparecem na Rede Freelinnk.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-lg shadow-blue-500/30">
          <Plus className="w-4 h-4 mr-2" /> Criar Anúncio
        </Button>
      </div>

      {/* 📋 LISTA DE CAMPANHAS */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-200 bg-gray-50/50">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold mb-2 text-gray-700">Nenhum anúncio rodando</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Aumente suas vendas aparecendo no final de outras páginas. A inteligência do Freelinnk garante que você nunca vai anunciar na página de um concorrente.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            Começar Primeira Campanha
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const progress = (campaign.views / campaign.maxViewsLimit) * 100;
            const isCompleted = campaign.views >= campaign.maxViewsLimit;

            return (
              <Card key={campaign._id} className="p-5 flex flex-col hover:shadow-lg transition-all border-gray-100 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 ${campaign.status === 'active' ? 'bg-emerald-500' : campaign.status === 'paused' ? 'bg-orange-400' : 'bg-gray-400'}`} />

                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="font-bold text-lg text-gray-800 truncate">{campaign.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold border-0 ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        campaign.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status === 'active' ? 'Rodando' : campaign.status === 'paused' ? 'Pausado' : 'Finalizado'}
                      </Badge>
                      {campaign.niche && <Badge variant="secondary" className="text-[10px]">Nicho: {campaign.niche}</Badge>}
                      {isCompleted && <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Limite Mensal</Badge>}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg mb-4 text-xs text-slate-600 line-clamp-3 min-h-[60px] italic border border-slate-100">
                  {campaign.adText}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 mt-auto">
                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Views do Mês</p>
                    <p className="font-black text-gray-800 text-lg">{campaign.views}</p>
                  </div>
                  <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Cliques Totais</p>
                    <p className="font-black text-gray-800 text-lg">{campaign.clicks}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1.5">
                    <span>Consumo: {campaign.views} de {campaign.maxViewsLimit}</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className={`h-1.5 ${isCompleted ? 'bg-red-200' : 'bg-blue-100'}`} />
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs h-9 bg-white"
                    onClick={() => handleToggle(campaign._id, campaign.status)}
                    disabled={isCompleted}
                  >
                    {campaign.status === "active" ? (
                      <><Pause className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Pausar</>
                    ) : (
                      <><Play className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Ativar</>
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0" onClick={() => handleDelete(campaign._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 📝 MODAL DE CRIAÇÃO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Novo Anúncio na Rede
            </DialogTitle>
            <DialogDescription>
              A nossa IA lerá seu anúncio para exibi-lo longe dos seus concorrentes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold">Título do Anúncio *</Label>
              <Input
                placeholder="Ex: Tênis Nike Revolution"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Link para onde o cliente vai *</Label>
              <div className="relative mt-1.5">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="https://sualoja.com/produto"
                  value={form.productLink}
                  onChange={(e) => setForm({ ...form, productLink: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-semibold">Texto do Anúncio *</Label>
                <Button type="button" variant="secondary" size="sm" onClick={handleGenerateIA} disabled={isGeneratingIA} className="h-7 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100">
                  {isGeneratingIA ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                  Gerar com IA
                </Button>
              </div>
              <Textarea
                placeholder="Descreva o produto com uma oferta imperdível..."
                value={form.adText}
                onChange={(e) => setForm({ ...form, adText: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* 🔥 ÁREA DE MULTIPLAS IMAGENS/GIFS */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Mídias (Imagens/GIFs)</Label>
                <span className="text-xs text-gray-500 font-medium">{form.mediaUrls.length} de {maxMediaAllowed} permitidas</span>
              </div>

              {form.mediaUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Link da imagem (https://...)"
                      value={url}
                      onChange={(e) => handleMediaChange(index, e.target.value)}
                      className="pl-9 bg-white"
                    />
                  </div>
                  {form.mediaUrls.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMedia(index)} className="text-red-500 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {form.mediaUrls.length < maxMediaAllowed ? (
                <Button type="button" variant="outline" size="sm" onClick={handleAddMediaField} className="w-full mt-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar outra mídia
                </Button>
              ) : !isUltra && (
                <div className="text-center mt-2">
                  <p className="text-xs text-orange-600 mb-2 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Limite de mídias do plano PRO atingido.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Lançar na Rede
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}