import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { CalendarOff, CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeavesPage() {
  await requireAdmin();
  const client = await getAdminClient();
  let leaves: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collection("hrm_leave_applications").getList(1, 50, {
      sort: "-created",
      expand: "employee,leave_type",
    });
    leaves = res.items;
  } catch (err: any) {
    errorMsg = err instanceof Error ? err.message : "Chưa khởi tạo collection hrm_leave_applications hoặc chưa có dữ liệu";
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Đã duyệt</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> Từ chối</span>;
      case "Open":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> Chờ duyệt</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-600 bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarOff className="h-6 w-6 text-cyan-600" />
            Đơn Xin Nghỉ Phép (Leave Applications)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Theo dõi và xét duyệt các đơn xin nghỉ phép năm, nghỉ ốm, nghỉ không lương.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Tổng số: {leaves.length} Đơn
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
                <th className="px-6 py-3.5">Nhân viên</th>
                <th className="px-6 py-3.5">Loại ngày phép</th>
                <th className="px-6 py-3.5">Từ ngày</th>
                <th className="px-6 py-3.5">Đến ngày</th>
                <th className="px-6 py-3.5">Số ngày nghỉ</th>
                <th className="px-6 py-3.5">Lý do</th>
                <th className="px-6 py-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length > 0 ? (
                leaves.map((lv) => {
                  const emp = lv.expand?.employee;
                  const lt = lv.expand?.leave_type;
                  return (
                    <tr key={lv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{emp?.full_name || lv.employee}</div>
                        <div className="text-xs text-slate-500 font-mono">{emp?.code}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-800">
                        {lt?.name || lt?.code || lv.leave_type}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {lv.from_date ? lv.from_date.split(" ")[0] : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {lv.to_date ? lv.to_date.split(" ")[0] : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-900">
                        {lv.total_leave_days} ngày
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {lv.reason || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lv.status)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Chưa có đơn xin nghỉ phép nào.
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
