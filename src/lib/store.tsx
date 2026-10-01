import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { initialAlerts, initialEvents, products, cameras as initialCameras, type Alert, type FeedEvent, type Camera } from "./mock-data";

interface Store {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  alerts: Alert[];
  acknowledge: (id: string) => void;
  acknowledgeAll: () => void;
  events: FeedEvent[];
  confidence: number;
  cameras: Camera[];
  setCameras: (c: Camera[]) => void;
  copilotOpen: boolean;
  setCopilotOpen: (o: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [events, setEvents] = useState(initialEvents);
  const [confidence, setConfidence] = useState(93.4);
  const [cameras, setCameras] = useState(initialCameras);
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("is-theme");
    if (saved === "light" || saved === "dark") setThemeState(saved);
  }, []);

  const setTheme = useCallback((t: "dark" | "light") => {
    setThemeState(t);
    localStorage.setItem("is-theme", t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Simulated live verified events
  useEffect(() => {
    let n = 100;
    const id = setInterval(() => {
      const p = products[Math.floor(Math.random() * products.length)];
      const delta = Math.random() > 0.8 ? Math.ceil(Math.random() * 6) : -Math.ceil(Math.random() * 3);
      const from = Math.max(p.count, 3);
      const ev: FeedEvent = {
        id: `live-${n++}`,
        zone: p.zone,
        product: p.name,
        from,
        to: Math.max(0, from + delta),
        confidence: 86 + Math.floor(Math.random() * 14),
        minAgo: 0,
      };
      setEvents((prev) => [ev, ...prev.map((e) => e)].slice(0, 30));
      setConfidence((c) => Math.round(Math.min(98.5, Math.max(89, c + (Math.random() - 0.5) * 1.2)) * 10) / 10);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const acknowledge = useCallback((id: string) => setAlerts((a) => a.map((x) => (x.id === id ? { ...x, acknowledged: true } : x))), []);
  const acknowledgeAll = useCallback(() => setAlerts((a) => a.map((x) => ({ ...x, acknowledged: true }))), []);

  return (
    <Ctx.Provider value={{ theme, setTheme, alerts, acknowledge, acknowledgeAll, events, confidence, cameras, setCameras, copilotOpen, setCopilotOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
