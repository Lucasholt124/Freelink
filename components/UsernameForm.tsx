"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  ExternalLink,
  Copy,
} from "lucide-react";
import Link from "next/link";


import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { toast } from "sonner";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
    .max(30, "O nome de usuário deve ter no máximo 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Só pode conter letras, números, hifens e underlines"
    ),
});

const UsernameForm = () => {
  const { user } = useUser();
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const currentSlug = useQuery(
    api.lib.usernames.getUserSlug,
    user?.id ? { userId: user.id } : "skip"
  );

  const availabilityCheck = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  const setUsername = useMutation(api.lib.usernames.setUsername);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const watchedUsername = form.watch("username");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(watchedUsername);
    }, 500);
    return () => clearTimeout(timer);
  }, [watchedUsername]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.id) return;
    try {
      const result = await setUsername({ username: values.username });
      if (result.success) {
        form.reset();
      } else {
        form.setError("username", { message: result.error });
      }
    } catch {
      form.setError("username", {
        message: "Erro ao atualizar. Tente novamente.",
      });
    }
  }

  const getStatus = () => {
    if (!debouncedUsername || debouncedUsername.length < 3) return null;
    if (debouncedUsername !== watchedUsername) return "verificando";
    if (!availabilityCheck) return "verificando";
    if (debouncedUsername === currentSlug) return "atual";
    return availabilityCheck.available ? "disponível" : "indisponível";
  };

  const status = getStatus();
  const hasCustomUsername = currentSlug && currentSlug !== user?.id;
  const isSubmitDisabled =
    status !== "disponível" || form.formState.isSubmitting;

  if (!user) return null;

  return (
    <div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Personalize seu link
        </h3>
        <p className="text-gray-600 text-sm">
          Escolha um nome de usuário personalizado para sua página de links.
        </p>
      </div>

      {hasCustomUsername && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Nome de usuário atual
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-green-800 bg-white px-2 py-1 rounded text-sm">
                {currentSlug}
              </span>
              <Link
                href={`/u/${currentSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
          <span className="text-sm font-medium text-gray-700">
            Prévia do seu link
          </span>
        </div>
        <div className="flex items-center">
          <Link
            href={`/u/${currentSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 font-mono text-gray-800 bg-white px-3 py-2 rounded-l border-l border-y hover:bg-gray-50 transition-colors truncate"
          >
            {getBaseUrl()}/u/{currentSlug}
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${getBaseUrl()}/u/${currentSlug}`);
              toast.success("Copiado para a área de transferência");
            }}
            className="flex items-center justify-center w-10 h-10 bg-white border rounded-r hover:bg-gray-50 transition-colors"
            title="Copiar"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de usuário</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="escolha-seu-nome"
                      {...field}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {status === "verificando" && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {status === "disponível" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {status === "atual" && (
                        <User className="w-4 h-4 text-blue-500" />
                      )}
                      {status === "indisponível" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Use apenas letras, números, hifens e underlines.
                </FormDescription>
                {status === "disponível" && (
                  <p className="text-sm text-green-600">
                    Nome de usuário disponível!
                  </p>
                )}
                {status === "atual" && (
                  <p className="text-sm text-blue-600">
                    Este é seu nome de usuário atual
                  </p>
                )}
                {status === "indisponível" && (
                  <p className="text-sm text-red-600">
                    {availabilityCheck?.error || "Nome de usuário em uso"}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            disabled={isSubmitDisabled}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar nome de usuário"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UsernameForm;
