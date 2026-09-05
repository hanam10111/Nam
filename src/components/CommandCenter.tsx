import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldAlert,
  Building2,
  UserCheck
} from 'lucide-react';
import { Task, Company } from '../types';

interface CommandCenterProps {
  tasks: Task[];
  companies: Company[];
  onSelectTask: (taskId: string) => void;
  onSelectCompany: (companyId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  tasks,
  companies,
  onSelectTask,
  onSelectCompany,
  onUpdateTaskStatus
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Red: Overdue or Critical Risk
  const overdueTasks = tasks.filter(t => t.deadline < todayStr && t.status !== 'Hoàn thành' && t.status !== 'Khóa');
  const criticalCompanies = companies.filter(c => c.riskLevel === 'Critical' || c.riskScore > 80);

  // 2. Orange: Deadline within 3 days
  const upcomingTasks = tasks.filter(t => {
    if (t.status === 'Hoàn thành' || t.status === 'Khóa') return false;
    const diff = Math.ceil((new Date(t.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return diff >= 0 && diff <= 3;
  });

  // 3. Yellow: Pending Check & Approval
  const pendingCheckTasks = tasks.filter(t => t.status === 'Chờ kiểm tra' || t.status === 'Chờ duyệt');

  // 4. Blue: Missing Documents
  const missingDocTasks = tasks.filter(t => t.missingDocuments && t.missingDocuments.length > 0 && t.status !== 'Hoàn thành');

  // 5. Green: Completed
  const completedTasks = tasks.filter(t => t.status === 'Hoàn thành');

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight">Trung Tâm Chỉ Đạo Kế Toán Trưởng (Command Center)</h2>
          </div>
          <p className="text-xs text-slate-300">
            Màn hình điều hành tập trung theo dõi 5 cấp độ rủi ro & tiến độ thuế của toàn bộ {companies.length} doanh nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Việc Quá Hạn</span>
            <span className="text-lg font-black text-red-400">{overdueTasks.length}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Chờ Duyệt</span>
            <span className="text-lg font-black text-yellow-400">{pendingCheckTasks.length}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Hoàn Thành</span>
            <span className="text-lg font-black text-emerald-400">{completedTasks.length}</span>
          </div>
        </div>
      </div>

      {/* 5 Status Buckets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bucket 1: Red */}
        <div className="bg-red-50/50 border border-red-200/80 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-red-200 pb-2">
            <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>🔴 Cần Xử Lý Ngay</span>
            </div>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{overdueTasks.length + criticalCompanies.length}</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {criticalCompanies.map(c => (
              <div key={c.id} className="bg-white border border-red-200 rounded-xl p-3 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Doanh Nghiệp Rủi Ro</span>
                  <span className="text-[10px] font-bold text-red-600">Risk: {c.riskScore}%</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 mt-1 cursor-pointer hover:text-red-600" onClick={() => onSelectCompany(c.id)}>
                  {c.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">{c.notes}</p>
              </div>
            ))}

            {overdueTasks.map(t => (
              <div key={t.id} className="bg-white border border-red-200 rounded-xl p-3 shadow-2xs hover:shadow-md transition-shadow space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-red-600 font-bold">{t.code}</span>
                  <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">Hạn: {t.deadline}</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 cursor-pointer hover:text-red-600" onClick={() => onSelectTask(t.id)}>
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{t.companyName}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>NV: {t.assigneeName}</span>
                  <button onClick={() => onSelectTask(t.id)} className="text-red-600 font-semibold flex items-center hover:underline">
                    Xử lý <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}

            {overdueTasks.length === 0 && criticalCompanies.length === 0 && (
              <div className="text-center py-8 text-xs text-red-400 font-medium">Tuyệt vời! Không có cảnh báo quá hạn cực kỳ rủi ro.</div>
            )}
          </div>
        </div>

        {/* Bucket 2: Orange */}
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>🟠 Sắp Đến Hạn (3 ngày)</span>
            </div>
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{upcomingTasks.length}</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {upcomingTasks.map(t => (
              <div key={t.id} className="bg-white border border-amber-200 rounded-xl p-3 shadow-2xs hover:shadow-md transition-shadow space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-amber-700 font-bold">{t.code}</span>
                  <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Hạn: {t.deadline}</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 cursor-pointer hover:text-amber-700" onClick={() => onSelectTask(t.id)}>
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{t.companyName}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>NV: {t.assigneeName}</span>
                  <span className="font-bold text-amber-600">{t.completionPct}%</span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-amber-500">Không có công việc nào sắp đến hạn trong 3 ngày tới.</div>
            )}
          </div>
        </div>

        {/* Bucket 3: Yellow */}
        <div className="bg-yellow-50/50 border border-yellow-200/80 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-yellow-200 pb-2">
            <div className="flex items-center gap-1.5 text-yellow-800 font-bold text-xs uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-yellow-600" />
              <span>🟡 Đang Chờ Duyệt (KTT)</span>
            </div>
            <span className="bg-yellow-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCheckTasks.length}</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {pendingCheckTasks.map(t => (
              <div key={t.id} className="bg-white border border-yellow-200 rounded-xl p-3 shadow-2xs hover:shadow-md transition-shadow space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-600">{t.code}</span>
                  <span className="bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded">Duyệt nháp</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 cursor-pointer hover:text-yellow-700" onClick={() => onSelectTask(t.id)}>
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{t.companyName}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => onUpdateTaskStatus(t.id, 'Hoàn thành')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold py-1 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ký Duyệt</span>
                  </button>
                  <button
                    onClick={() => onUpdateTaskStatus(t.id, 'Cần sửa')}
                    className="bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Trả lại
                  </button>
                </div>
              </div>
            ))}
            {pendingCheckTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-yellow-600">Không có tờ khai nào chờ duyệt.</div>
            )}
          </div>
        </div>

        {/* Bucket 4: Blue */}
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span>🔵 Đang Chờ Hồ Sơ</span>
            </div>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{missingDocTasks.length}</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {missingDocTasks.map(t => (
              <div key={t.id} className="bg-white border border-blue-200 rounded-xl p-3 shadow-2xs hover:shadow-md transition-shadow space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-blue-600">{t.code}</span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Thiếu chứng từ</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 cursor-pointer hover:text-blue-600" onClick={() => onSelectTask(t.id)}>
                  {t.title}
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px] text-red-600 font-medium">
                  Missing: {t.missingDocuments?.join(', ')}
                </div>
              </div>
            ))}
            {missingDocTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-blue-500">Tất cả công việc đã đủ hồ sơ!</div>
            )}
          </div>
        </div>

        {/* Bucket 5: Green */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>🟢 Đã Hoàn Thành</span>
            </div>
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{completedTasks.length}</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {completedTasks.map(t => (
              <div key={t.id} className="bg-white border border-emerald-200 rounded-xl p-3 shadow-2xs space-y-1 opacity-90 hover:opacity-100">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-700 font-bold">{t.code}</span>
                  <span className="text-emerald-700 font-bold">100%</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-800">{t.title}</h4>
                <p className="text-[10px] text-slate-500">{t.companyName}</p>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-emerald-600">Chưa có công việc nào hoàn thành.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
