export async function prepareProductPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml")
    throw new Error("Escolha uma foto JPG, PNG ou WebP do produto.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Escolha uma foto de até 20 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.width || !image.height)
      throw new Error("Não foi possível ler esta foto.");
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Não foi possível preparar a foto neste aparelho.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.65, 0.48, 0.32]) {
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length < 630_000) return data;
    }
    throw new Error(
      "A foto ficou grande. Tente uma foto mais simples ou mais próxima do produto.",
    );
  } catch (error) {
    if (
      error instanceof Error &&
      !["EncodingError", "InvalidStateError"].includes(error.name)
    )
      throw error;
    throw new Error("Não consegui abrir essa foto. Tente JPG, PNG ou WebP.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
