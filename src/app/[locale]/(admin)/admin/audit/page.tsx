import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { FileText, Shield, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requireAdmin();
  const client = await getAdminClient();
  let logs: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collection("audit_logs").getList(1, 100, {
      sort: "-created",
    });
    logs = res.items;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load audit logs";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-600" />
            Audit Log & Compliance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Immutable log of all human approvals, mutations, and AI agent execution events.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Total: {logs.length} Events
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
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Log ID</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Action / Target</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Actor</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Proposal Ref</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{log.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action || "MUTATION"}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-900">{log.collection || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Shield className="h-3.5 w-3.5 text-cyan-600" />
                      <span className="font-medium">{log.actor || "System Operator"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {log.proposalId ? `proposal:${log.proposalId}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{log.created ? new Date(log.created).toLocaleString() : "-"}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !errorMsg && (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500 text-sm" colSpan={5}>
                    No audit records captured yet. Approved mutations will appear here.
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
