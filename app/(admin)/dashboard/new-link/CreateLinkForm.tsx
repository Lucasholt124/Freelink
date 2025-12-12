"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight, Link as LinkIcon, Loader2, UserCircle, BadgeCheck,
  Upload, MessageCircle, Mail
} from "lucide-react";

import {
  FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter, FaYoutube, FaWhatsapp
} from "react-icons/fa6";

// Schema mantido
const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório.").max(50, "Máximo 50 caracteres."),
  url: z.string().min(1, "A URL é obrigatória.").url("URL inválida."),
  customMessage: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const normalizeUrl = (url: string): string => {
  const formattedUrl = url.trim();
  // Se for email (mailto), não mexe. Se for url normal sem https, adiciona.
  if (formattedUrl.startsWith("mailto:")) return formattedUrl;

  if (formattedUrl && !/^(https?:\/\/|mailto:|tel:)/i.test(formattedUrl)) {
    return `https://${formattedUrl}`;
  }
  return formattedUrl;
};

// Lógica de Preview
const getPreviewIcon = (url: string, title: string) => {
  const u = url?.toLowerCase() || "";
  const t = title?.toLowerCase() || "";

  if (u.includes('mailto:')) return <Mail className="w-6 h-6 text-gray-600" />;
  if (u.includes('instagram')) return <FaInstagram className="w-6 h-6 text-[#E1306C]" />;
  if (u.includes('facebook')) return <FaFacebook className="w-6 h-6 text-[#1877F3]" />;
  if (u.includes('twitter') || u.includes('x.com')) return <FaTwitter className="w-6 h-6 text-[#1DA1F2]" />;
  if (u.includes('linkedin')) return <FaLinkedin className="w-6 h-6 text-[#0077B5]" />;
  if (u.includes('tiktok')) return <FaTiktok className="w-6 h-6 text-black" />;
  if (u.includes('whatsapp') || u.includes('wa.me')) return <FaWhatsapp className="w-6 h-6 text-[#25D366]" />;
  if (u.includes('youtube') || u.includes('youtu.be')) return <FaYoutube className="w-6 h-6 text-[#FF0000]" />;

  if (t.includes('vendedor')) return <UserCircle className="w-6 h-6 text-[#F59E0B]" />;
  if (t.includes('ceo')) return <BadgeCheck className="w-6 h-6 text-[#10B981]" />;

  return <LinkIcon className="w-6 h-6" />;
};

export default function CreateLinkForm() {
  const createLink = useMutation(api.lib.links.createLink);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", url: "", customMessage: "" },
    mode: "onChange",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      let storageId = undefined;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        if (!result.ok) throw new Error("Falha no upload da imagem");
        const { storageId: id } = await result.json();
        storageId = id;
      }

      let finalUrl = normalizeUrl(values.url);
      const u = finalUrl.toLowerCase();

      // LÓGICA INTELIGENTE: Verifica qual parâmetro usar
      if (values.customMessage) {
        const encodedMsg = encodeURIComponent(values.customMessage);

        // Caso 1: WhatsApp (?text=)
        if (u.includes("wa.me") || u.includes("whatsapp.com")) {
            if (!u.includes("text=")) {
                const separator = u.includes("?") ? "&" : "?";
                finalUrl = `${finalUrl}${separator}text=${encodedMsg}`;
            }
        }
        // Caso 2: Email (?body=)
        else if (u.includes("mailto:")) {
            if (!u.includes("body=")) {
                const separator = u.includes("?") ? "&" : "?";
                finalUrl = `${finalUrl}${separator}body=${encodedMsg}`;
            }
        }
      }

      await createLink({
        title: values.title.trim(),
        url: finalUrl,
        thumbnailStorageId: storageId,
      });

      toast.success("Link criado com sucesso! 🎉");
      setTimeout(() => router.push("/dashboard/links"), 800);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar link. Tente novamente.");
    }
  };

  const { isSubmitting, isValid } = form.formState;
  const watchedTitle = form.watch("title");
  const watchedUrl = form.watch("url")?.toLowerCase() || "";

  // Verifica se é um link que suporta mensagem
  const isWhatsApp = watchedUrl.includes("wa.me") || watchedUrl.includes("whatsapp");
  const isEmail = watchedUrl.includes("mailto:");

  // Mostra o campo se for um dos dois
  const showMessageField = isWhatsApp || isEmail;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg mx-auto">

        {/* Upload de Ícone */}
        <div className="space-y-3">
          <FormLabel className="font-semibold text-gray-800">Ícone Personalizado (Opcional)</FormLabel>
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-purple-500 overflow-hidden relative",
                imagePreview ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-gray-50"
              )}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolher Imagem
              </Button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-xs text-red-500 hover:underline text-left"
                >
                  Remover ícone
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-800">Título do Link</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Falar no WhatsApp..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-800">URL de Destino</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: wa.me/55... ou mailto:contato@..."
                  {...field}
                  onBlur={() => field.onChange(normalizeUrl(field.value))}
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Cole o link do WhatsApp ou digite mailto:email@... para e-mail.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* MENSAGEM AUTOMÁTICA (Aparece para WhatsApp e Email) */}
        {showMessageField && (
            <div className={clsx(
                "p-4 border rounded-xl animate-in fade-in slide-in-from-top-2 duration-300",
                isWhatsApp ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
            )}>
                <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center gap-2 mb-2">
                        {isWhatsApp ? <MessageCircle className="w-4 h-4 text-green-600" /> : <Mail className="w-4 h-4 text-blue-600" />}
                        <FormLabel className={clsx("font-semibold m-0", isWhatsApp ? "text-green-800" : "text-blue-800")}>
                            {isWhatsApp ? "Mensagem do WhatsApp (Opcional)" : "Corpo do E-mail (Opcional)"}
                        </FormLabel>
                    </div>
                    <FormControl>
                        <Textarea
                            placeholder={isWhatsApp
                                ? "Ex: Olá! Vim pelo Freelinnk e quero comprar..."
                                : "Ex: Olá, gostaria de solicitar um orçamento..."
                            }
                            className={clsx(
                                "bg-white resize-none h-20 focus-visible:ring-offset-0",
                                isWhatsApp ? "border-green-200 focus-visible:ring-green-500" : "border-blue-200 focus-visible:ring-blue-500"
                            )}
                            {...field}
                        />
                    </FormControl>
                    <FormDescription className={clsx("text-xs", isWhatsApp ? "text-green-700" : "text-blue-700")}>
                        {isWhatsApp
                           ? "O cliente já inicia a conversa com esse texto escrito."
                           : "O cliente abrirá o app de email com esse texto já preenchido."}
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        )}

        {/* Preview do Botão */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-600">Pré-visualização:</h3>
          <div className={clsx(
              "flex items-center gap-3 w-full rounded-xl py-4 px-6 font-bold text-lg shadow-md border-2 transition-all duration-300 select-none",
              isValid || imagePreview ? "bg-purple-600 text-white border-purple-700" : "bg-gray-100 text-gray-400"
            )}>

            <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/20">
               {imagePreview ? (
                 <img src={imagePreview} className="w-full h-full object-cover" alt="icon" />
               ) : (
                 getPreviewIcon(watchedUrl, watchedTitle)
               )}
            </div>

            <span className="flex-1 truncate">{watchedTitle || "Seu Título Aqui"}</span>
            <ArrowRight className="w-5 h-5 opacity-50" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || (!isValid && !imagePreview)}
          className="w-full py-6 text-base font-bold"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Criar Link"}
        </Button>
      </form>
    </Form>
  );
}