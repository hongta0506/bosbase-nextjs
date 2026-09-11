import BosBase from "bosbase";
import { auth } from "@/auth/config";
import { redirect } from "next/navigation";

export const ADMIN_COLLECTIONS = ["providers", "provider_runs", "entity_mappings", "matches"] as const;
export type AdminCollection = (typeof ADMIN_COLLECTIONS)[number];
export type MutationAction = "create" | "update" | "delete" | "create_collection";
export type BosBaseRecord = { id: string; [key: string]: unknown };

export function isValidCollectionName(value: unknown): value is string {
  return typeof value === "string" && /^[a-z][a-z0-9_]*$/.test(value.trim()) && !value.startsWith("_");
}

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  const allowedEmails = (process.env.BOSBASE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!email) redirect("/en/auth/signin");
  if (!allowedEmails.includes(email)) redirect("/en/auth/signin?error=AccessDenied");
  return email;
}

export function isAdminCollection(value: unknown): value is AdminCollection {
  return typeof value === "string" && ADMIN_COLLECTIONS.includes(value as AdminCollection);
}

export function isMutationAction(value: unknown): value is MutationAction {
  return value === "create" || value === "update" || value === "delete" || value === "create_collection";
}

export async function getAdminClient() {
  const { BOSBASE_URL, BOSBASE_EMAIL, BOSBASE_PASSWORD } = process.env;
  if (!BOSBASE_URL || !BOSBASE_EMAIL || !BOSBASE_PASSWORD) {
    throw new Error("Missing BosBase server configuration");
  }

  const client = new BosBase(BOSBASE_URL);
  await client.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);
  return client;
}

export async function getBosBaseRecords(collection: AdminCollection): Promise<BosBaseRecord[]> {
  const result = await (await getAdminClient()).collection(collection).getList(1, 100, { sort: "-created" });
  return result.items as BosBaseRecord[];
}
