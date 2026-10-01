import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Cctv, Boxes, Bell, Sparkles, Settings, Search, PanelLeftClose, PanelLeft, LogOut, Moon, Sun, ScanEye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CopilotChat } from "./copilot";
import { StatusDot, severityTone, Tag } from "./primitives";
import { ago } from "@/lib/mock-data";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shelves", label: "Shelves", icon: Cctv },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/copilot", label: "AI Copilot", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <ScanEye className="size-4" />
      </div>
      {!collapsed && <span className="text-[14px] font-semibold tracking-tight">IntelliStock</span>}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { alerts, theme, setTheme, copilotOpen, setCopilotOpen } = useStore();
  const unread = alerts.filter((a) => !a.acknowledged);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside id="desktop-sidebar" className={cn("hidden w-56 shrink-0 flex-col border-r bg-sidebar md:flex", !sidebarOpen && "md:hidden")}>
        <div className="flex h-14 items-center border-b px-3.5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-medium" }}
            >
              <n.icon className="size-4 shrink-0" />
              <span className="flex-1">{n.label}</span>
              {n.to === "/alerts" && unread.length > 0 && (
                <span className="rounded bg-critical/15 px-1.5 font-mono text-[10px] text-critical">{unread.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t p-2">
          <div className="rounded-md border bg-surface px-2.5 py-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground"><StatusDot state="live" pulse /> Pipeline running</div>
            <div className="mt-1 font-mono text-muted-foreground">7/8 cams · YOLOv8 · 21 fps</div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          <Button variant="ghost" size="icon" className="hidden size-8 shrink-0 md:inline-flex" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} aria-expanded={sidebarOpen} aria-controls="desktop-sidebar" title={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
            {sidebarOpen ? <PanelLeftClose /> : <PanelLeft />}
          </Button>
          <Button variant="ghost" size="icon" className="size-8 shrink-0 md:hidden" onClick={() => setMobileSidebarOpen(true)} aria-label="Open sidebar" title="Open sidebar">
            <PanelLeft />
          </Button>
          <div className="md:hidden"><Logo collapsed /></div>
          <div className="flex h-8 max-w-md flex-1 items-center gap-2 rounded-md border bg-surface px-2.5 text-muted-foreground">
            <Search className="size-3.5" />
            <input
              placeholder="Search SKUs, products, zones…"
              className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate({ to: "/inventory", search: { q: (e.target as HTMLInputElement).value } });
              }}
            />
            <kbd className="hidden rounded border px-1 font-mono text-[10px] sm:inline">↵</kbd>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setCopilotOpen(true)} className="hidden h-8 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 text-[12px] font-medium text-primary hover:bg-primary/20 sm:inline-flex">
              <Sparkles className="size-3.5" /> Ask AI
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="relative grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Notifications">
                <Bell className="size-4" />
                {unread.length > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-critical px-1 font-mono text-[9px] font-semibold text-destructive-foreground">{unread.length}</span>}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="text-[12px]">Unacknowledged alerts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unread.slice(0, 5).map((a) => (
                  <DropdownMenuItem key={a.id} onClick={() => navigate({ to: "/alerts" })} className="flex items-start gap-2">
                    <span className="mt-1.5"><StatusDot state={a.severity} /></span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">Zone {a.zone} · {ago(a.minAgo)}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {unread.length === 0 && <p className="px-2 py-4 text-center text-[12px] text-muted-foreground">You're all caught up</p>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/alerts" })} className="justify-center text-[12px] text-primary">View all alerts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 grid size-8 place-items-center rounded-full bg-secondary text-[11px] font-semibold">MH</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-[13px]">Muhammad Hamid</p>
                  <p className="text-[11px] font-normal text-muted-foreground">Store Ops Manager</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><Settings className="size-4" /> Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/" })}><LogOut className="size-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] p-5 lg:p-6">{children}</div>
        </main>
        <nav className="flex border-t bg-sidebar md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex flex-1 justify-center py-2.5 text-muted-foreground" activeProps={{ className: "!text-primary" }}>
              <n.icon className="size-4" />
            </Link>
          ))}
        </nav>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetHeader className="flex h-14 justify-center border-b px-4 text-left">
            <SheetTitle><Logo /></SheetTitle>
          </SheetHeader>
          <nav className="space-y-0.5 p-2" aria-label="Main navigation">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobileSidebarOpen(false)} className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground" }}>
                <n.icon className="size-4" />{n.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={copilotOpen} onOpenChange={setCopilotOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2 text-sm"><Sparkles className="size-4 text-primary" /> IntelliStock Copilot <Tag tone="primary">Grounded</Tag></SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1"><CopilotChat compact /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { severityTone };
