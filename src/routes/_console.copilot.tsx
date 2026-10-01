import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Database, Cctv, Bell } from "lucide-react";
import { CopilotChat } from "@/components/app/copilot";
import { PageHeader, Tag } from "@/components/app/primitives";

export const Route = createFileRoute("/_console/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — IntelliStock" },
      { name: "description", content: "Ask questions about your inventory and get answers cited from verified data." },
      { property: "og:title", content: "AI Copilot — IntelliStock" },
      { property: "og:description", content: "Ask questions about your inventory and get answers cited from verified data." },
    ],
  }),
  component: Copilot,
});

function Copilot() {
  return (
    <>
      <PageHeader title="AI Copilot" description="Natural-language questions over verified inventory." actions={<Tag tone="primary"><ShieldCheck className="size-3" />Grounded mode</Tag>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="h-[calc(100vh-190px)] min-h-[480px] overflow-hidden rounded-lg border bg-surface">
          <CopilotChat />
        </div>
        <aside className="space-y-3 text-[12px]">
          <div className="rounded-lg border bg-surface p-4">
            <p className="font-medium">Data sources</p>
            <ul className="mt-3 space-y-2.5 text-muted-foreground">
              <li className="flex items-center gap-2"><Database className="size-3.5 text-primary" />Verified inventory · 247 SKUs</li>
              <li className="flex items-center gap-2"><Database className="size-3.5 text-primary" />Reconciled events · 24h</li>
              <li className="flex items-center gap-2"><Cctv className="size-3.5 text-primary" />Camera health · 8 feeds</li>
              <li className="flex items-center gap-2"><Bell className="size-3.5 text-primary" />Alert log</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-surface p-4 text-muted-foreground">
            <p className="font-medium text-foreground">How answers work</p>
            <p className="mt-2 leading-relaxed">The agent only reads committed data. Pending observations are labelled as such, and if no data supports an answer, it says so instead of guessing.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
