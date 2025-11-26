// ManageLinks.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
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
} from "@dnd-kit/sortable";

import { Id } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Plus, Link2, Sparkles, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { SortableItem } from "./SortableItem";
import { useEffect, useState } from "react";

// Skeleton enquanto carrega
function LinksSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
              <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
            </div>
          </div>
          {/* Mobile skeleton actions */}
          <div className="mt-3 pt-3 border-t border-gray-200 sm:hidden">
            <div className="h-10 bg-gray-200 rounded-xl" />
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
      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-100 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="relative">
        {/* Ícone animado */}
        <div className="mx-auto w-fit relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <Link2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          {/* Badge flutuante */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg shadow-lg animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <h3 className="font-bold text-gray-800 text-xl sm:text-2xl">
          Sua lista de links está vazia
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Adicione seu primeiro link e comece a compartilhar seu conteúdo com o mundo!
        </p>

        {/* Indicador visual */}
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
  const links = useQuery(
    api.lib.links.getLinksByUserId,
    userId ? { userId } : "skip"
  );
  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder);
  const [items, setItems] = useState<Id<"links">[] | null>(null);

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

  const renderContent = () => {
    if (links === undefined || items === null) {
      return <LinksSkeleton />;
    }
    if (links.length === 0) {
      return <EmptyState />;
    }

    const linkMap = new Map(links.map((link) => [link._id, link]));
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 sm:space-y-4">
            {items.map((id) => {
              const link = linkMap.get(id);
              if (!link) return null;
              return <SortableItem key={id} id={id} link={link} />;
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="flex flex-col min-h-[350px] sm:min-h-[400px]">
      {/* Contador de links (quando houver) */}
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
            {/* Efeito de brilho */}
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