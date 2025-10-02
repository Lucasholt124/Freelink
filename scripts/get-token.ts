import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function getToken() {
  const connection = await client.query(api.connections.get, {
    provider: "instagram"
  });

  if (connection && connection.accessToken) {
    console.log("\n🎉 Token encontrado:\n");
    console.log(connection.accessToken);
    console.log("\n📋 Adicione ao .env.local:\n");
    console.log(`ADMIN_INSTAGRAM_ACCESS_TOKEN=${connection.accessToken}`);
  } else {
    console.log("❌ Token não encontrado. Conecte-se primeiro em /api/connect/instagram");
  }
}

getToken();