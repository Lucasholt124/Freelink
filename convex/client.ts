import { ConvexHttpClient, ConvexClient } from "convex/browser";

// HTTP client
export const getHttpClient = () => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL não está definido");
  }
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
};

// Cliente de assinatura
export const getClient = () => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL não está definido");
  }
  return new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
};