// hooks/usePerformanceMode.ts
"use client";

import { useEffect, useState } from "react";

interface PerformanceConfig {
  isLowPower: boolean;
  canUseParticles: boolean;
  canUseBlur: boolean;
  canUseHeavyAnimations: boolean;
  recommendedBlur: number;
  animationDuration: number;
}

// Interfaces para APIs experimentais/não-padrão
interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
  connection?: NetworkInformation;
  getBattery?: () => Promise<BatteryManager>;
}

export function usePerformanceMode(): PerformanceConfig {
  const [config, setConfig] = useState<PerformanceConfig>({
    isLowPower: false,
    canUseParticles: true,
    canUseBlur: true,
    canUseHeavyAnimations: true,
    recommendedBlur: 20,
    animationDuration: 0.3,
  });

  useEffect(() => {
    const nav = navigator as ExtendedNavigator;

    // 1. Preferência do usuário (acessibilidade)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 2. Detectar hardware
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;

    // 3. Detectar conexão lenta
    const connection = nav.connection;
    const isSlowConnection = connection?.effectiveType === '2g' ||
                             connection?.effectiveType === 'slow-2g' ||
                             connection?.saveData === true;

    // 4. Detectar se é mobile
    const isMobile = window.innerWidth < 768;

    // 5. Detectar bateria baixa (se disponível)
    let isLowBattery = false;
    if ('getBattery' in nav && nav.getBattery) {
      nav.getBattery().then((battery) => {
        if (battery.level < 0.2 && !battery.charging) {
          isLowBattery = true;
          updateConfig(true);
        }
      }).catch(() => {});
    }

    // Lógica de decisão
    const isPotatoPhone = cores < 4 || memory < 4;
    const shouldReduceEffects = prefersReducedMotion || isPotatoPhone || isSlowConnection || isLowBattery;
    const isMediumDevice = isMobile && !isPotatoPhone;

    function updateConfig(forceLowPower = false) {
      if (forceLowPower || shouldReduceEffects) {
        // Modo Batata: Desliga tudo pesado
        setConfig({
          isLowPower: true,
          canUseParticles: false,
          canUseBlur: false,
          canUseHeavyAnimations: false,
          recommendedBlur: 0,
          animationDuration: 0.1,
        });
      } else if (isMediumDevice) {
        // Modo Médio: Reduz mas não desliga
        setConfig({
          isLowPower: false,
          canUseParticles: false, // Partículas são pesadas
          canUseBlur: true,
          canUseHeavyAnimations: true,
          recommendedBlur: 10,
          animationDuration: 0.2,
        });
      }
      // Senão: mantém o padrão (high performance)
    }

    updateConfig();

    // Listener para mudanças de conexão
    if (connection) {
      connection.addEventListener('change', () => {
        const newIsSlowConnection = connection.effectiveType === '2g' ||
                                    connection.effectiveType === 'slow-2g';
        if (newIsSlowConnection) {
          updateConfig(true);
        }
      });
    }
  }, []);

  return config;
}