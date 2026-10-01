import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, Database, Sparkles, Bell, Camera as CamIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { products } from "@/lib/mock-data";

type Ref = { kind: "sku" | "alert" | "camera" | "event"; label: string; sku?: string };
type Msg = { role: "user" | "ai"; text: string; refs?: Ref[]; table?: { cols: string[]; rows: string[][] } };

export const examplePrompts = [
  "Why did Zone A-3 drop this morning?",
  "What's trending low?",
  "Which cameras are offline?",
  "Show pending reconciliations",
];

function answer(q: string): Msg {
  const s = q.toLowerCase();
  if (s.includes("offline") || s.includes("camera")) {
    return {
      role: "ai",
      text: "1 camera is offline. CAM-05 (Dairy Cooler) last sent a heartbeat 41 minutes ago. Counts in Zone C-1 are held at their last verified state and will not update until the feed recovers — including Olper's Milk 1L, last verified at 0 units.",
      refs: [
        { kind: "camera", label: "CAM-05 · offline 41m" },
        { kind: "alert", label: "Alert · Camera offline" },
        { kind: "sku", label: "DAI-4012", sku: "DAI-4012" },
      ],
    };
  }
  if (s.includes("pending") || s.includes("reconcil")) {
    const p = products.filter((x) => x.status === "pending");
    return {
      role: "ai",
      text: `${p.length} SKUs have camera observations awaiting reconciliation. These are not yet committed — verified counts stay authoritative until the observation persists across the confirmation window.`,
      table: { cols: ["SKU", "Verified", "Observed", "Zone"], rows: p.map((x) => [x.sku, String(x.count), String(x.observed), x.zone]) },
      refs: p.slice(0, 3).map((x) => ({ kind: "sku" as const, label: x.sku, sku: x.sku })),
    };
  }
  if (s.includes("low") || s.includes("trend")) {
    const p = products.filter((x) => x.count < x.threshold).sort((a, b) => a.count / a.threshold - b.count / b.threshold);
    return {
      role: "ai",
      text: `${p.length} SKUs are below their low-stock threshold based on verified counts. Most critical is Olper's Full Cream Milk 1L at 0 units, though note its zone camera is offline.`,
      table: { cols: ["SKU", "Product", "Count", "Threshold"], rows: p.slice(0, 6).map((x) => [x.sku, x.name, String(x.count), String(x.threshold)]) },
      refs: p.slice(0, 3).map((x) => ({ kind: "sku" as const, label: x.sku, sku: x.sku })),
    };
  }
  if (s.includes("a-3") || s.includes("drop") || s.includes("why")) {
    return {
      role: "ai",
      text: "Zone A-3 dropped because Lay's Classic Salted 52g went from 12 → 9 in a verified event 3 minutes ago (confidence 96%). Over the past 12 snapshots, it has fallen steadily from 31 units, consistent with normal sell-through — no anomaly was raised. It is now below its threshold of 18.",
      refs: [
        { kind: "event", label: "Event · A-3 12→9 · 96%" },
        { kind: "sku", label: "SNK-2011", sku: "SNK-2011" },
        { kind: "alert", label: "Alert · Low stock" },
      ],
    };
  }
  return {
    role: "ai",
    text: "I couldn't find verified data matching that question. I only answer from reconciled inventory, events and camera status — try asking about a zone, a SKU, low stock, or camera health.",
    refs: [],
  };
}

function RefChip({ r }: { r: Ref }) {
  const Icon = r.kind === "alert" ? Bell : r.kind === "camera" ? CamIcon : Database;
  const cls = "inline-flex h-6 items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 font-mono text-[11px] text-primary transition-colors hover:bg-primary/20";
  if (r.kind === "sku") return <Link to="/inventory" search={{ sku: r.sku }} className={cls}><Icon className="size-3" />{r.label}</Link>;
  if (r.kind === "alert") return <Link to="/alerts" className={cls}><Icon className="size-3" />{r.label}</Link>;
  if (r.kind === "camera") return <Link to="/shelves" className={cls}><Icon className="size-3" />{r.label}</Link>;
  return <span className={cls}><Icon className="size-3" />{r.label}</span>;
}

export function CopilotChat({ compact }: { compact?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, thinking]);

  const send = (q: string) => {
    if (!q.trim() || thinking) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, answer(q)]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex-1 space-y-5 overflow-y-auto", compact ? "p-4" : "p-6")}>
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="grid size-10 place-items-center rounded-md border border-primary/30 bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Ask about your inventory</p>
              <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">Answers are grounded only in verified counts, events and camera status — every claim is cited.</p>
            </div>
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {examplePrompts.map((p) => (
                <button key={p} onClick={() => send(p)} className="rounded-md border bg-surface-2 px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end animate-slide-in">
              <div className="max-w-[80%] rounded-lg bg-secondary px-3 py-2 text-[13px]">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 animate-slide-in">
              <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded border border-primary/30 bg-primary/10">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="text-[13px] leading-relaxed">{m.text}</p>
                {m.table && (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-[12px]">
                      <thead className="bg-surface-2 text-muted-foreground">
                        <tr>{m.table.cols.map((c) => <th key={c} className="px-2.5 py-1.5 text-left font-medium">{c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {m.table.rows.map((r, j) => (
                          <tr key={j} className="border-t">{r.map((c, k) => <td key={k} className={cn("px-2.5 py-1.5", k === 0 && "font-mono")}>{c}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {m.refs && m.refs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Sources</span>
                    {m.refs.map((r, j) => <RefChip key={j} r={r} />)}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Sparkles className="size-3.5 animate-pulse text-primary" /> Querying verified inventory…
          </div>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t p-3">
        <div className="flex items-center gap-2 rounded-md border bg-surface-2 px-3 focus-within:border-primary/50">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about stock, zones, cameras…" className="h-10 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
          <button type="submit" disabled={!input.trim()} className="grid size-7 place-items-center rounded bg-primary text-primary-foreground disabled:opacity-40">
            <ArrowUp className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
