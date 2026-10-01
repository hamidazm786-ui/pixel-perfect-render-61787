import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Cctv, AlertTriangle, ShieldCheck, Sparkles, ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { zones, products, ago, type ZoneHealth } from "@/lib/mock-data";
import { Panel, LiveIndicator, AnimatedNumber, ConfidenceBadge, StatusDot, PageHeader, SkeletonRow } from "@/components/app/primitives";
import { examplePrompts } from "@/components/app/copilot";

export const Route = createFileRoute("/_console/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — IntelliStock" },
      { name: "description", content: "Live overview of verified shelf inventory, zone health and recent events." },
      { property: "og:title", content: "Dashboard — IntelliStock" },
      { property: "og:description", content: "Live overview of verified shelf inventory, zone health and recent events." },
    ],
  }),
  component: Dashboard,
});

const healthStyles: Record<ZoneHealth, string> = {
  healthy: "border-healthy/30 bg-healthy/[0.07]",
  low: "border-warning/40 bg-warning/[0.08]",
  offline: "border-critical/50 bg-critical/[0.08] scanline",
  pending: "pending-hatch",
};
const healthLabel: Record<ZoneHealth, string> = { healthy: "Verified", low: "Low stock", offline: "Camera offline", pending: "Reconciling" };

function Dashboard() {
  const { alerts, events, confidence, cameras, setCopilotOpen } = useStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  const lowCount = alerts.filter((a) => a.type === "low_stock" && !a.acknowledged).length;
  const online = cameras.filter((c) => c.online).length;

  const kpis = [
    { label: "Total SKUs tracked", value: products.length * 10 + 7, icon: Boxes, sub: "across 16 zones", to: "/inventory" as const },
    { label: "Active cameras", value: online, suffix: ` / ${cameras.length}`, icon: Cctv, sub: `${cameras.length - online} offline`, tone: cameras.length - online > 0 ? "critical" : undefined, to: "/shelves" as const },
    { label: "Low stock alerts", value: lowCount, icon: AlertTriangle, sub: "unacknowledged", tone: "warning", to: "/alerts" as const },
    { label: "Reconciliation confidence", value: confidence, suffix: "%", icon: ShieldCheck, sub: "avg · last 15 min", to: "/inventory" as const },
  ];

  return (
    <>
      <PageHeader title="Store overview" description="Downtown Flagship · Floor 1" actions={<LiveIndicator />} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="group rounded-lg border bg-surface p-4 transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground">
              {k.label}
              <k.icon className={cn("size-4", k.tone === "warning" && "text-warning", k.tone === "critical" && "text-critical")} />
            </div>
            <div className="mt-3 text-[28px] font-semibold leading-none tracking-tight">
              <AnimatedNumber value={k.value} />
              {k.suffix && <span className="font-mono text-base text-muted-foreground">{k.suffix}</span>}
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px]">
              <span className={cn("text-muted-foreground", k.tone === "critical" && "text-critical", k.tone === "warning" && "text-warning")}>{k.sub}</span>
              <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel
            title="Zone status map"
            action={
              <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
                {(["healthy", "low", "offline", "pending"] as const).map((h) => (
                  <span key={h} className="flex items-center gap-1.5"><StatusDot state={h} />{healthLabel[h]}</span>
                ))}
              </div>
            }
          >
            <div className="space-y-2.5">
              {["A", "B", "C", "D"].map((aisle) => (
                <div key={aisle} className="flex items-stretch gap-2.5">
                  <div className="grid w-8 shrink-0 place-items-center rounded-md border bg-surface-2 font-mono text-[11px] text-muted-foreground">{aisle}</div>
                  <div className="grid flex-1 grid-cols-2 gap-2.5 lg:grid-cols-4">
                    {zones.filter((z) => z.aisle === aisle).map((z) => (
                      <Link key={z.id} to="/inventory" search={{ zone: z.id }} className={cn("rounded-md border p-2.5 transition-transform hover:-translate-y-px", healthStyles[z.health])}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] font-semibold">{z.id}</span>
                          <StatusDot state={z.health} pulse={z.health === "offline"} />
                        </div>
                        <p className="mt-1 truncate text-[11px] text-muted-foreground">{z.label}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className={cn(z.health === "offline" ? "text-critical" : z.health === "low" ? "text-warning" : "text-muted-foreground")}>{healthLabel[z.health]}</span>
                          <span className="font-mono text-muted-foreground">{z.health === "offline" ? "—" : `${z.confidence}%`}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/25 bg-primary/[0.06] p-3">
            <Sparkles className="ml-1 size-4 text-primary" />
            <button onClick={() => setCopilotOpen(true)} className="h-8 flex-1 rounded-md border bg-surface px-3 text-left text-[13px] text-muted-foreground hover:border-primary/40">
              Ask AI about your inventory…
            </button>
            <div className="hidden gap-1.5 lg:flex">
              {examplePrompts.slice(0, 2).map((p) => (
                <button key={p} onClick={() => setCopilotOpen(true)} className="h-8 rounded-md border bg-surface px-2.5 text-[12px] text-muted-foreground hover:text-foreground">{p}</button>
              ))}
            </div>
          </div>
        </div>

        <Panel title="Verified activity" action={<LiveIndicator />} bodyClassName="p-0">
          <div className="max-h-[560px] overflow-y-auto">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="space-y-2 border-b px-4 py-3"><SkeletonRow className="w-2/3" /><SkeletonRow className="w-1/3" /></div>
                ))
              : events.map((e) => {
                  const down = e.to < e.from;
                  return (
                    <div key={e.id} className={cn("border-b px-4 py-2.5", e.minAgo === 0 && "animate-slide-in")}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12.5px] leading-snug">
                          <span className="font-mono text-muted-foreground">Shelf {e.zone}</span> · {e.product}
                        </p>
                        <ConfidenceBadge value={e.confidence} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono">
                          {e.from}
                          {down ? <ArrowDown className="size-3 text-warning" /> : <ArrowUp className="size-3 text-healthy" />}
                          <span className="font-semibold text-foreground">{e.to}</span>
                          <span className="ml-1 font-sans text-verified">· verified</span>
                        </span>
                        <span>{e.minAgo === 0 ? "just now" : ago(e.minAgo)}</span>
                      </div>
                    </div>
                  );
                })}
          </div>
        </Panel>
      </div>
    </>
  );
}
