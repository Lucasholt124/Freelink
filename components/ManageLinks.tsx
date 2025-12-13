"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Imports de UI e Ícones
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,

  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Id, Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import {
  Plus, Link2, Sparkles, MousePointerClick, GripVertical,
  ExternalLink, MessageCircle, Mail, Image as ImageIcon,
  Edit2, Trash2, Loader2, BarChart2, ChevronRight,
  TrendingUp, X, Camera, Type, Globe, Power
} from "lucide-react";

// ============================================================================
// 0. TIPAGEM CORRIGIDA
// ============================================================================
type LinkWithExtras = Doc<"links"> & {
  thumbnailUrl?: string;
  active?: boolean;
  clicks?: number;
};

// ============================================================================
// 1. HELPERS E MODAL DE EDIÇÃO
// ============================================================================

const parseUrlData = (fullUrl: string) => {
  let url = fullUrl;
  let message = "";

  if (url.includes("?text=")) {
    const parts = url.split("?text=");
    url = parts[0];
    message = decodeURIComponent(parts[1] || "");
  } else if (url.includes("&text=")) {
    const parts = url.split("&text=");
    url = parts[0];
    message = decodeURIComponent(parts[1] || "");
  } else if (url.includes("?body=")) {
    const parts = url.split("?body=");
    url = parts[0];
    message = decodeURIComponent(parts[1] || "");
  }

  return { url, message };
};

