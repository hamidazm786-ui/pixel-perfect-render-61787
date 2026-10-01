import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PackageMinus, CameraOff, Activity, Check, BellOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { ago, type AlertType, type Severity } from "@/lib/mock-data";
import { PageHeader, Tag, severityTone, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_console/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — IntelliStock" },
      { name: "description", content: "Low stock, camera offline and anomaly alerts from verified state changes." },
      { property: "og:title", content: "Alerts — IntelliStock" },
      { property: "og:description", content: "Low stock, camera offline and anomaly alerts from verified state changes." },
    ],
  }),
  component: Alerts,
});

const typeIcon = { low_stock: PackageMinus, camera_offline: CameraOff, anomaly: Activity };
const typeLabel: Record<AlertType, string> = { low_stock: "Low stock", camera_offline: "Camera offline", anomaly: "Anomaly" };
const sevStyle: Record<Severity, string> = {
  critical: "border-l-critical",
  warning: "border-l-warning",
  info: "border-l-chart-2",
};

function Alerts() {
  const { alerts, acknowledge, acknowledgeAll } = useStore();
  const [status, setStatus] = useState<"open" | "all">("open");
  const [type, setType] = useState<AlertType | "all">("all");
  const list = alerts.filter((a) => (status === "all" || !a.acknowledged) && (type === "all" || a.type === type));
  const open = alerts.filter((a) => !a.acknowledged).length;

  return (
    <>
      <PageHeader
        title="Alerts"
        description={`${open} unacknowledged · raised only from verified state changes`}
        actions={open > 0 && <button onClick={() => { acknowledgeAll(); toast.success("All alerts acknowledged"); }} className="h-8 rounded-md border px-3 text-[12px] hover:bg-accent">Acknowledge all</button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex rounded-md border p-0.5 text-[12px]">
          {(["open", "all"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={cn("h-7 rounded px-2.5", status === s ? "bg-secondary font-medium" : "text-muted-foreground")}>{s === "open" ? "Unacknowledged" : "All"}</button>
          ))}
        </div>
        <div className="flex rounded-md border p-0.5 text-[12px]">
          {(["all", "low_stock", "camera_offline", "anomaly"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("h-7 rounded px-2.5", type === t ? "bg-secondary font-medium" : "text-muted-foreground")}>{t === "all" ? "All types" : typeLabel[t]}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={BellOff} title="No alerts" description="Nothing needs your attention right now. New alerts appear here when verified inventory changes cross a threshold." />
      ) : (
        <div className="space-y-6">
          {(["critical", "warning", "info"] as const).map((sev) => {
            const group = list.filter((a) => a.severity === sev).sort((a, b) => a.minAgo - b.minAgo);
            if (!group.length) return null;
            return (
              <section key={sev}>
                <div className="mb-2 flex items-center gap-2">
                  <Tag tone={severityTone(sev)} className="capitalize">{sev}</Tag>
                  <span className="text-[12px] text-muted-foreground">{group.length}</span>
                </div>
                <div className="divide-y overflow-hidden rounded-lg border bg-surface">
                  {group.map((a) => {
                    const I = typeIcon[a.type];
                    return (
                      <div key={a.id} className={cn("flex items-start gap-3 border-l-2 p-3.5", sevStyle[sev], a.acknowledged && "opacity-55")}>
                        <div className={cn("grid size-8 shrink-0 place-items-center rounded-md border", sev === "critical" ? "border-critical/40 bg-critical/10 text-critical" : sev === "warning" ? "border-warning/40 bg-warning/10 text-warning" : "bg-surface-2 text-chart-2")}>
                          <I className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium">{a.title}</p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">{a.detail}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Tag>{typeLabel[a.type]}</Tag>
                            <Tag className="font-mono">Zone {a.zone}</Tag>
                            {a.sku && <Tag className="font-mono">{a.sku}</Tag>}
                            <span>· {ago(a.minAgo)}</span>
                          </div>
                        </div>
                        {a.acknowledged ? (
                          <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Check className="size-3.5" />Acknowledged</span>
                        ) : (
                          <button onClick={() => { acknowledge(a.id); toast("Alert acknowledged"); }} className="h-8 shrink-0 rounded-md border px-3 text-[12px] font-medium hover:border-primary/40 hover:text-primary">Acknowledge</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
