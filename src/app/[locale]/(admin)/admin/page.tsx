import Link from "next/link";
import { ADMIN_COLLECTIONS, getBosBaseRecords } from "@/lib/bosbase/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const counts = await Promise.all(
    ADMIN_COLLECTIONS.map(async (collection) => {
      try {
        const records = await getBosBaseRecords(collection);
        return { collection, count: records.length };
      } catch {
        return { collection, count: 0 };
      }
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Control Room Overview</h2>
        <p className="mt-1 text-sm text-slate-600">
          BosBase operational boundary, data collections, and crawler metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(({ collection, count }) => (
          <div
            key={collection}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {collection.replace(/_/g, " ")}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
            <Link
              href={`/admin/${collection === "entity_mappings" ? "mappings" : collection.replace(/_/g, "-")}`}
              className="mt-3 inline-block text-xs font-medium text-cyan-600 hover:text-cyan-800"
            >
              View collection →
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Automation & Assistant</h3>
          <p className="mt-1 text-sm text-slate-600">
            AI Agent control room with schema proposal, API generation, and governed mutation.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/agents"
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Open AI Agent Console →
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Provider Runs & Ingestion</h3>
          <p className="mt-1 text-sm text-slate-600">
            Cloakbrowser crawler sessions and live ingestion verification status.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/provider-runs"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Provider Runs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
