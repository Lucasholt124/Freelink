"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  requireConfirmation?: boolean;
  confirmationText?: string;
  items?: string[];
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  requireConfirmation = false,
  confirmationText = "Sim, eu entendo que esta ação é permanente",
  items = [],
}: ConfirmDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (requireConfirmation && !confirmed) return;

    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setConfirmed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      iconBg: "bg-red-100",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      iconBg: "bg-orange-100",
      buttonClass: "bg-orange-600 hover:bg-orange-700",
    },
    info: {
      icon: <Info className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-blue-100",
      buttonClass: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const style = variantStyles[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${style.iconBg}`}>
              {style.icon}
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="text-base">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {items.length > 0 && (
          <div className="my-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <p className="font-semibold mb-2 text-sm text-gray-700">Esta ação irá afetar:</p>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <Trash2 className="w-3 h-3 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requireConfirmation && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              className="mt-1"
            />
            <Label
              htmlFor="confirm"
              className="cursor-pointer text-sm font-medium leading-relaxed"
            >
              {confirmationText}
            </Label>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={(requireConfirmation && !confirmed) || isLoading}
            className={style.buttonClass}
          >
            {isLoading ? "Processando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}