// ============================================================================
// MODAL DE EDIÇÃO - COMPLETAMENTE REDESENHADO
// ============================================================================
function EditLinkDialog({ link, onClose }: { link: LinkWithExtras, onClose: () => void }) {
  const updateLink = useMutation(api.lib.links.updateLink);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const parsedData = parseUrlData(link.url);

  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(parsedData.url);
  const [customMessage, setCustomMessage] = useState(parsedData.message);
  const [isActive, setIsActive] = useState(link.active !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(link.thumbnailUrl || null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWhatsApp = url.toLowerCase().includes("wa.me") || url.toLowerCase().includes("whatsapp");
  const isEmail = url.toLowerCase().includes("mailto:");
  const showMessageField = isWhatsApp || isEmail;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande (Max 5MB)");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageRemoved(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Título e URL são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalUrl = url.trim();

      if (customMessage.trim()) {
        const encodedMsg = encodeURIComponent(customMessage.trim());
        if (isWhatsApp) {
           const separator = finalUrl.includes("?") ? "&" : "?";
           finalUrl = `${finalUrl}${separator}text=${encodedMsg}`;
        } else if (isEmail) {
           const separator = finalUrl.includes("?") ? "&" : "?";
           finalUrl = `${finalUrl}${separator}body=${encodedMsg}`;
        }
      }

      let storageId = link.thumbnailStorageId;

      if (imageRemoved) {
        storageId = undefined;
      } else if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        if (!result.ok) throw new Error("Falha no upload");
        const json = await result.json();
        storageId = json.storageId;
      }

      await updateLink({
        linkId: link._id,
        title: title.trim(),
        url: finalUrl,
        thumbnailStorageId: storageId,
      });

      toast.success("Link atualizado!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] flex flex-col">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <DialogTitle className="text-lg font-bold text-gray-900">Editar Link</DialogTitle>
        <DialogClose asChild>
          <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </DialogClose>
      </div>

      {/* Conteúdo com Scroll */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-5 space-y-5">

          {/* Seção: Ícone */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Ícone</span>
            </div>

            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "w-20 h-20 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-white",
                  imagePreview
                    ? "border-purple-400 shadow-lg shadow-purple-100"
                    : "border-dashed border-gray-300 hover:border-purple-400"
                )}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-6 h-6 text-gray-300 mx-auto" />
                    <span className="text-[10px] text-gray-400 mt-1 block">Adicionar</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  {imagePreview ? 'Trocar imagem' : 'Escolher imagem'}
                </button>
                {imagePreview && (
                  <button
                    onClick={handleRemoveImage}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          </div>

          {/* Seção: Título */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Título</span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white text-base font-medium focus:border-purple-400 focus:ring-purple-400"
              placeholder="Ex: Meu Instagram"
            />
          </div>

          {/* Seção: URL */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">URL de Destino</span>
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white text-base focus:border-purple-400 focus:ring-purple-400"
              placeholder="https://..."
            />
          </div>

          {/* Seção: Mensagem Automática (Condicional) */}
          {showMessageField && (
            <div className={clsx(
              "rounded-xl p-4",
              isWhatsApp ? "bg-green-50" : "bg-blue-50"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {isWhatsApp ? (
                  <MessageCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Mail className="w-4 h-4 text-blue-600" />
                )}
                <span className={clsx(
                  "text-sm font-semibold",
                  isWhatsApp ? "text-green-700" : "text-blue-700"
                )}>
                  {isWhatsApp ? "Mensagem do WhatsApp" : "Corpo do E-mail"}
                </span>
              </div>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className={clsx(
                  "min-h-[100px] rounded-xl border bg-white text-base resize-none",
                  isWhatsApp
                    ? "border-green-200 focus:border-green-400 focus:ring-green-400"
                    : "border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                )}
                placeholder="Ex: Olá! Vim pelo seu link da bio e gostaria de saber mais..."
              />
              <p className={clsx(
                "text-xs mt-2",
                isWhatsApp ? "text-green-600" : "text-blue-600"
              )}>
                Esta mensagem será preenchida automaticamente
              </p>
            </div>
          )}

          {/* Seção: Status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isActive ? "bg-green-100" : "bg-gray-200"
                )}>
                  <Power className={clsx(
                    "w-5 h-5",
                    isActive ? "text-green-600" : "text-gray-400"
                  )} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">Link Ativo</span>
                  <span className="text-xs text-gray-500">
                    {isActive ? "Visível na sua página" : "Oculto temporariamente"}
                  </span>
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer Fixo com Botões */}
      <div className="border-t border-gray-100 bg-white p-4 sticky bottom-0">
        <div className="flex gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-semibold border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// ============================================================================
// 2. ITEM DA LISTA (SORTABLE + ACTIONS)
// ============================================================================

interface SortableLinkItemProps {
  id: string;
  link: LinkWithExtras;
  onEdit: (link: LinkWithExtras) => void;
  onDelete: (id: string) => void;
}

function SortableLinkItem({ id, link, onEdit, onDelete }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.7 : 1,
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.length > 25 ? domain.substring(0, 25) + '...' : domain;
    } catch {
      return url.substring(0, 25) + '...';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group bg-white border rounded-2xl transition-all duration-200 touch-none overflow-hidden",
        isDragging
          ? "shadow-2xl border-purple-300 scale-[1.02]"
          : "border-gray-100 hover:border-gray-200 hover:shadow-lg",
        link.active === false && "opacity-50 bg-gray-50/50"
      )}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 p-1 -ml-1 touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200/50">
          {link.thumbnailUrl ? (
            <Image src={link.thumbnailUrl} alt="icon" width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <Link2 className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {link.title}
            </h3>
            <div
              className={clsx(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                link.active !== false ? "bg-green-500" : "bg-gray-300"
              )}
            />
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors mt-0.5 group/link"
          >
            <span className="truncate">{getDomain(link.url)}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
          </a>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {(link.url.includes("text=") || link.url.includes("body=")) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-100">
                <MessageCircle className="w-2.5 h-2.5" /> Auto-msg
              </span>
            )}
            {link.clicks && link.clicks > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-full border border-purple-100">
                <TrendingUp className="w-2.5 h-2.5" /> {link.clicks} cliques
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <Link
            href={`/dashboard/link/${link._id}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-xl text-xs font-medium transition-all border border-purple-100 hover:border-purple-200 hover:shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Análises</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl h-9 w-9"
            onClick={() => onEdit(link)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-9 w-9"
            onClick={() => onDelete(link._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 sm:hidden flex-shrink-0" />
      </div>

      <div className="sm:hidden border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center divide-x divide-gray-200">
          <Link
            href={`/dashboard/link/${link._id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-purple-600 hover:bg-purple-50 active:bg-purple-100 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="text-sm font-medium">Ver Análises</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => onEdit(link)}
            className="flex items-center justify-center gap-1.5 py-3 px-4 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm">Editar</span>
          </button>

          <button
            onClick={() => onDelete(link._id)}
            className="flex items-center justify-center py-3 px-4 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. COMPONENTE PRINCIPAL (MANAGE LINKS)
// ============================================================================

function LinksSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-8 bg-gray-100 rounded" />
            <div className="w-11 h-11 bg-gray-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
              <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden text-center p-6 sm:p-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative">
        <div className="mx-auto w-fit relative mb-4">
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
            <Link2 className="w-8 h-8 text-gray-400" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-lg shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        <h3 className="font-bold text-gray-800 text-lg sm:text-xl">Nenhum link ainda</h3>
        <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto">
          Adicione seu primeiro link e comece a compartilhar!
        </p>

        <div className="flex items-center justify-center gap-2 mt-4 text-purple-600">
          <MousePointerClick className="w-4 h-4 animate-bounce" />
          <span className="text-xs font-medium">Toque no botão abaixo</span>
        </div>
      </div>
    </div>
  );
}

export default function ManageLinks() {
  const { userId } = useAuth();

  const links = useQuery(api.lib.links.getLinksByUserId, userId ? { userId } : "skip");
  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder);
  const deleteLink = useMutation(api.lib.links.deleteLink);

  const [items, setItems] = useState<Id<"links">[] | null>(null);
  const [editingLink, setEditingLink] = useState<LinkWithExtras | null>(null);

  useEffect(() => {
    if (links) {
      setItems(links.map((link) => link._id));
    }
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (items && active.id !== over?.id && over) {
      setItems((currentItems) => {
        if (!currentItems) return null;
        const oldIndex = currentItems.indexOf(active.id as Id<"links">);
        const newIndex = currentItems.indexOf(over.id as Id<"links">);
        const newOrderedIds = arrayMove(currentItems, oldIndex, newIndex);

        updateLinkOrder({ linkIds: newOrderedIds }).catch((err) => {
          console.error("Falha ao atualizar a ordem dos links:", err);
          setItems(currentItems);
        });

        return newOrderedIds;
      });
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este link?")) {
      try {
        await deleteLink({ linkId: id as Id<"links"> });
        toast.success("Link excluído.");
      } catch {
        toast.error("Erro ao excluir.");
      }
    }
  };

  const renderContent = () => {
    if (links === undefined || items === null) {
      return <LinksSkeleton />;
    }
    if (links.length === 0) {
      return <EmptyState />;
    }

    const linkMap = new Map(links.map((link) => [link._id, link as unknown as LinkWithExtras]));

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((id) => {
              const link = linkMap.get(id);
              if (!link) return null;
              return (
                <SortableLinkItem
                    key={id}
                    id={id}
                    link={link}
                    onEdit={(l) => setEditingLink(l)}
                    onDelete={handleDelete}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="flex flex-col pb-4">
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        {editingLink && (
            <EditLinkDialog link={editingLink} onClose={() => setEditingLink(null)} />
        )}
      </Dialog>

      {links && links.length > 0 && (
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">
              <Link2 className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs sm:text-sm font-semibold text-purple-700">
                {links.length} {links.length === 1 ? "link" : "links"}
              </span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            <span className="hidden xs:inline">Arraste para reordenar</span>
            <span className="xs:hidden">Reordene</span>
          </p>
        </div>
      )}

      <div className="flex-grow">{renderContent()}</div>

      <div className={clsx(
        "mt-4 sm:mt-6",
        links && links.length > 3 && "sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2 -mx-4 px-4 sm:static sm:bg-transparent sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0"
      )}>
        <Button
          asChild
          className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200 h-12 sm:h-14 px-5 rounded-2xl font-bold text-sm sm:text-base"
          aria-label="Adicionar novo link"
        >
          <Link
            href="/dashboard/new-link"
            className="flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span>Adicionar Link</span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}