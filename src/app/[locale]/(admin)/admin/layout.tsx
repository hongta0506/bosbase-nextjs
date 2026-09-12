import { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/bosbase/admin";
import {
  Activity,
  Database,
  Bot,
  ShieldCheck,
  Sliders,
  Layers,
  Cpu,
  FileText,
  LogOut,
  Radio,
  Server,
  TerminalSquare,
  Users,
  CalendarCheck,
  CalendarOff,
  Banknote,
  BookOpen
} from "lucide-react";

const navigation = [
  {
    title: "HRM & Payroll",
    items: [
      { label: "Employees", path: "/hrm/employees", icon: Users },
      { label: "Daily Attendance", path: "/hrm/attendance", icon: CalendarCheck },
      { label: "Leave Applications", path: "/hrm/leaves", icon: CalendarOff },
      { label: "Payroll & Slips", path: "/hrm/payroll", icon: Banknote },
      { label: "GL Journal", path: "/hrm/gl-entries", icon: BookOpen },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Overview", path: "", icon: Sliders },
      { label: "Provider Runs", path: "/provider-runs", icon: Activity },
    ],
  },
  {
    title: "Data Management",
    items: [
      { label: "Providers", path: "/providers", icon: Server },
      { label: "Entity Mappings", path: "/mappings", icon: Layers },
      { label: "Matches", path: "/matches", icon: Radio },
      { label: "Collections & Schema", path: "/collections", icon: Database },
    ],
  },
  {
    title: "Automation",
    items: [
      { label: "AI Agents", path: "/agents", icon: Bot },
    ],
  },
  {
    title: "Governance",
    items: [
      { label: "Proposals & Approvals", path: "/proposals", icon: ShieldCheck },
      { label: "Audit Log", path: "/audit", icon: FileText },
    ],
  },
] as const;

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const actor = await requireAdmin();
  const { locale } = await params;
  const prefix = locale === "en" ? "" : `/${locale}`;
  const adminPrefix = `${prefix}/admin`;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased selection:bg-cyan-500/20 selection:text-cyan-900">
      {/* Sidebar Navigation */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-sm">
            <TerminalSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900">CONTROL ROOM</span>
              <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-700 border border-cyan-200">PRO</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Football Intelligence</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {navigation.map(({ title, items }) => (
            <div key={title}>
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
              <div className="mt-2 space-y-1">
                {items.map(({ label, path, icon: Icon }) => (
                  <Link
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-cyan-700"
                    href={`${adminPrefix}${path}`}
                    key={path}
                  >
                    <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-cyan-600" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Operator & Status */}
        <div className="border-t border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[11px] font-medium text-slate-600">System Nominal</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v2.4.0</span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-semibold text-slate-800">{actor}</p>
              <p className="text-[10px] text-slate-500 font-mono">Master Operator</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                title="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
        {/* Workspace Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Core Engine:</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700 border border-slate-200">BosBase Standalone</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              <span>5 Crawlers Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Production Safe Mode</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Workspace Footer */}
        <footer className="flex h-9 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-8 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span>Football Intelligence Operator Console</span>
            <span>•</span>
            <span className="font-mono">Port: 3002</span>
            <span>•</span>
            <span className="font-mono">Env: Development</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              API Online
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
