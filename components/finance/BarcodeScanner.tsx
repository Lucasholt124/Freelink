"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const scannerInstance = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    let isMounted = true;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!isMounted) return;

      // Configuramos para a câmera traseira e melhoramos a proporção
      scannerInstance.current = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          formatsToSupport: [0, 1, 2, 3, 4], // EAN e afins
          videoConstraints: {
            facingMode: "environment", // 🔥 Força a usar a câmera de trás
          }
        },
        false
      );

      scannerInstance.current.render(
        (decodedText: string) => {
          if (scannerInstance.current) {
            scannerInstance.current.clear();
          }
          onScan(decodedText);
        },
        () => {
          // Ignora mensagens de console contínuas para não travar
        }
      );

      // Hack para injetar os atributos playsInline no vídeo (Conserta tela preta no iPhone)
      setTimeout(() => {
        const videoEl = document.querySelector('#reader video') as HTMLVideoElement;
        if (videoEl) {
          videoEl.setAttribute('playsinline', 'true');
          videoEl.setAttribute('webkit-playsinline', 'true');
          videoEl.setAttribute('muted', 'true');
        }
      }, 500);

      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-slate-900 rounded-xl p-2 relative overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
          <span className="text-white text-xs font-medium">Iniciando câmera...</span>
        </div>
      )}

      {/* Onde a mágica da câmera acontece */}
      <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-black [&>div]:!bg-transparent [&_video]:!object-cover"></div>

      <p className="text-xs text-gray-400 mt-3 font-medium text-center">
        Aponte a câmera para a etiqueta da peça.
      </p>
    </div>
  );
}