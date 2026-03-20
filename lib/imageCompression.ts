import imageCompression from 'browser-image-compression';

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savings: number;
}

export async function compressImageBeforeUpload(
  file: File,
  type: 'profile' | 'background'
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Configurações otimizadas por tipo
  const options = {
    profile: {
      maxSizeMB: 0.2,        // 200KB para foto de perfil
      maxWidthOrHeight: 500,  // Não precisa ser grande
      useWebWorker: true,
      initialQuality: 0.8,
    },
    background: {
      maxSizeMB: 0.8,         // 800KB para fundo
      maxWidthOrHeight: 1920, // Full HD é suficiente
      useWebWorker: true,
      initialQuality: 0.85,
    },
  };

  const config = options[type];

  // Só comprime se for maior que o limite
  if (file.size <= config.maxSizeMB * 1024 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savings: 0,
    };
  }

  try {
    const compressedFile = await imageCompression(file, config);

    const compressedSize = compressedFile.size;
    const savings = Math.round((1 - compressedSize / originalSize) * 100);

    console.log(`🖼️ Compressão: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (-${savings}%)`);

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      savings,
    };
  } catch (error) {
    console.warn('Falha na compressão, usando original:', error);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savings: 0,
    };
  }
}