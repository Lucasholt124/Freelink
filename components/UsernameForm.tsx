"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  CheckCircle, AlertCircle, Loader2, Globe, Copy, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Apenas letras, números, - e _"),
});

export default function UsernameForm() {
  const { user } = useUser();
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const currentSlug = useQuery(api.lib.usernames.getUserSlug, user?.id ? { userId: user.id } : "skip");
  const availabilityCheck = useQuery(api.lib.usernames.checkUsernameAvailability, debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip");
  const setUsername = useMutation(api.lib.usernames.setUsername);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  const watchedUsername = form.watch("username");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(watchedUsername), 500);
    return () => clearTimeout(timer);
  }, [watchedUsername]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.id) return;
    try {
      const result = await setUsername({ username: values.username });
      if (result.success) {
        form.reset();
        toast.success("URL atualizada com sucesso!");
      } else {
        form.setError("username", { message: result.error });
      }
    } catch {
      toast.error("Erro ao atualizar URL");
    }
  }

  const getStatus = () => {
    if (!debouncedUsername || debouncedUsername.length < 3) return null;
    if (debouncedUsername !== watchedUsername) return "checking";
    if (!availabilityCheck) return "checking";
    if (debouncedUsername === currentSlug) return "current";
    return availabilityCheck.available ? "available" : "taken";
  };

  const status = getStatus();

  if (!user) return null;

  return (
    <div className="space-y-6">

      {/* Exibição da URL Atual (Estilo Cartão) */}
      {currentSlug && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
               <Globe className="w-5 h-5 text-blue-600" />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Seu Link Ativo</p>
                <div className="flex items-center gap-1 text-gray-900 font-mono font-medium">
                  <span className="text-gray-400">freelinnk.com/</span>
                  <span className="bg-blue-100 text-blue-800 px-1 rounded">{currentSlug}</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Button
               variant="outline"
               size="sm"
               className="flex-1 sm:flex-initial gap-2 text-gray-600"
               onClick={() => {
                 navigator.clipboard.writeText(`${getBaseUrl()}/u/${currentSlug}`);
                 toast.success("Link copiado!");
               }}
             >
               <Copy className="w-4 h-4" />
               Copiar
             </Button>
             <Link href={`/u/${currentSlug}`} target="_blank" className="flex-1 sm:flex-initial">
               <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                 Visitar <ArrowRight className="w-4 h-4" />
               </Button>
             </Link>
          </div>
        </div>
      )}

      {/* Formulário de Alteração */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Alterar URL</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none select-none">
                      freelinnk.com/
                    </div>
                    <Input
                      placeholder="seu-novo-nome"
                      {...field}
                      className="pl-[115px] pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-800"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {status === "checking" && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                      {status === "available" && <CheckCircle className="w-5 h-5 text-green-500 animate-bounce-short" />}
                      {status === "taken" && <AlertCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                </FormControl>

                <div className="min-h-[20px]">
                  {status === "available" && <p className="text-sm text-green-600 font-medium flex gap-1 items-center animate-in slide-in-from-left-2">Link disponível!</p>}
                  {status === "taken" && <p className="text-sm text-red-600 font-medium flex gap-1 items-center animate-in slide-in-from-left-2">Este nome já está em uso.</p>}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={status !== "available" || form.formState.isSubmitting}
            className="w-full h-11 bg-gray-900 hover:bg-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirmar Novo Link"}
          </Button>
        </form>
      </Form>
    </div>
  );
}