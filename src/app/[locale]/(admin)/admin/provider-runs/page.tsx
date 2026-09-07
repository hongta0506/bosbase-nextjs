import { getBosBaseRecords, requireAdmin } from "@/lib/bosbase/admin";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderRunsPage() {
  await requireAdmin();
  let records: any[] = [];
  let errorMsg: string | null = null;

  try {
    records = await getBosBaseRecords("provider_runs");
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load provider runs";
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-cyan-600" />
          Provider Runs
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Read-only crawler and data ingestion runs telemetry from BosBase.
        </p>
      </header>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Run ID</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Provider</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.map((run) => (
              <tr key={run.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{run.id}</td>
                <td className="px-4 py-3 text-slate-800">{String(run.provider || run.providerId || "-")}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    run.status === "completed" || run.status === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : run.status === "failed" || run.status === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {String(run.status || "unknown")}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {run.created ? new Date(run.created).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
            {records.length === 0 && !errorMsg && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500 text-sm" colSpan={4}>
                  No provider runs recorded in BosBase yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
