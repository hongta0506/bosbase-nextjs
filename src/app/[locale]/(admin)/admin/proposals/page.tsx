import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import ProposalsClient from "./proposals-client";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  await requireAdmin();
  const client = await getAdminClient();

  let proposals: any[] = [];
  try {
    const res = await client.collection("admin_ai_proposals").getList(1, 100, {
      sort: "-created",
    });
    proposals = res.items;
  } catch (e) {
    console.error("Failed to load proposals:", e);
  }

  return <ProposalsClient initialProposals={proposals} />;
}
