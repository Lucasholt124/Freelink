// SortableItem.tsx
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
  TrendingUp,
  ChevronRight,
  MousePointerClick,
  X,
  Check,
} from "lucide-react";

export function SortableItem({
  id,
  link,
}: {
  id: Id<"links">;
  link: Doc<"links">;
}) {
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
          return `Falha ao atualizar: ${
            err instanceof Error ? err.message : "Erro desconhecido"
          }`;
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
      className={`
        group relative bg-white rounded-2xl border transition-all duration-200
        ${
          isDragging
            ? "shadow-2xl shadow-purple-500/20 border-purple-300 scale-[1.02] z-50"
            : "shadow-sm hover:shadow-md border-gray-100 hover:border-purple-200/50"
        }
        touch-none
      `}
    >
      {/* Indicador de arraste ativo */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
      )}

      {isEditing ? (
        /* ===== MODO DE EDIÇÃO ===== */
        <div className="p-4 sm:p-5 space-y-4">
          {/* Header do modo edição */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Pencil className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                Editando link
              </span>
            </div>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar edição"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Campos de edição */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Título
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título do link"
                aria-label="Editar título do link"
                disabled={isUpdating}
                className="h-11 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                URL
              </label>
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com"
                aria-label="Editar URL do link"
                disabled={isUpdating}
                className="h-11 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all font-mono text-sm"
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex-1 h-11 rounded-xl font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || !editTitle?.trim() || !editUrl?.trim()}
              className="flex-1 h-11 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
            >
              {isUpdating ? (
                <Loader2
                  className="w-4 h-4 animate-spin"
                  aria-label="Salvando..."
                />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* ===== MODO DE VISUALIZAÇÃO ===== */
        <div className="p-3 sm:p-4">
          {/* Layout Mobile */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Linha 1: Drag handle + Conteúdo */}
            <div className="flex items-start gap-2">
              {/* Drag Handle */}
              <div
                {...attributes}
                {...listeners}
                className="mt-1 cursor-grab active:cursor-grabbing p-2 -ml-1 text-gray-300 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
                aria-label="Arrastar para reordenar"
                role="button"
                tabIndex={0}
              >
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Conteúdo do Link */}
              <div className="flex-1 min-w-0 py-0.5">
                <h3
                  className="font-semibold text-gray-900 text-[15px] leading-tight truncate"
                  title={link.title}
                >
                  {link.title}
                </h3>
                <p
                  className="text-gray-400 text-xs mt-1 truncate font-mono"
                  title={link.url}
                >
                  {link.url}
                </p>
              </div>
            </div>

            {/* Linha 2: Ações */}
            <div className="flex items-center gap-2 pl-9">
              {/* Botão Editar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 px-3 rounded-lg border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex-shrink-0"
                aria-label={`Editar link ${link.title}`}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">
                  Editar
                </span>
              </Button>

              {/* Botão Excluir */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="h-9 px-3 rounded-lg border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 transition-all flex-shrink-0"
                aria-label={`Excluir link ${link.title}`}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                <span className="text-xs font-medium text-red-600">
                  Excluir
                </span>
              </Button>
            </div>

            {/* Linha 3: Botão de Analytics - DESTAQUE TOTAL */}
            <Link
              href={`/dashboard/link/${link._id}`}
              className="group/analytics block mt-1"
              aria-label={`Ver análises detalhadas do link ${link.title}`}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl p-3 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98]">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full" />
                  <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white rounded-full" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">
                          Ver Análises
                        </span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-100" />
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MousePointerClick className="w-3 h-3 text-emerald-100" />
                        <span className="text-emerald-100 text-xs">
                          Cliques, visitas e mais
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/80 group-hover/analytics:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Layout Desktop/Tablet */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2.5 -ml-1 text-gray-300 hover:text-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-200 flex-shrink-0 group-hover:text-gray-400"
              aria-label="Arrastar para reordenar"
              role="button"
              tabIndex={0}
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Conteúdo do Link */}
            <div className="flex-1 min-w-0 py-1">
              <h3
                className="font-semibold text-gray-900 text-base truncate pr-4"
                title={link.title}
              >
                {link.title}
              </h3>
              <p
                className="text-gray-400 text-sm truncate font-mono mt-0.5"
                title={link.url}
              >
                {link.url}
              </p>
            </div>

            {/* Ações Desktop */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Botão Analytics - DESTAQUE */}
              <Link
                href={`/dashboard/link/${link._id}`}
                className="group/analytics"
                aria-label={`Ver análises detalhadas do link ${link.title}`}
              >
                <div className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white font-medium text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <BarChart3 className="w-4 h-4" />
                  <span>Análises</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-100 group-hover/analytics:translate-x-0.5 group-hover/analytics:-translate-y-0.5 transition-transform" />
                </div>
              </Link>

              {/* Separador */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Botão Editar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-10 w-10 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                aria-label={`Editar link ${link.title}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              {/* Botão Excluir */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                aria-label={`Excluir link ${link.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}