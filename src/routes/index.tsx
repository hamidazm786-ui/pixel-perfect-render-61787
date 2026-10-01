import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/app/app-shell";
import { LiveIndicator, CountDisplay } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — IntelliStock" },
      { name: "description", content: "Sign in to IntelliStock, the computer-vision verified shelf inventory dashboard." },
      { property: "og:title", content: "Sign in — IntelliStock" },
      { property: "og:description", content: "Computer-vision verified shelf inventory with a grounded AI copilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };
  const field = "h-10 w-full rounded-md border bg-surface px-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r bg-sidebar p-10 grid-bg lg:flex">
        <Logo />
        <div className="relative max-w-lg">
          <LiveIndicator label="Verified in real time" />
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight">
            Shelf inventory you can <span className="text-primary">actually trust.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Cameras observe. A reconciliation engine verifies over time. Only confirmed changes reach your counts — and an AI copilot that explains them from real data, never guesses.
          </p>

          <div className="mt-8 rounded-lg border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>Shelf A-3 · Lay's Classic 52g</span><span className="font-mono">CAM-02</span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="mb-1 flex items-center gap-1 text-[11px] text-verified"><CheckCircle2 className="size-3" /> Verified</p>
                <CountDisplay count={12} size="lg" />
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="size-3" /> Observed · reconciling</p>
                <span className="pending-hatch inline-flex rounded px-2 py-0.5 font-mono text-2xl text-muted-foreground">9?</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-[12px]">
            {[{ i: Eye, t: "YOLO + tracking" }, { i: ShieldCheck, t: "Temporal verification" }, { i: Sparkles, t: "Grounded AI agent" }].map(({ i: I, t }) => (
              <div key={t} className="flex items-center gap-2 text-muted-foreground"><I className="size-4 text-primary" />{t}</div>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground">© 2026 IntelliStock · Final Year Project</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <div className="mb-6 flex rounded-md border bg-surface p-0.5 text-[13px]">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn("h-8 flex-1 rounded transition-colors", mode === m ? "bg-secondary font-medium" : "text-muted-foreground")}>
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{mode === "login" ? "Welcome back" : "Set up your workspace"}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{mode === "login" ? "Sign in to your store operations console." : "Start monitoring shelves in minutes."}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium">Full name</label>
                <input required className={field} placeholder="Muhammad Hamid" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium">Work email</label>
              <input type="email" required className={field} placeholder="you@store.com" defaultValue="hamid@intellistock.io" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium">Password</label>
                {mode === "login" && <button type="button" className="text-[12px] text-primary hover:underline">Forgot password?</button>}
              </div>
              <input type="password" required className={field} placeholder="••••••••" defaultValue="demo1234" />
            </div>
            {mode === "login" && (
              <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <input type="checkbox" defaultChecked className="size-3.5 accent-primary" /> Remember me for 30 days
              </label>
            )}
            <button type="submit" className="h-10 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-[12px] text-muted-foreground">Demo build · any credentials will work</p>
        </div>
      </div>
    </div>
  );
}
