import React from 'react';
import { FileText, Download, TrendingUp, Users, Building2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Company, Task, User } from '../types';

interface ReportsViewProps {
  companies: Company[];
  tasks: Task[];
  users: User[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ companies, tasks, users }) => {
  const completedTasks = tasks.filter(t => t.status === 'Hoàn thành').length;
  const inProgressTasks = tasks.filter(t => t.status === 'Đang làm' || t.status === 'Chờ bổ sung').length;
  const overdueTasks = tasks.filter(t => t.deadline < new Date().toISOString().split('T')[0] && t.status !== 'Hoàn thành').length;

  const handleExportSummaryReport = () => {
    const reportData = [
      { 'Chỉ Số': 'Tổng Doanh Nghiệp Quản Lý', 'Giá Trị': companies.length },
      { 'Chỉ Số': 'Doanh Nghiệp Rủi Ro Cao', 'Giá Trị': companies.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length },
      { 'Chỉ Số': 'Tổng Công Việc Kỳ Này', 'Giá Trị': tasks.length },
      { 'Chỉ Số': 'Công Việc Đã Hoàn Thành', 'Giá Trị': completedTasks },
      { 'Chỉ Số': 'Công Việc Đang Thực Hiện', 'Giá Trị': inProgressTasks },
      { 'Chỉ Số': 'Công Việc Quá Hạn', 'Giá Trị': overdueTasks },
    ];

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoTongQuan");
    XLSX.writeFile(workbook, `Bao_Cao_Tong_Quan_Kế_Toán_Thuế_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Báo Cáo & Thống Kê Điều Hành Kế Toán - Thuế</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu hiệu suất nhân sự, tỉ lệ hoàn thành tờ khai thuế và chỉ số rủi ro đa doanh nghiệp.
          </p>
        </div>

        <button
          onClick={handleExportSummaryReport}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel Tổng Hợp</span>
        </button>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Phân Bổ Gói Dịch Vụ Doanh Nghiệp</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold"><span>Gói Cơ bản:</span> <span>{companies.filter(c => c.servicePackage === 'Cơ bản').length} CTY</span></div>
            <div className="flex justify-between font-semibold"><span>Gói Standard:</span> <span>{companies.filter(c => c.servicePackage === 'Standard').length} CTY</span></div>
            <div className="flex justify-between font-semibold"><span>Gói Premium:</span> <span>{companies.filter(c => c.servicePackage === 'Premium').length} CTY</span></div>
            <div className="flex justify-between font-semibold text-purple-600"><span>Gói VIP Custom:</span> <span>{companies.filter(c => c.servicePackage === 'VIP Custom').length} CTY</span></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Phân Bổ Mức Độ Rủi Ro Thuế</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-emerald-700"><span>🟢 Low Risk:</span> <span>{companies.filter(c => c.riskLevel === 'Low').length} CTY</span></div>
            <div className="flex justify-between font-semibold text-amber-700"><span>🟡 Medium Risk:</span> <span>{companies.filter(c => c.riskLevel === 'Medium').length} CTY</span></div>
            <div className="flex justify-between font-semibold text-red-600"><span>🟠 High Risk:</span> <span>{companies.filter(c => c.riskLevel === 'High').length} CTY</span></div>
            <div className="flex justify-between font-semibold text-red-800"><span>🔴 Critical Risk:</span> <span>{companies.filter(c => c.riskLevel === 'Critical').length} CTY</span></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tỉ Lệ Tiến Độ Kê Khai</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1"><span>Hoàn thành ({completedTasks}/{tasks.length})</span> <span>{tasks.length ? Math.round((completedTasks/tasks.length)*100) : 0}%</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${tasks.length ? (completedTasks/tasks.length)*100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-red-600"><span>Việc quá hạn ({overdueTasks})</span> <span>{tasks.length ? Math.round((overdueTasks/tasks.length)*100) : 0}%</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${tasks.length ? (overdueTasks/tasks.length)*100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
