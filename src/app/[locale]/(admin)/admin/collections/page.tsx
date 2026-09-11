import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { Database, Table, ShieldCheck, KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  await requireAdmin();
  const client = await getAdminClient();
  let collections: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collections.getList(1, 100);
    collections = res.items;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load collections schema";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-cyan-600" />
            Collections & Schema
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Core BosBase schemas, field definitions, and access rule metadata.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Total: {collections.length} Collections
        </span>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700 border border-cyan-100">
                  <Table className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 font-mono text-sm">{col.name}</h3>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Type: {col.type || "base"}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                ID: {col.id}
              </span>
            </div>

            <div>
              {(() => {
                const fields = col.fields || col.schema || [];
                return (
                  <>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Schema Fields ({fields.length})
                    </span>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
                      {fields.length > 0 ? (
                        fields.map((f: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-1.5">
                              <KeyRound className="h-3 w-3 text-slate-400" />
                              <span className="font-medium text-slate-800">{f.name}</span>
                              {f.required && <span className="text-red-500 text-[10px] font-bold">*</span>}
                            </div>
                            <span className="text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {f.type}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No custom fields defined</span>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Auth: {col.listRule === null ? "Admin Only" : "Custom Rule"}
              </span>
              <span>System: {col.system ? "Yes" : "No"}</span>
            </div>
          </div>
        ))}

        {collections.length === 0 && !errorMsg && (
          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Database className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No collections found</h3>
            <p className="text-sm text-slate-500 mt-1">Connect BosBase to inspect system tables.</p>
          </div>
        )}
      </div>
    </div>
  );
}
