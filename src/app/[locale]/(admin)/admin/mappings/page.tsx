import { getBosBaseRecords, requireAdmin } from "@/lib/bosbase/admin";
import { Layers, ArrowRightLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MappingsPage() {
  await requireAdmin();
  let records: any[] = [];
  let errorMsg: string | null = null;

  try {
    records = await getBosBaseRecords("entity_mappings");
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load entity mappings";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-600" />
            Entity Mappings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Reconciliation layer mapping provider-specific teams and leagues to canonical entities.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Total: {records.length} Mappings
        </span>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Mapping ID</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Entity Type</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Provider & Raw ID</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Canonical Target</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{r.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {r.entity_type || r.entityType || "TEAM"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{r.provider || "-"}</span>
                      <span className="text-slate-400 font-mono text-xs">({r.provider_id || r.external_id || "-"})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5 text-cyan-700">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-600" />
                      <span>{r.canonical_name || r.canonical_id || r.canonicalId || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.created ? new Date(r.created).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
              {records.length === 0 && !errorMsg && (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500 text-sm" colSpan={5}>
                    No entity mappings configured in BosBase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
