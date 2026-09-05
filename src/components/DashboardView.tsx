import React from 'react';
import { 
  Building2, 
  CheckSquare, 
  AlertTriangle, 
  FileCheck, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { Company, Task, User, NotificationItem } from '../types';

interface DashboardViewProps {
  companies: Company[];
  tasks: Task[];
  users: User[];
  notifications: NotificationItem[];
  onSelectCompany: (id: string) => void;
  onSelectTask: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAIAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  companies,
  tasks,
  users,
  notifications,
  onSelectCompany,
  onSelectTask,
  onNavigateTab,
  onOpenAIAssistant
}) => {
  const activeCompanies = companies.filter(c => c.status === 'Active').length;
  const highRiskCompanies = companies.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.deadline < todayStr && t.status !== 'Hoàn thành' && t.status !== 'Khóa');
  const pendingCheckTasks = tasks.filter(t => t.status === 'Chờ kiểm tra' || t.status === 'Chờ duyệt');
  const inProgressTasks = tasks.filter(t => t.status === 'Đang làm' || t.status === 'Chờ bổ sung');
  const completedTasks = tasks.filter(t => t.status === 'Hoàn thành');

  // Workload per staff
  const staffWorkload = users.filter(u => u.role === 'STAFF' || u.role === 'MANAGER').map(u => {
    const assignedTasks = tasks.filter(t => t.assigneeId === u.id);
    const overdue = assignedTasks.filter(t => t.deadline < todayStr && t.status !== 'Hoàn thành').length;
    return {
      user: u,
      total: assignedTasks.length,
      overdue,
      completed: assignedTasks.filter(t => t.status === 'Hoàn thành').length
    };
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Tổng Quan Hệ Thống Thuế & Kế Toán Đa Doanh Nghiệp</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tập trung <strong className="text-slate-800">{companies.length} doanh nghiệp</strong>, <strong className="text-slate-800">{tasks.length} đầu việc</strong> kê khai thuế kỳ hiện tại.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('command-center')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Command Center (KTT)</span>
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Phân Tích AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Doanh Nghiệp</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{companies.length}</span>
            <span className="text-xs text-emerald-600 font-medium">({activeCompanies} Hoạt động)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{highRiskCompanies.length} DN xếp loại Rủi ro cao</span>
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công Việc Kỳ Này</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{tasks.length}</span>
            <span className="text-xs text-indigo-600 font-medium">({inProgressTasks.length} Đang làm)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedTasks.length} việc đã hoàn thành</span>
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Công Việc Quá Hạn</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{overdueTasks.length}</span>
            <span className="text-xs text-red-500 font-bold uppercase">Cần Ưu Tiên</span>
          </div>
          <p className="text-[11px] text-red-500 mt-2 truncate">
            {overdueTasks.length > 0 ? `Ví dụ: ${overdueTasks[0].title}` : 'Không có việc quá hạn'}
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ KTT Kiểm Tra & Ký</span>
            <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-yellow-600">{pendingCheckTasks.length}</span>
            <span className="text-xs text-slate-500 font-medium">tờ khai nháp</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cần Kế Toán Trưởng kiểm duyệt trước khi nộp</p>
        </div>
      </div>

      {/* Middle Grid: High Risk Companies & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Companies List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Doanh Nghiệp Có Nguy Cơ & Rủi Ro Cao</span>
              </h3>
              <p className="text-[11px] text-slate-500">Xếp hạng theo điểm rủi ro Risk Score & tình trạng thiếu chứng từ</p>
            </div>
            <button
              onClick={() => onNavigateTab('companies')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({companies.length})</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {highRiskCompanies.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectCompany(c.id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{c.name}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded">{c.code}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">MST: {c.taxCode} • Ngành: {c.industry}</p>
                  <p className="text-[11px] text-red-600 font-medium">Ghi chú: {c.notes}</p>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    Risk: {c.riskScore}/100
                  </span>
                  <div className="mt-1 text-[10px] text-slate-400">Health: {c.clientHealthScore}%</div>
                </div>
              </div>
            ))}

            {highRiskCompanies.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">Không có doanh nghiệp rủi ro cao.</div>
            )}
          </div>
        </div>

        {/* Staff Workload Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Tải Công Việc Nhân Sự</span>
              </h3>
              <p className="text-[11px] text-slate-500">Phân bổ workload đầu việc theo từng nhân viên</p>
            </div>
            <button onClick={() => onNavigateTab('staff')} className="text-xs text-blue-600 font-semibold hover:underline">
              Quản lý
            </button>
          </div>

          <div className="space-y-4">
            {staffWorkload.map(item => (
              <div key={item.user.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.user.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-semibold text-slate-800">{item.user.fullName}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] font-mono">
                    <strong className="text-slate-800">{item.total}</strong> việc {item.overdue > 0 && <span className="text-red-500 font-bold">({item.overdue} Quá hạn)</span>}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${item.total ? (item.completed / item.total) * 100 : 0}%` }} title="Hoàn thành" />
                  <div className="bg-red-500 h-full" style={{ width: `${item.total ? (item.overdue / item.total) * 100 : 0}%` }} title="Quá hạn" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Task List Quick Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-purple-500" />
            <span>Danh Sách Công Việc Cần Theo Dõi Gấp</span>
          </h3>
          <button onClick={() => onNavigateTab('tasks')} className="text-xs text-blue-600 font-semibold hover:underline">
            Mở bảng công việc đầy đủ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Mã / Công việc</th>
                <th className="p-3">Doanh nghiệp</th>
                <th className="p-3">Kỳ</th>
                <th className="p-3">Người phụ trách</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 rounded-r-lg text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.slice(0, 5).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <span className="font-mono text-[10px] text-blue-600 font-bold block">{t.code}</span>
                    <span className="font-semibold text-slate-800">{t.title}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{t.companyName}</td>
                  <td className="p-3 text-slate-500">{t.period}</td>
                  <td className="p-3 text-slate-700 font-medium">{t.assigneeName}</td>
                  <td className="p-3 font-semibold text-red-600">{t.deadline}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'Chờ kiểm tra' ? 'bg-yellow-100 text-yellow-800' :
                      t.status === 'Cần sửa' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectTask(t.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
