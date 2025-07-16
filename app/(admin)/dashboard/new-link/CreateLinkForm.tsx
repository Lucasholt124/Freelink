"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(100, "O título deve ter menos de 100 caracteres"),
  url: z.string().url("Por favor, insira um URL válido"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLinkFormProps {
  showPreview?: boolean;
}

export default function CreateLinkForm({ showPreview = false }: CreateLinkFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ title: string; url: string } | null>(null);

  const createLink = useMutation(api.lib.links.createLink);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const watchedTitle = form.watch("title");
  const watchedUrl = form.watch("url");

  useEffect(() => {
    if (showPreview && watchedTitle && watchedUrl) {
      setPreviewData({ title: watchedTitle, url: watchedUrl });
    } else {
      setPreviewData(null);
    }
  }, [watchedTitle, watchedUrl, showPreview]);

  async function onSubmit(values: FormValues) {
    setError(null);

    let formattedUrl = values.url.trim();
    if (!formattedUrl.startsWith("https://") && !formattedUrl.startsWith("http://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      await createLink({
        title: values.title.trim(),
        url: formattedUrl,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar link");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do link</FormLabel>
              <FormControl>
                <Input placeholder="Meu link incrível" {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>Texto exibido como botão para o link.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com" {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>Destino para onde o link vai redirecionar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? "Criando..." : "Criar Link"}
        </Button>

        {showPreview && previewData && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2 text-gray-800">Pré-visualização do Link:</h3>
            <a
              href={previewData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline break-all"
            >
              {previewData.title || previewData.url}
            </a>
          </div>
        )}
      </form>
    </Form>
  );
}
