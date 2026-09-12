import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  await requireAdmin();
  const client = await getAdminClient();
  let attendances: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collection("hrm_attendances").getList(1, 50, {
      sort: "-attendance_date",
      expand: "employee",
    });
    attendances = res.items;
  } catch (err: any) {
    errorMsg = err instanceof Error ? err.message : "Chưa khởi tạo collection hrm_attendances hoặc chưa có dữ liệu";
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Có mặt</span>;
      case "Absent":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> Vắng mặt</span>;
      case "On Leave":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertCircle className="h-3 w-3" /> Nghỉ phép</span>;
      case "Half Day":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Nửa ngày</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-600 bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-cyan-600" />
            Bảng Chấm công Hàng ngày (Attendance)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Ghi nhận thời gian ra vào, số giờ làm việc thực tế và trạng thái điểm danh.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Tổng số: {attendances.length} Bản ghi
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
                <th className="px-6 py-3.5">Ngày</th>
                <th className="px-6 py-3.5">Nhân viên</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5">Giờ vào</th>
                <th className="px-6 py-3.5">Giờ ra</th>
                <th className="px-6 py-3.5">Số giờ công</th>
                <th className="px-6 py-3.5">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendances.length > 0 ? (
                attendances.map((att) => {
                  const emp = att.expand?.employee;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900 text-xs">
                        {att.attendance_date ? att.attendance_date.split(" ")[0] : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{emp?.full_name || att.employee}</div>
                        <div className="text-xs text-slate-500 font-mono">{emp?.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(att.status)}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {att.in_time || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {att.out_time || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                        {att.working_hours ?? 8.0}h
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {att.remarks || "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Chưa có dữ liệu chấm công.
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
