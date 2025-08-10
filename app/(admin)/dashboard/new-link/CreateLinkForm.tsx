// Em /components/CreateLinkForm.tsx
// (Substitua o arquivo inteiro)

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight, Link as LinkIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório.").max(50, "O título deve ter no máximo 50 caracteres."),
  url: z.string().min(1, "A URL é obrigatória.").url("Por favor, insira uma URL válida."),
});

type FormValues = z.infer<typeof formSchema>;

const normalizeUrl = (url: string): string => {
  const formattedUrl = url.trim();
  if (formattedUrl && !/^(https?:\/\/|mailto:|tel:)/i.test(formattedUrl)) {
    return `https://${formattedUrl}`;
  }
  return formattedUrl;
};

export default function CreateLinkForm() {
  const createLink = useMutation(api.lib.links.createLink);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", url: "" },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    toast.promise(
      createLink({
        title: values.title.trim(),
        url: normalizeUrl(values.url),
      }),
      {
        loading: "Criando seu link...",
        success: () => {
          setTimeout(() => router.push("/dashboard/links"), 800);
          return "Link criado com sucesso! 🎉";
        },
        error: (err) => `Falha ao criar o link: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
      }
    );
  };

  const { isSubmitting, isValid } = form.formState;
  const watchedTitle = form.watch("title");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-800">Título do Link</FormLabel>
              <FormControl><Input placeholder="Meu Portfólio, Instagram, etc." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-800">URL de Destino</FormLabel>
              <FormControl><Input placeholder="https://exemplo.com" {...field} onBlur={() => field.onChange(normalizeUrl(field.value))} /></FormControl>
              <FormMessage />
            </FormItem>
        )} />

        <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Pré-visualização do botão:</h3>
            <div className={clsx( "flex items-center gap-3 w-full rounded-xl py-4 px-5 font-bold text-lg shadow-md border-2 transition-all duration-300",
                isValid ? "bg-purple-600 text-white border-purple-700" : "bg-gray-100 text-gray-400 border-gray-200"
            )}>
                <LinkIcon className="w-6 h-6" />
                <span className="flex-1 truncate">{watchedTitle || "Seu Título Aqui"}</span>
                <ArrowRight className="w-5 h-5" />
            </div>
        </div>
        <Button type="submit" disabled={isSubmitting || !isValid} className="w-full py-6 text-base font-bold">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Criar e Adicionar Link"}
        </Button>
      </form>
    </Form>
  );
}