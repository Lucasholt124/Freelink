"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    toast.promise(
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
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      noValidate
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Configurações de Rastreamento
      </h2>

      <div className="space-y-2">
        <label
          htmlFor="facebookPixelId"
          className="block text-sm font-semibold text-gray-800"
        >
          ID do Pixel do Facebook (Meta)
        </label>
        <input
          id="facebookPixelId"
          {...register("facebookPixelId")}
          type="text"
          placeholder="Ex: 123456789012345"
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-400"
          disabled={isSubmitting}
          autoComplete="off"
        />
        <p className="text-xs text-gray-500">
          Encontre este ID no seu Gerenciador de Eventos do Facebook.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="googleAnalyticsId"
          className="block text-sm font-semibold text-gray-800"
        >
          ID da Métrica do Google Analytics (GA4)
        </label>
        <input
          id="googleAnalyticsId"
          {...register("googleAnalyticsId")}
          type="text"
          placeholder="Ex: G-XXXXXXXXXX"
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-400"
          disabled={isSubmitting}
          autoComplete="off"
        />
        <p className="text-xs text-gray-500">
          Encontre este ID na seção Fluxos de dados do seu painel do GA4.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={`
            inline-flex items-center justify-center rounded-md bg-purple-600 px-6 py-3 text-white text-sm font-semibold
            shadow-md transition-colors duration-200
            hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50
            disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
          `}
          aria-live="polite"
        >
          {isSubmitting && (
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-white" />
          )}
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}