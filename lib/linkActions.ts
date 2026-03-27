// linkActions.ts
// Postgres link storage was removed. This file is kept as a stub.
'use server';

import { revalidatePath } from 'next/cache';

export async function saveLinkInPostgres(_link: { id: string; url: string; title: string; userId: string }) {
  // No-op: Postgres removed. Links are stored in Convex.
  revalidatePath('/dashboard');
  return { success: true };
}