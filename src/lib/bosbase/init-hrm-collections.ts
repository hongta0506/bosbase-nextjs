import BosBase from "bosbase";
import { getAdminClient } from "./admin";

export interface CollectionDefinition {
  name: string;
  type: string;
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
    options?: Record<string, any>;
    onCreate?: boolean;
    onUpdate?: boolean;
  }>;
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
  indexes?: string[];
}

export const HRM_COLLECTIONS: CollectionDefinition[] = [
  {
    name: "hrm_employees",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "code", type: "text", required: true },
      { name: "full_name", type: "text", required: true },
      { name: "department", type: "text", required: false },
      { name: "designation", type: "text", required: false },
      { name: "email", type: "email", required: false },
      { name: "phone", type: "text", required: false },
      { name: "date_of_joining", type: "date", required: false },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["Active", "Inactive", "Left"], maxSelect: 1 },
      },
      { name: "user_id", type: "relation", required: false, options: { collectionId: "_pb_users_auth_", cascadeDelete: false } },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_attendances",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "employee", type: "relation", required: true, options: { collectionId: "hrm_employees", cascadeDelete: false } },
      { name: "attendance_date", type: "date", required: true },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["Present", "Absent", "On Leave", "Half Day"], maxSelect: 1 },
      },
      { name: "working_hours", type: "number", required: false },
      { name: "in_time", type: "text", required: false },
      { name: "out_time", type: "text", required: false },
      { name: "remarks", type: "text", required: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_leave_types",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "code", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "max_days_allowed", type: "number", required: true },
      { name: "is_lwp", type: "bool", required: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_leave_applications",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "employee", type: "relation", required: true, options: { collectionId: "hrm_employees", cascadeDelete: false } },
      { name: "leave_type", type: "relation", required: true, options: { collectionId: "hrm_leave_types", cascadeDelete: false } },
      { name: "from_date", type: "date", required: true },
      { name: "to_date", type: "date", required: true },
      { name: "total_leave_days", type: "number", required: true },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["Open", "Approved", "Rejected", "Cancelled"], maxSelect: 1 },
      },
      { name: "reason", type: "text", required: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_salary_components",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "name", type: "text", required: true },
      {
        name: "type",
        type: "select",
        required: true,
        options: { values: ["Earning", "Deduction"], maxSelect: 1 },
      },
      { name: "default_amount", type: "number", required: false },
      { name: "description", type: "text", required: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_salary_structures",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "employee", type: "relation", required: true, options: { collectionId: "hrm_employees", cascadeDelete: false } },
      { name: "base_salary", type: "number", required: true },
      { name: "earnings", type: "json", required: false },
      { name: "deductions", type: "json", required: false },
      { name: "is_active", type: "bool", required: true },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_salary_slips",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "employee", type: "relation", required: true, options: { collectionId: "hrm_employees", cascadeDelete: false } },
      { name: "payroll_period", type: "text", required: true },
      { name: "start_date", type: "date", required: true },
      { name: "end_date", type: "date", required: true },
      { name: "payment_days", type: "number", required: true },
      { name: "absent_days", type: "number", required: false },
      { name: "leave_without_pay_days", type: "number", required: false },
      { name: "gross_pay", type: "number", required: true },
      { name: "total_deduction", type: "number", required: true },
      { name: "net_pay", type: "number", required: true },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["Draft", "Submitted", "Cancelled"], maxSelect: 1 },
      },
      { name: "earnings_detail", type: "json", required: false },
      { name: "deductions_detail", type: "json", required: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
  {
    name: "hrm_gl_entries",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "posting_date", type: "date", required: true },
      { name: "account", type: "text", required: true },
      { name: "debit", type: "number", required: true },
      { name: "credit", type: "number", required: true },
      { name: "voucher_type", type: "text", required: true },
      { name: "voucher_no", type: "text", required: true },
      { name: "remarks", type: "text", required: false },
      { name: "is_cancelled", type: "bool", required: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  },
];

/**
 * Initializes all HRM collections in BosBase
 */
export async function ensureHrmCollections(customClient?: BosBase): Promise<{ success: boolean; results: Record<string, string> }> {
  const client = customClient || (await getAdminClient());
  const results: Record<string, string> = {};

  const existingCollections = await client.collections.getFullList();
  const existingMap = new Map(existingCollections.map((c: any) => [c.name, c]));

  for (const def of HRM_COLLECTIONS) {
    const existing = existingMap.get(def.name);
    if (!existing) {
      try {
        await client.collections.create(def as any);
        results[def.name] = "created";
      } catch (err: any) {
        results[def.name] = `error_creating: ${err.message}`;
      }
    } else {
      try {
        const existingFields = existing.fields || [];
        const existingNames = new Set(existingFields.map((f: any) => f.name));
        const missingFields = def.fields.filter((f) => !existingNames.has(f.name));

        if (missingFields.length > 0) {
          await client.collections.update(existing.id, {
            fields: [...existingFields, ...missingFields],
          });
          results[def.name] = `updated_${missingFields.length}_fields`;
        } else {
          results[def.name] = "already_exists";
        }
      } catch (err: any) {
        results[def.name] = `error_updating: ${err.message}`;
      }
    }
  }

  return { success: true, results };
}
