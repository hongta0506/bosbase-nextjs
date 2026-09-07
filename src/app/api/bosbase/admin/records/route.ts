import { NextRequest, NextResponse } from "next/server";
import {
  getAdminClient,
  isAdminCollection,
  requireAdmin,
} from "@/lib/bosbase/admin";

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const actor = await requireAdmin();
  const body = await request.json().catch(() => null);
  if (!body || !isAdminCollection(body.collection) || body.action !== "create" || !body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return badRequest("Invalid create request");
  }

  const client = await getAdminClient();
  const record = await client.collection(body.collection).create(body.data);
  await client.collection("audit_logs").create({ actor, action: "create", collection: body.collection, recordId: record.id });
  return NextResponse.json({ record, actor });
}

export async function PATCH(request: NextRequest) {
  const actor = await requireAdmin();
  const body = await request.json().catch(() => null);
  if (!body || !isAdminCollection(body.collection) || body.action !== "update" || typeof body.recordId !== "string" || !body.recordId || !body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return badRequest("Invalid update request");
  }

  const client = await getAdminClient();
  const record = await client.collection(body.collection).update(body.recordId, body.data);
  await client.collection("audit_logs").create({ actor, action: "update", collection: body.collection, recordId: body.recordId });
  return NextResponse.json({ record, actor });
}

export async function DELETE(request: NextRequest) {
  const actor = await requireAdmin();
  const body = await request.json().catch(() => null);
  if (!body || !isAdminCollection(body.collection) || body.action !== "delete" || typeof body.recordId !== "string" || !body.recordId) {
    return badRequest("Invalid delete request");
  }

  const client = await getAdminClient();
  await client.collection(body.collection).delete(body.recordId);
  await client.collection("audit_logs").create({ actor, action: "delete", collection: body.collection, recordId: body.recordId });
  return NextResponse.json({ deleted: true, actor });
}
