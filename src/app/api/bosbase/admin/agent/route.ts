import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import {
  ADMIN_COLLECTIONS,
  AdminCollection,
  getAdminClient,
  isAdminCollection,
  isMutationAction,
  requireAdmin,
} from "@/lib/bosbase/admin";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_AGENT_TURNS = 5;

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_collection_records",
      description: "Read records from an authorized BosBase collection for inspection and analysis.",
      parameters: {
        type: "object",
        properties: {
          collection: {
            type: "string",
            enum: ADMIN_COLLECTIONS,
            description: "Collection name to query (providers, provider_runs, entity_mappings, matches)",
          },
          limit: {
            type: "number",
            description: "Number of records to retrieve (1-50, default 10)",
          },
        },
        required: ["collection"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_mutation",
      description: "Draft a schema or record mutation proposal for Human Operator approval. Direct writes are blocked.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["create", "update", "delete"],
            description: "Mutation action to propose",
          },
          collection: {
            type: "string",
            enum: ADMIN_COLLECTIONS,
            description: "Target BosBase collection",
          },
          recordId: {
            type: "string",
            description: "ID of target record (required for update/delete)",
          },
          data: {
            type: "object",
            description: "JSON payload for create or update",
          },
          reason: {
            type: "string",
            description: "Explanation of why this mutation is necessary",
          },
        },
        required: ["action", "collection", "data"],
      },
    },
  },
];

const systemPrompt = `You are the Football Intelligence AI Operator Assistant with autonomous tool-calling capabilities.
You have read-only inspection access to BosBase collections and can propose mutations via the 'propose_mutation' tool.

SAFETY RULES:
1. Direct database writes are impossible. You MUST use 'propose_mutation' whenever a create/update/delete is requested or needed.
2. When asked to inspect, analyze, count, or verify data, call 'get_collection_records' first before answering.
3. Keep responses concise, professional, and factual. Explain what actions/proposals were generated and notify the operator that approval is required in Governance.`;

export async function GET(request: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || "default";

  try {
    const client = await getAdminClient();
    const records = await client.collection("admin_agent_messages").getList(1, 100, {
      filter: `session_id = "${sessionId}"`,
      sort: "created",
    });
    return NextResponse.json({
      messages: records.items.map((r: any) => ({
        id: r.id,
        role: r.role,
        text: r.content,
        proposal: r.proposals || null,
        created: r.created,
      })),
    });
  } catch (error) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  const actor = await requireAdmin();
  const body = await request.json().catch(() => null);
  const message = body?.message;
  const sessionId = typeof body?.sessionId === "string" && body.sessionId ? body.sessionId : "default";

  if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_BASE_URL || !process.env.OPENAI_MODEL) {
    return NextResponse.json({ error: "LLM is not configured" }, { status: 503 });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      timeout: 30000,
    });

    const client = await getAdminClient();
    let latestProposal: unknown = null;

    // Load recent conversation history from BosBase
    let pastTurns: ChatCompletionMessageParam[] = [];
    try {
      const historyRecords = await client.collection("admin_agent_messages").getList(1, 10, {
        filter: `session_id = "${sessionId}"`,
        sort: "-created",
      });
      pastTurns = historyRecords.items.reverse().map((r: any) => ({
        role: r.role === "agent" ? "assistant" : "user",
        content: r.content,
      }));
    } catch {
      pastTurns = [];
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...pastTurns,
      { role: "user", content: message.trim() },
    ];

    // Tool execution loop (up to MAX_AGENT_TURNS)
    for (let turn = 0; turn < MAX_AGENT_TURNS; turn++) {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages,
        tools,
        tool_choice: "auto",
      });

      const choice = completion.choices[0];
      const responseMessage = choice?.message;
      if (!responseMessage) break;

      messages.push(responseMessage);

      // If no tool call, agent finished
      if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
        break;
      }

      // Execute tool calls
      for (const toolCall of responseMessage.tool_calls) {
        const { name, arguments: argsString } = toolCall.function;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(argsString);
        } catch {
          args = {};
        }

        let toolResult: string;

        if (name === "get_collection_records") {
          const col = args.collection as AdminCollection;
          const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);
          if (isAdminCollection(col)) {
            try {
              const res = await client.collection(col).getList(1, limit, { sort: "-created" });
              toolResult = JSON.stringify({ items: res.items, totalItems: res.totalItems });
            } catch (err) {
              toolResult = JSON.stringify({ error: err instanceof Error ? err.message : "Failed to query collection" });
            }
          } else {
            toolResult = JSON.stringify({ error: `Invalid collection: ${col}` });
          }
        } else if (name === "propose_mutation") {
          const action = args.action as string;
          const col = args.collection as string;
          const recordId = (args.recordId as string) || "";
          const data = args.data as Record<string, unknown>;

          if (!isMutationAction(action) || !isAdminCollection(col)) {
            toolResult = JSON.stringify({ error: "Invalid mutation action or collection" });
          } else if (typeof data !== "object" || data === null || Array.isArray(data) || (action !== "create" && !recordId)) {
            toolResult = JSON.stringify({ error: "Invalid mutation payload or missing recordId" });
          } else {
            try {
              const created = await client.collection("admin_ai_proposals").create({
                actor,
                action,
                collection: col,
                recordId,
                data,
                status: "pending",
              });
              latestProposal = created;
              toolResult = JSON.stringify({ success: true, proposalId: created.id, status: "pending" });
            } catch (err) {
              toolResult = JSON.stringify({ error: err instanceof Error ? err.message : "Failed to create proposal" });
            }
          }
        } else {
          toolResult = JSON.stringify({ error: `Unknown tool: ${name}` });
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }
    }

    const lastMsg = messages[messages.length - 1];
    const replyText =
      lastMsg && "content" in lastMsg && typeof lastMsg.content === "string"
        ? lastMsg.content
        : "Task processed.";

    // Persist conversation turns in BosBase
    try {
      await client.collection("admin_agent_messages").create({
        session_id: sessionId,
        role: "user",
        content: message.trim(),
      });
      await client.collection("admin_agent_messages").create({
        session_id: sessionId,
        role: "agent",
        content: replyText,
        proposals: latestProposal ? [latestProposal] : null,
      });
    } catch (saveErr) {
      console.warn("Failed to persist admin agent messages:", saveErr);
    }

    return NextResponse.json({
      reply: replyText,
      proposal: latestProposal,
    });
  } catch (error) {
    console.error("Admin agent loop failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent loop failed" },
      { status: 502 }
    );
  }
}
