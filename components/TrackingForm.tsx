// Em app/dashboard/tracking/_components/TrackingForm.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Tipagem para os dados do formulário
type FormValues = {
  facebookPixelId: string;
  googleAnalyticsId: string;
};

export function TrackingForm() {
  const currentSettings = useQuery(api.tracking.getMyTrackingIds);
  const saveSettings = useMutation(api.tracking.saveTrackingIds);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>();

  useEffect(() => {
    if (currentSettings) {
      reset({
        facebookPixelId: currentSettings.facebookPixelId ?? "",
        googleAnalyticsId: currentSettings.googleAnalyticsId ?? "",
      });
    }
  }, [currentSettings, reset]);

  // --- CORREÇÃO PRINCIPAL AQUI ---
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    toast.promise(
      // Se o campo estiver vazio, usamos '|| undefined', que corresponde
      // ao tipo `v.optional(v.string())` do Convex.
      saveSettings({
        facebookPixelId: data.facebookPixelId || undefined,
        googleAnalyticsId: data.googleAnalyticsId || undefined,
      }),
      {
        loading: "Salvando configurações...",
        success: "Configurações de rastreamento salvas com sucesso!",
        error: "Erro ao salvar. Tente novamente.",
      }
    );
  };

  if (currentSettings === undefined) {
    return <div className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-300" /></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="facebookPixelId" className="block text-sm font-medium text-gray-700 mb-1">
          ID do Pixel do Facebook (Meta)
        </label>
        <input
          id="facebookPixelId"
          {...register("facebookPixelId")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ex: 123456789012345"
        />
        <p className="text-xs text-gray-500 mt-1">
          Encontre este ID no seu Gerenciador de Eventos do Facebook.
        </p>
      </div>

      <div>
        <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 mb-1">
          ID da Métrica do Google Analytics (GA4)
        </label>
        <input
          id="googleAnalyticsId"
          {...register("googleAnalyticsId")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ex: G-XXXXXXXXXX"
        />
        <p className="text-xs text-gray-500 mt-1">
          Encontre este ID na seção Fluxos de dados do seu painel do GA4.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}