import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { Users, UserPlus, Mail, Phone, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  await requireAdmin();
  const client = await getAdminClient();
  let employees: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collection("hrm_employees").getList(1, 50, {
      sort: "-created",
    });
    employees = res.items;
  } catch (err: any) {
    errorMsg = err instanceof Error ? err.message : "Chưa khởi tạo collection hrm_employees hoặc chưa có dữ liệu";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-600" />
            Hồ sơ Nhân viên (Employees)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Quản lý danh sách nhân sự, thông tin liên hệ, phòng ban và chức danh.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Tổng số: {employees.length} Nhân viên
        </span>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Thông báo:</p>
          <p className="mt-1">{errorMsg}</p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Mã NV</th>
                <th className="px-6 py-3.5">Họ và Tên</th>
                <th className="px-6 py-3.5">Phòng ban / Chức danh</th>
                <th className="px-6 py-3.5">Liên hệ</th>
                <th className="px-6 py-3.5">Ngày vào</th>
                <th className="px-6 py-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 text-xs">
                      {emp.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {emp.full_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-slate-800">{emp.department || "Chưa phân bổ"}</span>
                        <span className="text-slate-500">{emp.designation || "Nhân viên"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="space-y-0.5">
                        {emp.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{emp.email}</div>}
                        {emp.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{emp.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {emp.date_of_joining ? emp.date_of_joining.split(" ")[0] : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        emp.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Chưa có hồ sơ nhân viên nào trong hệ thống BosBase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
