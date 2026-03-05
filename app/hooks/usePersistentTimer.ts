"use client";

import { useState, useEffect, useRef } from "react";

interface UsePersistentTimerOptions {
  /** Duração total do timer em segundos */
  durationSeconds: number;
  /** Chave para salvar no localStorage (cada timer deve ter uma chave única) */
  storageKey: string;
  /** Se o timer está ativo (só começa a contar quando true) */
  enabled?: boolean;
}

interface UsePersistentTimerReturn {
  /** Segundos restantes */
  timeLeft: number;
  /** Se o timer já expirou (timeLeft === 0) */
  isExpired: boolean;
  /** Minutos restantes (formatado: "05") */
  minutes: string;
  /** Segundos restantes (formatado: "30") */
  seconds: string;
  /** String formatada "MM:SS" */
  formatted: string;
  /** Reseta o timer (limpa localStorage e recomeça) */
  reset: () => void;
}

/**
 * Hook reutilizável para criar um timer regressivo persistente.
 *
 * Salva o timestamp de início no localStorage, então mesmo que o
 * usuário recarregue a página ou feche o navegador, o timer
 * continua de onde parou.
 *
 * @example
 * const { formatted, isExpired } = usePersistentTimer({
 *   durationSeconds: 900,       // 15 minutos
 *   storageKey: "welcome_offer",
 *   enabled: isModalOpen,
 * });
 */
export function usePersistentTimer(
  options: UsePersistentTimerOptions
): UsePersistentTimerReturn {
  const { durationSeconds, storageKey, enabled = true } = options;
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fullKey = `freelinnk_timer_${storageKey}`;

  // Calcula o tempo restante com base no timestamp salvo
  const calculateRemaining = (startTime: number): number => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  };

  useEffect(() => {
    if (!enabled) return;

    // 1. Recupera ou cria o timestamp de início
    const savedStart = localStorage.getItem(fullKey);
    let startTime: number;

    if (savedStart) {
      startTime = parseInt(savedStart, 10);

      // Proteção contra valores corrompidos
      if (isNaN(startTime) || startTime <= 0) {
        startTime = Date.now();
        localStorage.setItem(fullKey, String(startTime));
      }
    } else {
      startTime = Date.now();
      localStorage.setItem(fullKey, String(startTime));
    }

    // 2. Seta o valor inicial
    setTimeLeft(calculateRemaining(startTime));

    // 3. Atualiza a cada segundo
    intervalRef.current = setInterval(() => {
      const remaining = calculateRemaining(startTime);
      setTimeLeft(remaining);

      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, durationSeconds, fullKey]);

  // Função para resetar o timer
  const reset = () => {
    localStorage.removeItem(fullKey);
    const newStart = Date.now();
    localStorage.setItem(fullKey, String(newStart));
    setTimeLeft(durationSeconds);
  };

  // Formatação
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const minutes = mins.toString().padStart(2, "0");
  const seconds = secs.toString().padStart(2, "0");
  const formatted = `${minutes}:${seconds}`;
  const isExpired = timeLeft <= 0;

  return { timeLeft, isExpired, minutes, seconds, formatted, reset };
}