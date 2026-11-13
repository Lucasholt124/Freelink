import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { businessSegments } from "@/lib/ad-policy";
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  try {
    const { title, text, links = [] } = await req.json();
    if (
      (title !== undefined && typeof title !== "string") ||
      (text !== undefined && typeof text !== "string") ||
      !Array.isArray(links) ||
      links.length > 50 ||
      links.some((l) => typeof l !== "string")
    )
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const content = `${title || ""} ${text || ""} ${links.join(" ")}`;
    if (content.length > 20000)
      return NextResponse.json(
        { error: "Texto muito longo." },
        { status: 400 },
      );
    const detected = businessSegments(undefined, content);
    return NextResponse.json({
      niche: detected[0] || "geral",
      segments: detected,
    });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
