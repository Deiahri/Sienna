"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * The visitor's answer to the analytics banner, kept in localStorage. Undefined until they answer.
 * Ported from the original site, including its once-a-second re-read, which picks up an answer
 * given in another tab.
 */
interface ConsentContextType {
  hasConsent: boolean | undefined;
  /** Whether the stored answer has been read yet. Until then, undefined means "don't know yet". */
  ready: boolean;
  setHasConsent: (value: boolean | undefined) => void;
}

const KEY = "_allowedAnalytics";

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

function read(): boolean | undefined {
  try {
    const consent = localStorage.getItem(KEY);
    return consent === "true" ? true : consent === "false" ? false : undefined;
  } catch {
    return undefined;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsent, setHasConsentState] = useState<boolean | undefined>(undefined);
  const [ready, setReady] = useState(false);

  const setHasConsent = (value: boolean | undefined) => {
    setHasConsentState(value);
    try {
      if (value !== undefined) localStorage.setItem(KEY, value.toString());
      else localStorage.removeItem(KEY);
    } catch {
      // Storage blocked: the answer holds for this page view only.
    }
  };

  useEffect(() => {
    const check = () => {
      setHasConsentState(read());
      setReady(true);
    };
    const first = setTimeout(check, 0);
    const interval = setInterval(check, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return <ConsentContext.Provider value={{ hasConsent, ready, setHasConsent }}>{children}</ConsentContext.Provider>;
}

export function useConsentContext(): ConsentContextType {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsentContext must be used within a ConsentProvider");
  return context;
}
