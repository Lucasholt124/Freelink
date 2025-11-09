"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy } from "lucide-react";

interface AchievementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementsModal({ open, onOpenChange }: AchievementsModalProps) {
  const achievements = useQuery(api.gamification.getAllAchievements);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Suas Conquistas
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {achievements?.map((achievement) => (
              <div
                key={achievement._id}
                className="p-4 border rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="font-bold text-lg">{achievement.title}</p>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}