import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, isAdminCollection, isMutationAction, requireAdmin } from "@/lib/bosbase/admin";

export async function POST(request: NextRequest) {
  const actor = await requireAdmin();
  const body = await request.json().catch(() => null);
  if (!body || !isAdminCollection(body.collection) || !isMutationAction(body.action) || (body.action !== "delete" && (!body.data || typeof body.data !== "object" || Array.isArray(body.data))) || (body.action !== "create" && (typeof body.recordId !== "string" || !body.recordId))) {
    return NextResponse.json({ error: "Invalid proposal request" }, { status: 400 });
  }

  const proposal = await (await getAdminClient()).collection("admin_ai_proposals").create({
    actor,
    action: body.action,
    collection: body.collection,
    recordId: body.recordId ?? "",
    data: body.data ?? {},
    status: "pending",
  });
  return NextResponse.json({ proposal }, { status: 201 });
}
