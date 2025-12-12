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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Id, Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import {
  Plus, Link2, Sparkles, MousePointerClick, GripVertical,
  ExternalLink, MessageCircle, Mail, Image as ImageIcon,
  Edit2, Trash2, Upload, Loader2, BarChart2
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

// Modal de Edição
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
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Editar Link</DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden relative bg-gray-50 hover:bg-gray-100",
                imagePreview ? "border-purple-500" : "border-gray-300"
              )}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="w-3 h-3 mr-2" /> Alterar Ícone
                </Button>
                {imagePreview && (
                    <p onClick={handleRemoveImage} className="text-xs text-red-500 cursor-pointer hover:underline">
                        Remover imagem
                    </p>
                )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
        </div>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>URL de Destino</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        {showMessageField && (
          <div className={`space-y-2 p-3 rounded-lg border ${isWhatsApp ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <Label className="flex items-center gap-2">
               {isWhatsApp ? <MessageCircle className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
               {isWhatsApp ? "Mensagem do WhatsApp" : "Corpo do E-mail"}
            </Label>
            <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-white resize-none h-20"
                placeholder="Ex: Olá, vim pelo link da bio..."
            />
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <Label>Link Ativo?</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSave} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============================================================================
// 2. ITEM DA LISTA (SORTABLE + ACTIONS)
// ============================================================================

interface SortableLinkItemProps {
  id: string;
  link: LinkWithExtras; // Tipagem corrigida
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all touch-none",
        link.active === false && "opacity-60 bg-gray-50"
      )}
    >
      {/* Handle de Arrastar */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-300 hover:text-gray-500 p-1"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Imagem (Thumbnail) */}
      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
        {link.thumbnailUrl ? (
          <Image src={link.thumbnailUrl} alt="icon" width={48} height={48} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-5 h-5 text-gray-300" />
        )}
      </div>

      {/* Informações */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 truncate">{link.title}</h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
          <span className="truncate max-w-[200px]">{link.url}</span>
          <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-purple-600">
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {/* Badge de WhatsApp Ativo */}
        {(link.url.includes("text=") || link.url.includes("body=")) && (
          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-md border border-green-100">
            <MessageCircle className="w-3 h-3" /> Mensagem Auto
          </span>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className={clsx("w-2 h-2 rounded-full mr-2", link.active !== false ? "bg-green-500" : "bg-gray-300")} title={link.active !== false ? "Ativo" : "Inativo"} />

        {/* 🔥 BOTÃO DE ANÁLISES (Configurado corretamente) */}
        <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-purple-600"
            asChild
            title="Ver Análises" // Tooltip "Análises" para o usuário não se perder
        >
            <Link href={`/dashboard/link/${link._id}`}>
                <BarChart2 className="w-4 h-4" />
                <span className="sr-only">Análises</span>
            </Link>
        </Button>

        {/* Botão de Editar */}
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600" onClick={() => onEdit(link)} title="Editar Link">
          <Edit2 className="w-4 h-4" />
        </Button>

        {/* Botão de Excluir */}
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => onDelete(link._id)} title="Excluir">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// 3. COMPONENTE PRINCIPAL (MANAGE LINKS)
// ============================================================================

// Skeleton enquanto carrega
function LinksSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
              <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Estado vazio
function EmptyState() {
  return (
    <div className="relative overflow-hidden text-center p-8 sm:p-12 lg:p-16 border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50 to-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-100 rounded-full opacity-50 blur-3xl" />
      </div>
      <div className="relative">
        <div className="mx-auto w-fit relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <Link2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg shadow-lg animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <h3 className="font-bold text-gray-800 text-xl sm:text-2xl">Sua lista de links está vazia</h3>
        <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Adicione seu primeiro link e comece a compartilhar seu conteúdo com o mundo!
        </p>
        <div className="flex items-center justify-center gap-2 mt-6 text-purple-600">
          <MousePointerClick className="w-4 h-4 animate-bounce" />
          <span className="text-sm font-medium">Clique no botão abaixo</span>
        </div>
      </div>
    </div>
  );
}

export default function ManageLinks() {
  const { userId } = useAuth();

  // Queries e Mutations REAIS do Backend
  const links = useQuery(api.lib.links.getLinksByUserId, userId ? { userId } : "skip");
  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder);
  const deleteLink = useMutation(api.lib.links.deleteLink);

  const [items, setItems] = useState<Id<"links">[] | null>(null);

  // Estados para controlar qual link está sendo editado
  const [editingLink, setEditingLink] = useState<LinkWithExtras | null>(null);

  // Sincroniza a ordem local com o backend
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

    // Mapeia usando o tipo corrigido
    const linkMap = new Map(links.map((link) => [link._id, link as unknown as LinkWithExtras]));

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 sm:space-y-4">
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
    <div className="flex flex-col min-h-[350px] sm:min-h-[400px]">

      {/* Modal de Edição */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        {editingLink && (
            <EditLinkDialog link={editingLink} onClose={() => setEditingLink(null)} />
        )}
      </Dialog>

      {/* Contador de links */}
      {links && links.length > 0 && (
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
              <Link2 className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                {links.length} {links.length === 1 ? "link" : "links"}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block">
            Arraste para reordenar
          </p>
        </div>
      )}

      {/* Lista de links */}
      <div className="flex-grow">{renderContent()}</div>

      {/* Botão de adicionar */}
      <div className="mt-6 sm:mt-8">
        <Button
          asChild
          className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-[0.99] transition-all duration-200 h-12 sm:h-14 px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base"
          aria-label="Adicionar novo link"
        >
          <Link
            href="/dashboard/new-link"
            className="flex items-center justify-center gap-2.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center gap-2.5">
              <div className="p-1 bg-white/20 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <span>Adicionar Novo Link</span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}