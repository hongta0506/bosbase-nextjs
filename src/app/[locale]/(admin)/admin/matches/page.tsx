import { getBosBaseRecords, requireAdmin } from "@/lib/bosbase/admin";
import { Radio, Calendar, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  await requireAdmin();
  let matches: any[] = [];
  let errorMsg: string | null = null;

  try {
    matches = await getBosBaseRecords("matches");
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load matches";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Radio className="h-6 w-6 text-cyan-600" />
            Matches Database
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Canonical and provider-linked football fixtures with live scoring and telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            Total: {matches.length} Matches
          </span>
        </div>
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
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Competition</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Home vs Away</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Score / Status</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Kickoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {matches.map((m) => {
                const homeName = m.home_team || m.homeTeam || m.home || "Home";
                const awayName = m.away_team || m.awayTeam || m.away || "Away";
                const homeScore = m.home_score ?? m.homeScore ?? "-";
                const awayScore = m.away_score ?? m.awayScore ?? "-";
                const status = m.status || "SCHEDULED";
                const isLive = status === "LIVE" || status === "IN_PLAY";

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{m.id}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        <span>{m.competition || m.league || "Unknown League"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{homeName} <span className="text-slate-400 font-normal">vs</span> {awayName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {homeScore} - {awayScore}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isLive
                            ? "bg-red-50 text-red-700 border border-red-200 animate-pulse"
                            : status === "FINISHED" || status === "FT"
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{m.kickoff || m.start_time ? new Date(m.kickoff || m.start_time).toLocaleString() : "-"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {matches.length === 0 && !errorMsg && (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500 text-sm" colSpan={5}>
                    No matches found in BosBase. Crawler will stream fixtures automatically.
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
