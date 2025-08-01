
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs"; // Importe o useAuth para pegar o userId

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
import { Plus } from "lucide-react";
import Link from "next/link";
import { SortableItem } from "./SortableItem";
import { useEffect, useState } from "react";

export default function ManageLinks() {
  const { userId } = useAuth(); // Pegamos o ID do usuário logado

  // A query agora busca os links usando o userId do usuário autenticado.
  // A query só será executada se 'userId' existir, graças à condição "skip".
  const links = useQuery(
    api.lib.links.getLinksByUserId,
    userId ? { userId } : "skip"
  );

  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder);

  // O estado 'items' armazena a ordem dos IDs para o drag-and-drop
  const [items, setItems] = useState<Id<"links">[]>([]);

  // Este useEffect garante que o estado 'items' esteja sempre sincronizado
  // com os dados que chegam do banco de dados Convex.
  useEffect(() => {
    if (links) {
      setItems(links.map((link) => link._id));
    }
  }, [links]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as Id<"links">);
        const newIndex = currentItems.indexOf(over.id as Id<"links">);
        const newOrderedIds = arrayMove(currentItems, oldIndex, newIndex);

        // Atualiza a ordem no banco de dados de forma otimista
        updateLinkOrder({ linkIds: newOrderedIds });

        return newOrderedIds;
      });
    }
  }

  // Se os dados ainda não foram carregados pelo Convex, mostramos um estado de loading.
  if (links === undefined) {
    return (
      <div className="text-center text-gray-400 py-8">
        Carregando seus links...
      </div>
    );
  }

  // Criamos um mapa para acessar os dados completos do link de forma eficiente
  const linkMap = new Map(links.map(link => [link._id, link]));

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 overflow-x-auto min-w-0">
            {items.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Nenhum link cadastrado ainda.
              </div>
            ) : (
              items.map((id) => {
                const link = linkMap.get(id);
                // Adiciona uma verificação para garantir que o link existe antes de renderizar
                if (!link) return null;

                return <SortableItem key={id} id={id} link={link} />;
              })
            )}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        variant="outline"
        className="w-full border-purple-600 text-purple-600 hover:border-purple-700 hover:bg-purple-600 hover:text-white transition-all duration-200 mt-4"
        asChild
        aria-label="Adicionar novo link"
        title="Adicionar novo link"
      >
        <Link href="/dashboard/new-link" className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar link
        </Link>
      </Button>
    </>
  );
}