// Em lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// A função 'cn' que você já tinha, usada para mesclar classes do Tailwind.
// Nenhuma alteração necessária aqui.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A NOVA FUNÇÃO 'getBaseUrl' adicionada ao final do arquivo.
// Ela determina a URL base da sua aplicação, seja em desenvolvimento ou em produção.
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // No lado do cliente (browser), a URL base é a origem da janela.
    // Retornamos uma string vazia para que caminhos relativos como '/dashboard' funcionem.
    return '';
  }

  // No lado do servidor, precisamos ler as variáveis de ambiente.
  // A Vercel define a variável VERCEL_URL com a URL de produção/preview.
  if (process.env.VERCEL_URL) {
    return `https://` + process.env.VERCEL_URL;
  }

  // Se não estiver na Vercel, assumimos que está rodando localmente.
  // Usamos a porta 3000 como padrão se a variável PORT não estiver definida.
  return `http://localhost:${process.env.PORT ?? 3000}`;
}