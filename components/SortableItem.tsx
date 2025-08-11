// Em /components/SortableItem.tsx
// (Substitua o arquivo inteiro por esta versão final, responsiva e com a rota correta)

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Trash2,
  GripVertical,
  Pencil,
  BarChart3,
  Loader2,
} from "lucide-react";

export function SortableItem({
  id,
  link,
}: {
  id: Id<"links">;
  link: Doc<"links">;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deleteLink = useMutation(api.lib.links.deleteLink);
  const updateLink = useMutation(api.lib.links.updateLink);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link?.title);
  const [editUrl, setEditUrl] = useState(link?.url);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = () => {
    if (!editTitle?.trim() || !editUrl?.trim()) return;

    let processedUrl = editUrl.trim();
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }

    setIsUpdating(true);
    toast.promise(
      updateLink({
        linkId: id,
        title: editTitle.trim(),
        url: processedUrl,
      }),
      {
        loading: "Salvando alterações...",
        success: () => {
          setIsEditing(false);
          setIsUpdating(false);
          return "Link atualizado com sucesso!";
        },
        error: (err) => {
          setIsUpdating(false);
          return `Falha ao atualizar: ${err instanceof Error ? err.message : "Erro desconhecido"}`;
        },
      }
    );
  };

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsEditing(false);
  };

  const handleDelete = () => {
    toast(`Tem certeza que deseja excluir "${link.title}"?`, {
      action: {
        label: "Excluir",
        onClick: () =>
          toast.promise(deleteLink({ linkId: id }), {
            loading: "Excluindo...",
            success: "Link excluído!",
            error: "Falha ao excluir o link.",
          }),
      },
      cancel: { label: "Cancelar", onClick: () => {} },
      duration: 10000,
    });
  };

  if (!link) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-sm transition-shadow touch-none"
    >
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título do link"
          />
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating || !editTitle.trim() || !editUrl.trim()}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab p-2 text-gray-400 hover:bg-gray-100 rounded-md flex-shrink-0"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold text-base truncate">{link.title}</h3>
              <p className="text-gray-500 text-sm truncate">{link.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0">

            <Button variant="outline" size="icon" className="h-9 w-9 flex-1 sm:flex-none" asChild>
              <Link href={`/dashboard/link/${link._id}`}>
                <BarChart3 className="w-4 h-4 text-green-600" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-1 sm:flex-none" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 flex-1 sm:flex-none" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}