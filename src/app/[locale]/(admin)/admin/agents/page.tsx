"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, Send, User, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "agent"; text: string };
type Proposal = { id: string; status: string; action: string; collection: string; recordId?: string; data: unknown };

const SESSION_KEY = "admin_agent_session_id";

export default function AgentsPage() {
  const [sessionId, setSessionId] = useState<string>("default");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Hello Master Operator. I am ready to inspect BosBase data, generate schemas, or prepare mutation proposals for your approval.",
    },
  ]);
  const [input, setInput] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Initialize or restore session ID
  useEffect(() => {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);

    // Fetch conversation history
    fetch(`/api/bosbase/admin/agent?sessionId=${encodeURIComponent(sid)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({
              role: m.role,
              text: m.text,
            }))
          );
          const lastWithProposal = [...data.messages].reverse().find((m: any) => m.proposal && m.proposal[0]);
          if (lastWithProposal) {
            setProposal(lastWithProposal.proposal[0]);
          }
        }
      })
      .catch((err) => console.warn("Failed to load history:", err))
      .finally(() => setLoadingHistory(false));
  }, []);

  function handleResetSession() {
    const newSid = "session_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(SESSION_KEY, newSid);
    setSessionId(newSid);
    setProposal(null);
    setMessages([
      {
        role: "agent",
        text: "Session reset. How can I help you inspect or operate BosBase?",
      },
    ]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text: message }]);
    setBusy(true);
    try {
      const response = await fetch("/api/bosbase/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Agent request failed");
      setMessages((current) => [...current, { role: "agent", text: result.reply }]);
      if (result.proposal) {
        setProposal(result.proposal);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "agent", text: error instanceof Error ? error.message : "Agent request failed" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-cyan-600" />
            AI Automation Console
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Query collections, analyze crawler metrics, or draft mutation proposals via LLM.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetSession}
          className="text-xs flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Session
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col h-[650px] rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-sm ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "agent" && (
                  <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 text-cyan-700">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 ${
                    m.role === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-800 border border-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex gap-3 text-sm items-center text-slate-400">
                <div className="h-8 w-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-cyan-600 animate-spin">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>Agent thinking & validating safe bounds…</span>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or propose a mutation (e.g., /propose create providers {...})"
              disabled={busy}
            />
            <Button
              type="submit"
              disabled={busy || !input.trim()}
              className="bg-cyan-600 text-white hover:bg-cyan-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Proposal Queue Status</h3>
            {proposal ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(proposal, null, 2)}</pre>
                </div>
                <p className="text-xs text-slate-500">
                  Proposal created with status: <strong className="text-amber-600">{proposal.status}</strong>. Visit Governance tab to approve.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active mutation generated in this session. The agent will show structured payloads here when commands are executed.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Safety Guardrails</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Direct writes to production BosBase collections are blocked.
              <br />
              2. Schema and records mutations require operator signature in Proposals.
              <br />
              3. Read operations are unrestricted across authorized admin collections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
