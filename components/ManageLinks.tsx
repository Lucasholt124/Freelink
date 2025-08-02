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
import { Plus, Link2 } from "lucide-react";
import Link from "next/link";
import { SortableItem } from "./SortableItem";
import { useEffect, useState } from "react";

// --- Sub-componente: Skeleton para o estado de carregamento ---
function LinksSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}

// --- Sub-componente: Estado Vazio mais informativo ---
function EmptyState() {
  return (
    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
      <div className="mx-auto w-fit bg-gray-100 p-4 rounded-full mb-4">
        <Link2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-800">Sua lista de links está vazia</h3>
      <p className="text-sm text-gray-500 mt-1">
        Clique no botão abaixo para adicionar seu primeiro link!
      </p>
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

  // useEffect aprimorado para lidar com o estado inicial
  useEffect(() => {
    if (links) {
      setItems(links.map((link) => link._id));
    }
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Evita ativação em cliques acidentais
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (items && active.id !== over?.id && over) {
      setItems((currentItems) => {
        if (!currentItems) return null;
        const oldIndex = currentItems.indexOf(active.id as Id<"links">);
        const newIndex = currentItems.indexOf(over.id as Id<"links">);
        const newOrderedIds = arrayMove(currentItems, oldIndex, newIndex);

        // Chamada otimista para o backend
        updateLinkOrder({ linkIds: newOrderedIds }).catch(err => {
          console.error("Falha ao atualizar a ordem dos links:", err);
          // Opcional: reverter a ordem na UI se o backend falhar
          setItems(currentItems);
        });

        return newOrderedIds;
      });
    }
  }

  // --- Renderização condicional aprimorada ---
  const renderContent = () => {
    // Estado de Carregamento (quando 'links' é undefined)
    if (links === undefined || items === null) {
      return <LinksSkeleton />;
    }
    // Estado Vazio (quando 'links' é um array vazio)
    if (links.length === 0) {
      return <EmptyState />;
    }
    // Estado com Links
    const linkMap = new Map(links.map(link => [link._id, link]));
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
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
    // Usando fragmento para agrupar o conteúdo e o botão
    <>
      <div className="min-h-[250px]">
        {renderContent()}
      </div>

      <Button
        asChild
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity mt-6 py-6 text-base"
        aria-label="Adicionar novo link"
      >
        <Link href="/dashboard/new-link" className="flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Novo Link
        </Link>
      </Button>
    </>
  );
}