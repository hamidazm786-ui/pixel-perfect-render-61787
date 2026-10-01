import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CameraOff, Cctv, Plus, X, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { agoSec, products, zones, type Camera } from "@/lib/mock-data";
import { PageHeader, StatusDot, Tag, CountDisplay, ReconBadge, EmptyState, Panel } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_console/shelves")({
  head: () => ({
    meta: [
      { title: "Shelves & Cameras — IntelliStock" },
      { name: "description", content: "Camera feeds, heartbeat status and zones under observation." },
      { property: "og:title", content: "Shelves & Cameras — IntelliStock" },
      { property: "og:description", content: "Camera feeds, heartbeat status and zones under observation." },
    ],
  }),
  component: Shelves,
});

function Frame({ cam, large }: { cam: Camera; large?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md border bg-sidebar grid-bg", large ? "aspect-video" : "aspect-[16/9]")}>
      {cam.online ? (
        <>
          <div className="absolute inset-0 scanline" />
          <div className="absolute inset-x-0 h-px bg-primary/50 animate-scan" />
          {cam.zones.map((z, i) => (
            <div key={z} className="absolute rounded-sm border border-primary/70" style={{ left: `${8 + i * (84 / cam.zones.length)}%`, top: "22%", width: `${78 / cam.zones.length}%`, height: "56%" }}>
              <span className="absolute -top-4 left-0 rounded-sm bg-primary px-1 font-mono text-[9px] text-primary-foreground">ROI {z}</span>
            </div>
          ))}
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px]"><StatusDot state="live" pulse /> REC · {cam.fps}fps</div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-critical/[0.06] scanline">
          <CameraOff className="size-6 text-critical" />
          <span className="font-mono text-[11px] text-critical">NO SIGNAL</span>
        </div>
      )}
      <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{cam.id}</span>
    </div>
  );
}

function Shelves() {
  const { cameras, setCameras } = useStore();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sel, setSel] = useState<Camera | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const list = showEmpty ? [] : cameras;

  return (
    <>
      <PageHeader
        title="Shelves & cameras"
        description={`${cameras.filter((c) => c.online).length} of ${cameras.length} cameras streaming`}
        actions={
          <>
            <button onClick={() => setShowEmpty(!showEmpty)} className="h-8 rounded-md border px-2.5 text-[12px] text-muted-foreground hover:bg-accent">{showEmpty ? "Show cameras" : "Preview empty state"}</button>
            <div className="flex rounded-md border p-0.5">
              {([["grid", LayoutGrid], ["list", List]] as const).map(([v, I]) => (
                <button key={v} onClick={() => setView(v)} className={cn("grid size-7 place-items-center rounded", view === v ? "bg-secondary" : "text-muted-foreground")}><I className="size-3.5" /></button>
              ))}
            </div>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground"><Plus className="size-3.5" />Add camera</button>
          </>
        }
      />

      {list.length === 0 ? (
        <EmptyState icon={Cctv} title="No cameras added yet" description="Connect an RTSP camera and draw shelf regions (ROIs) to start verified tracking." action={<button onClick={() => setShowEmpty(false)} className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">Add your first camera</button>} />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((c) => (
            <button key={c.id} onClick={() => setSel(c)} className={cn("rounded-lg border bg-surface p-2.5 text-left transition-colors hover:border-primary/40", !c.online && "border-critical/40")}>
              <Frame cam={c} />
              <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{c.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.location}</p>
                </div>
                {c.online ? <Tag tone="healthy"><StatusDot state="live" />Live</Tag> : <Tag tone="critical"><CameraOff className="size-3" />Offline</Tag>}
              </div>
              <div className="mt-2 flex items-center justify-between px-0.5 text-[11px] text-muted-foreground">
                <span>Heartbeat <span className={cn("font-mono", !c.online && "text-critical")}>{agoSec(c.heartbeatSec)}</span></span>
                <span className="font-mono">{c.zones.join(" · ")}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Panel bodyClassName="p-0">
          <table className="w-full text-[13px]">
            <thead className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2 text-left font-medium">Camera</th><th className="px-4 py-2 text-left font-medium">Location</th><th className="px-4 py-2 text-left font-medium">Status</th><th className="px-4 py-2 text-left font-medium">Heartbeat</th><th className="px-4 py-2 text-left font-medium">Zones</th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} onClick={() => setSel(c)} className="cursor-pointer border-b last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2"><span className="font-mono text-muted-foreground">{c.id}</span> {c.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.location}</td>
                  <td className="px-4 py-2">{c.online ? <Tag tone="healthy">Live</Tag> : <Tag tone="critical">Offline</Tag>}</td>
                  <td className="px-4 py-2 font-mono text-[12px]">{agoSec(c.heartbeatSec)}</td>
                  <td className="px-4 py-2 font-mono text-[12px]">{c.zones.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-sm"><span className="font-mono text-muted-foreground">{sel.id}</span>{sel.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <Frame cam={sel} large />
                <div className="grid grid-cols-3 gap-2 text-[12px]">
                  {[["Status", sel.online ? "Streaming" : "Offline"], ["Heartbeat", agoSec(sel.heartbeatSec)], ["Frame rate", `${sel.fps} fps`]].map(([k, v]) => (
                    <div key={k} className="rounded-md border bg-surface-2 p-2.5"><p className="text-muted-foreground">{k}</p><p className={cn("mt-0.5 font-mono", !sel.online && "text-critical")}>{v}</p></div>
                  ))}
                </div>
                {!sel.online && <p className="rounded-md border border-critical/40 bg-critical/[0.08] p-3 text-[12px] text-critical">Counts in these zones are frozen at their last verified state until the feed recovers.</p>}
                {sel.zones.map((zid) => {
                  const z = zones.find((x) => x.id === zid)!;
                  const items = products.filter((p) => p.zone === zid);
                  return (
                    <div key={zid}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[13px] font-medium"><span className="font-mono">{zid}</span> · {z.label}</p>
                        <span className="text-[11px] text-muted-foreground">{items.length} tracked</span>
                      </div>
                      <div className="divide-y rounded-md border">
                        {items.map((p) => (
                          <div key={p.sku} className="flex items-center justify-between gap-2 px-3 py-2 text-[12px]">
                            <span className="min-w-0 truncate">{p.name}</span>
                            <div className="flex shrink-0 items-center gap-2"><CountDisplay count={p.count} observed={p.observed} low={p.count < p.threshold} /><ReconBadge status={p.status} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => { setCameras(cameras.filter((c) => c.id !== sel.id)); setSel(null); }} className="flex h-8 items-center gap-1.5 text-[12px] text-muted-foreground hover:text-critical"><X className="size-3.5" />Remove camera</button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
