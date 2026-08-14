'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface HealthData {
  status: 'healthy' | 'degraded' | 'maintenance';
  maintenance: boolean;
  maintenanceMessage?: string | null;
  estimatedEndTime?: string | null;
  services?: {
    server?: { status: string; uptime?: string };
    database?: { status: string; latencyMs?: number };
  };
  system?: {
    timestamp?: string;
  };
}

interface HealthContextType {
  isHealthy: boolean;
  isMaintenance: boolean;
  isOffline: boolean;
  healthData: HealthData | null;
  lastChecked: Date | null;
  isChecking: boolean;
  checkHealth: () => Promise<boolean>;
  nextRetrySeconds: number;
}

const HealthContext = createContext<HealthContextType>({
  isHealthy: true,
  isMaintenance: false,
  isOffline: false,
  healthData: null,
  lastChecked: null,
  isChecking: false,
  checkHealth: async () => true,
  nextRetrySeconds: 15,
});

export const useHealth = () => useContext(HealthContext);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [nextRetrySeconds, setNextRetrySeconds] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const json = await res.json().catch(() => null);
      setLastChecked(new Date());

      if (res.status === 200 && json?.success) {
        setHealthData(json.data);
        setIsHealthy(true);
        setIsMaintenance(false);
        setIsOffline(false);
        setNextRetrySeconds(30);
        return true;
      } else if (res.status === 503 || json?.data?.maintenance || json?.status === 'maintenance') {
        setHealthData(json?.data || null);
        setIsHealthy(false);
        setIsMaintenance(true);
        setIsOffline(false);
        setNextRetrySeconds(15);
        return false;
      } else {
        // Degraded or error
        setHealthData(json?.data || null);
        setIsHealthy(false);
        setIsMaintenance(false);
        setIsOffline(true);
        setNextRetrySeconds(15);
        return false;
      }
    } catch (err: any) {
      setLastChecked(new Date());
      setIsHealthy(false);
      setIsMaintenance(false);
      setIsOffline(true);
      setNextRetrySeconds(15);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Periodic polling when healthy (every 60s) or countdown when offline/maintenance
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);

    if (!isHealthy || isOffline || isMaintenance) {
      // Countdown interval for visual timer
      setNextRetrySeconds(15);
      retryIntervalRef.current = setInterval(() => {
        setNextRetrySeconds((prev) => {
          if (prev <= 1) {
            checkHealth();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Normal background polling every 60s
      timerRef.current = setInterval(() => {
        checkHealth();
      }, 60000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
    };
  }, [isHealthy, isOffline, isMaintenance, checkHealth]);

  return (
    <HealthContext.Provider
      value={{
        isHealthy,
        isMaintenance,
        isOffline,
        healthData,
        lastChecked,
        isChecking,
        checkHealth,
        nextRetrySeconds,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}
