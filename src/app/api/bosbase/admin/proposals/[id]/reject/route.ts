import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing proposal ID" }, { status: 400 });

  const client = await getAdminClient();
  try {
    const proposal = await client.collection("admin_ai_proposals").getOne(id);
    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "Proposal is not in pending status" }, { status: 409 });
    }
    const updated = await client.collection("admin_ai_proposals").update(id, {
      status: "rejected",
      rejectedBy: actor,
      rejectedAt: new Date().toISOString(),
    });
    return NextResponse.json({ proposal: updated });
  } catch (error: any) {
    if (error?.status === 404 || error?.statusCode === 404 || error?.message?.includes("not found")) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reject proposal" }, { status: 500 });
  }
}
