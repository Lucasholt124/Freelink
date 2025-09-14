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

// Skeleton enquanto carrega
function LinksSkeleton() {
  return (
    <div className="space-y-5 animate-pulse mt-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-gray-200 rounded-2xl border border-gray-300"
        />
      ))}
    </div>
  );
}

// Estado vazio
function EmptyState() {
  return (
    <div className="text-center p-8 sm:p-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
      <div className="mx-auto w-fit bg-gray-100 p-5 rounded-full mb-6">
        <Link2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-800 text-lg sm:text-xl">
        Sua lista de links está vazia
      </h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
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
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 transition-all duration-300">
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
    <div className="flex flex-col min-h-[400px]">
      <div className="flex-grow">{renderContent()}</div>

      <Button
        asChild
        className="w-full mt-8 py-4 sm:py-5 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:opacity-90 transition-opacity rounded-xl shadow-md"
        aria-label="Adicionar novo link"
      >
        <Link
          href="/dashboard/new-link"
          className="flex items-center justify-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Adicionar Novo Link
        </Link>
      </Button>
    </div>
  );
}