import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, isAdminCollection, isMutationAction, isValidCollectionName, requireAdmin } from "@/lib/bosbase/admin";

type Proposal = {
  id: string;
  action: "create" | "update" | "delete" | "create_collection";
  collection: string;
  recordId?: string;
  data?: Record<string, unknown>;
  status: string;
};

const approvingProposals = new Set<string>();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing proposal ID" }, { status: 400 });

  const client = await getAdminClient();
  let proposal: Proposal;
  try {
    proposal = (await client.collection("admin_ai_proposals").getOne(id)) as Proposal;
  } catch {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  const isColMutation = proposal.action === "create_collection";
  const validCol = isColMutation ? isValidCollectionName(proposal.collection) : isAdminCollection(proposal.collection);
  if (proposal.status !== "pending" || !validCol || !isMutationAction(proposal.action)) {
    return NextResponse.json({ error: "Proposal is not approvable" }, { status: 409 });
  }
  if (proposal.action !== "create" && proposal.action !== "create_collection" && !proposal.recordId) {
    return NextResponse.json({ error: "Proposal record ID missing" }, { status: 400 });
  }

  if (approvingProposals.has(proposal.id)) {
    return NextResponse.json({ error: "Proposal approval already processing" }, { status: 409 });
  }
  approvingProposals.add(proposal.id);
  try {
    await client.collection("admin_ai_proposals").update(proposal.id, { status: "processing", approvedBy: actor });
    try {
      const recordId = proposal.recordId ?? "";
      let record: unknown = null;
      if (proposal.action === "create") {
        record = await client.collection(proposal.collection).create(proposal.data ?? {});
      }
      if (proposal.action === "update") {
        record = await client.collection(proposal.collection).update(recordId, proposal.data ?? {});
      }
      if (proposal.action === "delete") {
        await client.collection(proposal.collection).delete(recordId);
      }
      if (proposal.action === "create_collection") {
        const payload = proposal.data ?? {};
        const colPayload = {
          name: proposal.collection,
          type: typeof payload.type === "string" ? payload.type : "base",
          fields: Array.isArray(payload.fields) ? payload.fields : [],
          listRule: payload.listRule !== undefined ? payload.listRule : null,
          viewRule: payload.viewRule !== undefined ? payload.viewRule : null,
          createRule: payload.createRule !== undefined ? payload.createRule : null,
          updateRule: payload.updateRule !== undefined ? payload.updateRule : null,
          deleteRule: payload.deleteRule !== undefined ? payload.deleteRule : null,
          ...payload,
        };
        record = await client.collections.create(colPayload);
      }
      await client.collection("audit_logs").create({
        actor,
        action: proposal.action,
        collection: proposal.collection,
        recordId: proposal.action === "create" && record && typeof record === "object" && "id" in record
          ? String(record.id)
          : recordId,
        proposalId: proposal.id,
      });
      const approvedProposal = await client.collection("admin_ai_proposals").update(proposal.id, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });

      return NextResponse.json({ proposal: approvedProposal, record });
    } catch (error) {
      await client.collection("admin_ai_proposals").update(proposal.id, {
        status: "failed",
        failure: error instanceof Error ? error.message : "Approval failed",
      });
      throw error;
    }
  } finally {
    approvingProposals.delete(proposal.id);
  }
}
