"use client";

import { motion } from "framer-motion";
import { Video, Layers, Camera, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  contentCounts: {
    reels: number;
    carousels: number;
    image_posts: number;
    story_sequences: number
  } | null;
}

export const MobileBottomNav = ({
  activeTab,
  setActiveTab,
  contentCounts,
}: MobileBottomNavProps) => {
  if (!contentCounts) return null;

  const tabs = [
    {
      id: "reels",
      icon: Video,
      label: "Reels",
      count: contentCounts.reels,
      color: "text-blue-500",
      activeColor: "bg-blue-500"
    },
    {
      id: "carousels",
      icon: Layers,
      label: "Carrossel",
      count: contentCounts.carousels,
      color: "text-purple-500",
      activeColor: "bg-purple-500"
    },
    {
      id: "image_posts",
      icon: Camera,
      label: "Posts",
      count: contentCounts.image_posts,
      color: "text-green-500",
      activeColor: "bg-green-500"
    },
    {
      id: "story_sequences",
      icon: MessageSquare,
      label: "Stories",
      count: contentCounts.story_sequences,
      color: "text-orange-500",
      activeColor: "bg-orange-500"
    },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 sm:hidden safe-area-bottom"
    >
      <div className="flex items-center justify-around py-1.5 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all flex-1 max-w-[80px]",
                isActive
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "active:bg-gray-100 dark:active:bg-gray-800"
              )}
            >
              <div className="relative">
                <tab.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? tab.color : "text-gray-400"
                )} />
                {tab.count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 text-[9px] font-bold rounded-full flex items-center justify-center px-1",
                      isActive
                        ? `${tab.activeColor} text-white`
                        : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    )}
                  >
                    {tab.count}
                  </motion.span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium truncate w-full text-center",
                isActive ? "text-gray-900 dark:text-white" : "text-gray-500"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area padding for iPhone */}
      <div className="h-safe-area-inset-bottom bg-white/95 dark:bg-gray-950/95" />
    </motion.div>
  );
};