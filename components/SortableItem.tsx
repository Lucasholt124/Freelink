"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
  BarChart3,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

export function SortableItem({
  id,
  link,
}: {
  id: Id<"links">;
  link: Doc<"links">;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

      console.log("DADOS RECEBIDOS PELO SortableItem:", { id_prop: id, link_object: link });

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

  const handleSave = async () => {
    if (!editTitle?.trim() || !editUrl?.trim()) return;

    setIsUpdating(true);
    try {
      // Adicione https:// se nenhum protocolo for especificado
      let processedUrl = editUrl;
      if (
        !processedUrl.startsWith("https://") &&
        !processedUrl.startsWith("http://")
      ) {
        processedUrl = `https://${processedUrl}`;
      }

      await updateLink({
        linkId: id,
        title: editTitle.trim(),
        url: processedUrl,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Falha ao atualizar o link:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsEditing(false);
  };

  if (!link) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título do link"
              className="font-semibold"
            />
            <Input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://example.com"
              className="text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating || !editTitle.trim() || !editUrl.trim()}
            >
              {isUpdating ? (
                <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Alça de arrasto */}
          <div
            {...attributes}
            {...listeners}
            aria-describedby={`link-${id}`}
            className="cursor-move p-1 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Contente */}
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-lg truncate">{link.title}</h3>
            <p className="text-gray-600 text-sm truncate">{link.url}</p>
          </div>

          {/* botões de ação */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Botão de análise */}
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
  {/* CORREÇÃO: Usar link._id em vez de apenas id */}
  <Link href={`/dashboard/link/${link._id}`}>
    <BarChart3 className="w-3.5 h-3.5 text-green-500" />
  </Link>
</Button>

            {/* Botão Editar */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>

            {/* Botão Excluir */}
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();

                const isConfirmed = confirm(
                  `Tem certeza de que deseja excluir"${link.title}"?\n\nEsta ação não pode ser desfeita.`,
                );

                if (isConfirmed) {
                  deleteLink({ linkId: id });
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}