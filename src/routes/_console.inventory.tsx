import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { products, zones, ago, type ReconStatus } from "@/lib/mock-data";
import { PageHeader, ReconBadge, CountDisplay, Panel, Sparkline, EmptyState, Tag } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Search = { q?: string; zone?: string; status?: ReconStatus; sku?: string };

export const Route = createFileRoute("/_console/inventory")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    zone: typeof s.zone === "string" ? s.zone : undefined,
    status: s.status === "verified" || s.status === "pending" || s.status === "flagged" ? s.status : undefined,
    sku: typeof s.sku === "string" ? s.sku : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Inventory — IntelliStock" },
      { name: "description", content: "Verified and pending counts for every tracked SKU." },
      { property: "og:title", content: "Inventory — IntelliStock" },
      { property: "og:description", content: "Verified and pending counts for every tracked SKU." },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/inventory" });
  const set = (patch: Partial<Search>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });

  const rows = useMemo(() => {
    const q = (search.q ?? "").toLowerCase();
    return products.filter((p) => (!search.zone || p.zone === search.zone) && (!search.status || p.status === search.status) && (!q || p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)));
  }, [search.q, search.zone, search.status]);

  const sel = products.find((p) => p.sku === search.sku);
  const counts = { verified: products.filter((p) => p.status === "verified").length, pending: products.filter((p) => p.status === "pending").length, flagged: products.filter((p) => p.status === "flagged").length };
  const select = "h-8 rounded-md border bg-surface px-2 text-[12px] outline-none";

  return (
    <>
      <PageHeader title="Inventory" description="Solid counts are verified and committed. Hatched values are camera observations still being reconciled." />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex h-8 w-64 items-center gap-2 rounded-md border bg-surface px-2.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={search.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Search SKU or product" className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground" />
        </div>
        <select value={search.zone ?? ""} onChange={(e) => set({ zone: e.target.value || undefined })} className={select}>
          <option value="">All zones</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.id} · {z.label}</option>)}
        </select>
        <div className="flex rounded-md border p-0.5 text-[12px]">
          {([undefined, "verified", "pending", "flagged"] as const).map((s) => (
            <button key={s ?? "all"} onClick={() => set({ status: s })} className={cn("h-7 rounded px-2.5 capitalize", search.status === s ? "bg-secondary font-medium" : "text-muted-foreground")}>
              {s ?? "All"} {s && <span className="ml-0.5 font-mono text-muted-foreground">{counts[s]}</span>}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} of {products.length}</span>
      </div>

      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState icon={PackageSearch} title="No matching SKUs" description="Try clearing filters or searching a different SKU or product name." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b bg-surface-2/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  {["SKU", "Product", "Count", "Zone", "Status", "Threshold", "Updated"].map((h) => <th key={h} className="whitespace-nowrap px-4 py-2 text-left font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const low = p.count < p.threshold;
                  return (
                    <tr key={p.sku} onClick={() => set({ sku: p.sku })} className={cn("cursor-pointer border-b leading-tight last:border-0 hover:bg-accent/50", search.sku === p.sku && "bg-accent/60", p.status === "pending" && "bg-pending/[0.04]")}>
                      <td className="whitespace-nowrap px-4 py-2 font-mono text-[12px] text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2"><CountDisplay count={p.count} observed={p.observed} low={low} /></td>
                      <td className="px-4 py-2 font-mono text-[12px]">{p.zone}</td>
                      <td className="px-4 py-2"><ReconBadge status={p.status} /></td>
                      <td className="px-4 py-2 font-mono text-[12px] text-muted-foreground">{p.threshold}{low && <Tag tone={p.count === 0 ? "critical" : "warning"} className="ml-2">{p.count === 0 ? "Out" : "Low"}</Tag>}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-[12px] text-muted-foreground">{ago(p.updatedMin)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Sheet open={!!sel} onOpenChange={(o) => !o && set({ sku: undefined })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {sel && (
            <>
              <SheetHeader>
                <p className="font-mono text-[11px] text-muted-foreground">{sel.sku} · Zone {sel.zone}</p>
                <SheetTitle className="text-base">{sel.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="flex items-end gap-4">
                  <div><p className="mb-1 text-[11px] text-muted-foreground">Verified count</p><CountDisplay count={sel.count} observed={sel.observed} low={sel.count < sel.threshold} size="lg" /></div>
                  <ReconBadge status={sel.status} />
                </div>
                <div className="rounded-md border bg-surface-2 p-3">
                  <div className="mb-2 flex justify-between text-[11px] text-muted-foreground"><span>Verified count · last 12 snapshots</span><span className="font-mono">threshold {sel.threshold}</span></div>
                  <Sparkline data={sel.history} className="h-16 text-primary" />
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-medium">Event history</p>
                  <ol className="relative space-y-3 border-l pl-4">
                    {sel.observed != null && (
                      <li className="relative">
                        <span className="pending-hatch absolute -left-[21px] top-1 size-2.5 rounded-full" />
                        <p className="text-[12px]">Observed {sel.count} → {sel.observed} <span className="text-muted-foreground">· awaiting reconciliation</span></p>
                        <p className="text-[11px] text-muted-foreground">just now · CV pipeline</p>
                      </li>
                    )}
                    {sel.history.slice(-6).reverse().map((v, i, arr) => {
                      const prev = arr[i + 1] ?? v;
                      if (prev === v && i < arr.length - 1) return null;
                      return (
                        <li key={i} className="relative">
                          <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-verified" />
                          <p className="text-[12px]">Count verified <span className="font-mono">{prev} → {v}</span></p>
                          <p className="text-[11px] text-muted-foreground">{ago(sel.updatedMin + i * 14)} · confidence {97 - i}%</p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
