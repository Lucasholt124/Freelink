// actions/linkActions.ts
"use server";

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

// Esta função salva ou atualiza um link na sua nova tabela "Links" no Postgres
export async function saveLinkInPostgres(link: { id: string; url: string; title: string; userId: string }) {
  try {
    await sql`
      INSERT INTO "Links" (id, url, title, "userId")
      VALUES (${link.id}, ${link.url}, ${link.title}, ${link.userId})
      ON CONFLICT (id)
      DO UPDATE SET
        url = EXCLUDED.url,
        title = EXCLUDED.title,
        "updatedAt" = NOW();
    `;
    revalidatePath('/dashboard'); // Atualiza o cache para refletir as mudanças
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar link no Postgres:", error);
    return { success: false, error: "Falha ao salvar o link." };
  }
}