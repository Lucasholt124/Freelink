"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Link as LinkIcon, Loader2 } from "lucide-react";
import clsx from "clsx";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório.")
    .max(50, "O título deve ter no máximo 50 caracteres."),
  url: z
    .string()
    .min(1, "A URL é obrigatória.")
    .url("Por favor, insira uma URL válida."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateLinkForm() {
  const createLink = useMutation(api.lib.links.createLink);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", url: "" },
    mode: "onChange",
  });

  const normalizeUrl = (url: string): string => {
    // --- CORREÇÃO APLICADA AQUI ---
    const formattedUrl = url.trim(); // Trocado 'let' por 'const'
    if (formattedUrl && !/^(https?:\/\/)/i.test(formattedUrl)) {
      return `https://${formattedUrl}`;
    }
    return formattedUrl;
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const formattedUrl = normalizeUrl(values.url);

    toast.promise(
      createLink({
        title: values.title.trim(),
        url: formattedUrl,
      }),
      {
        loading: "Criando seu link...",
        success: () => {
          setTimeout(() => router.push("/dashboard"), 1000);
          return "Link criado com sucesso! 🎉";
        },
        error: (err) => `Falha ao criar o link: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
      }
    );
  };

  const { isSubmitting } = form.formState;
  const watchedTitle = form.watch("title");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Título do Link</FormLabel>
              <FormControl>
                <Input
                  placeholder="Meu Portfólio, Instagram, etc."
                  {...field}
                  autoComplete="off"
                  className="text-base py-6"
                />
              </FormControl>
              <FormDescription>
                Este é o texto que aparecerá no botão do seu link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">URL de Destino</FormLabel>
              <FormControl>
                <Input
                  placeholder="exemplo.com"
                  {...field}
                  autoComplete="off"
                  type="url"
                  className="text-base py-6"
                  onBlur={() => field.onChange(normalizeUrl(field.value))}
                />
              </FormControl>
              <FormDescription>
                Para onde seus visitantes serão redirecionados.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Pré-visualização:</h3>
            <div className={clsx(
                "flex items-center gap-3 w-full rounded-xl py-4 px-5 font-bold text-lg shadow-md border-2 border-transparent transition-all duration-200",
                form.formState.isValid ? "bg-white text-indigo-600 border-indigo-400" : "bg-gray-100 text-gray-400"
            )}>
                <LinkIcon className="w-6 h-6" />
                <span className="flex-1 truncate">
                    {watchedTitle || "Seu Título Aqui"}
                </span>
                <ArrowRight className="w-5 h-5" />
            </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-lg">
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Criar Link"
          )}
        </Button>
      </form>
    </Form>
  );
}