"use client";

import { useState } from "react";
import { Check, X, ShieldAlert, Clock, CheckCircle2, XCircle, AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProposalsClient({ initialProposals }: { initialProposals: any[] }) {
  const [proposals, setProposals] = useState<any[]>(initialProposals);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleAction(id: string, action: "approve" | "reject") {
    setLoadingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/bosbase/admin/proposals/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = typeof data?.error === "string" && data.error.trim() ? data.error : `Failed to ${action} proposal`;
        throw new Error(error);
      }
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p))
      );
      setMessage({
        text: `Proposal ${id} successfully ${action}d.`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : `Error during ${action}`,
        type: "error",
      });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-cyan-600" />
            Governance: Proposals & Approvals
          </h1>
          <p className="text-sm text-slate-600">
            Review and authorize mutations suggested by AI Agents before execution.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
          {message.text}
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Layers className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No proposals found</h3>
          <p className="text-sm text-slate-500 mt-1">
            When AI agents generate mutation commands, they will queue here for review.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {proposals.map((item) => {
            const isPending = item.status === "pending";
            const isApproved = item.status === "approved";
            const isRejected = item.status === "rejected";

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        item.action === "create"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.action === "update"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {item.action}
                    </span>
                    <span className="font-mono text-sm text-slate-900 font-semibold">{item.collection}</span>
                    {item.recordId && (
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        ID: {item.recordId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isRejected
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {isRejected && <XCircle className="h-3.5 w-3.5" />}
                      {isPending && <Clock className="h-3.5 w-3.5" />}
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                      Proposed Payload
                    </span>
                    <pre className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-slate-800 overflow-x-auto text-[11px] max-h-48">
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>

                  <div className="space-y-2 text-slate-600 text-xs">
                    <div>
                      <span className="text-slate-400 block">Proposed By:</span>
                      <span className="text-slate-800 font-mono font-medium">{item.actor || "AI Agent"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Created At:</span>
                      <span className="text-slate-700">{new Date(item.created).toLocaleString()}</span>
                    </div>
                    {item.failure && (
                      <div className="text-red-700 bg-red-50 p-2 rounded border border-red-200">
                        <span className="font-bold">Error: </span>
                        {item.failure}
                      </div>
                    )}
                  </div>
                </div>

                {isPending && (
                  <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingId === item.id}
                      onClick={() => handleAction(item.id, "reject")}
                      className="border-slate-300 bg-white text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={loadingId === item.id}
                      onClick={() => handleAction(item.id, "approve")}
                      className="bg-cyan-600 text-white hover:bg-cyan-700 font-medium"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Approve & Execute
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
