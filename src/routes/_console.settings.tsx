import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2, Plus, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { Panel, PageHeader, Tag, StatusDot } from "@/components/app/primitives";

export const Route = createFileRoute("/_console/settings")({
  head: () => ({
    meta: [
      { title: "Settings — IntelliStock" },
      { name: "description", content: "Profile, notification preferences, camera management and appearance." },
      { property: "og:title", content: "Settings — IntelliStock" },
      { property: "og:description", content: "Profile, notification preferences, camera management and appearance." },
    ],
  }),
  component: SettingsPage,
});

const alertTypes = ["Low stock", "Camera offline", "Anomaly detected", "Reconciliation flagged"];
const channels = ["In-app", "Email", "SMS"];

function SettingsPage() {
  const { theme, setTheme, cameras, setCameras } = useStore();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => Object.fromEntries(alertTypes.flatMap((t, i) => channels.map((c, j) => [`${t}|${c}`, j === 0 || (j === 1 && i < 2)]))));
  const field = "h-9 w-full rounded-md border bg-surface-2 px-3 text-[13px] outline-none focus:border-primary/60";

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Profile">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-sm font-semibold">MH</div>
            <div><p className="text-[13px] font-medium">Muhammad Hamid</p><p className="text-[12px] text-muted-foreground">Store Ops Manager · Downtown Flagship</p></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-[12px]"><span className="font-medium">Full name</span><input className={field} defaultValue="Muhammad Hamid" /></label>
            <label className="space-y-1.5 text-[12px]"><span className="font-medium">Email</span><input className={field} defaultValue="hamid@intellistock.io" /></label>
          </div>
          <button onClick={() => toast.success("Profile saved")} className="mt-4 h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">Save changes</button>
        </Panel>

        <Panel title="Appearance">
          <div className="grid grid-cols-2 gap-3">
            {([["dark", Moon, "Dark"], ["light", Sun, "Light"]] as const).map(([t, I, l]) => (
              <button key={t} onClick={() => setTheme(t)} className={cn("flex items-center gap-2 rounded-md border p-3 text-[13px]", theme === t ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
                <I className="size-4" />{l}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Notification preferences" bodyClassName="p-0">
          <table className="w-full text-[13px]">
            <thead className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2 text-left font-medium">Alert type</th>{channels.map((c) => <th key={c} className="px-4 py-2 text-center font-medium">{c}</th>)}</tr>
            </thead>
            <tbody>
              {alertTypes.map((t) => (
                <tr key={t} className="border-b last:border-0">
                  <td className="px-4 py-2.5">{t}</td>
                  {channels.map((c) => (
                    <td key={c} className="px-4 py-2.5 text-center">
                      <Switch checked={prefs[`${t}|${c}`]} onCheckedChange={(v) => setPrefs({ ...prefs, [`${t}|${c}`]: v })} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Cameras & zones" action={<button className="flex h-7 items-center gap-1 rounded-md border px-2 text-[12px] hover:bg-accent"><Plus className="size-3.5" />Add</button>} bodyClassName="p-0">
          <div className="divide-y">
            {cameras.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                <StatusDot state={c.online ? "live" : "offline"} />
                <span className="w-16 font-mono text-[12px] text-muted-foreground">{c.id}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <div className="hidden gap-1 sm:flex">{c.zones.map((z) => <Tag key={z} className="font-mono">{z}</Tag>)}</div>
                <button className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-accent"><Pencil className="size-3.5" /></button>
                <button onClick={() => { setCameras(cameras.filter((x) => x.id !== c.id)); toast(`${c.id} removed`); }} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-critical/10 hover:text-critical"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            {cameras.length === 0 && <p className="p-6 text-center text-[12px] text-muted-foreground">No cameras configured.</p>}
          </div>
        </Panel>
      </div>
    </>
  );
}
