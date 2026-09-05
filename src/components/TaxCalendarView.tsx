import React, { useState } from 'react';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, Building2, ChevronRight, Filter } from 'lucide-react';
import { Task, Company } from '../types';

interface TaxCalendarViewProps {
  tasks: Task[];
  companies: Company[];
  onSelectTask: (taskId: string) => void;
}

export const TaxCalendarView: React.FC<TaxCalendarViewProps> = ({
  tasks,
  companies,
  onSelectTask
}) => {
  const [selectedMonth, setSelectedMonth] = useState('08/2026');

  const taxEvents = [
    { date: '2026-08-20', title: 'Hạn nộp Tờ khai thuế GTGT Tháng 07/2026', type: 'Thuế GTGT', priority: 'Critical', law: 'Luật Quản lý thuế số 38/2019/QH14' },
    { date: '2026-08-20', title: 'Hạn nộp Tờ khai thuế TNCN Tháng 07/2026', type: 'Thuế TNCN', priority: 'High', law: 'Luật Thuế TNCN' },
    { date: '2026-08-30', title: 'Hạn nộp Báo cáo tình hình sử dụng hóa đơn Quý II/2026', type: 'Hóa đơn', priority: 'High', law: 'Nghị định 123/2020/NĐ-CP' },
    { date: '2026-09-30', title: 'Hạn tạm nộp Thuế TNDN Tạm tính Quý III/2026', type: 'Thuế TNDN', priority: 'Medium', law: 'Luật Thuế TNDN' },
    { date: '2027-03-31', title: 'Hạn nộp Quyết toán Thuế TNDN & Báo cáo tài chính năm 2026', type: 'BCTC', priority: 'Critical', law: 'Luật Kế toán 2015' }
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            <span>Lịch Thuế Pháp Luật & Hạn Kê Khai Thuế Quan Trọng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật mốc thời gian kê khai, nộp thuế bắt buộc theo Luật Quản lý Thuế Việt Nam hiện hành.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Kỳ hiển thị:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="08/2026">Tháng 08/2026</option>
            <option value="09/2026">Tháng 09/2026</option>
            <option value="Q3/2026">Quý III/2026</option>
            <option value="2026">Cả Năm 2026</option>
          </select>
        </div>
      </div>

      {/* Grid of Legal Tax Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Mốc Hạn Thuế Pháp Luật Bắt Buộc</h3>
          <div className="space-y-3">
            {taxEvents.map((evt, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      {evt.date}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      evt.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {evt.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{evt.title}</h4>
                  <p className="text-[11px] text-slate-500">Căn cứ pháp lý: <strong className="text-slate-700">{evt.law}</strong></p>
                </div>

                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                  {evt.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real tasks aligned with calendar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Công Việc Thực Tế Của Doanh Nghiệp</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {tasks.map(t => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-blue-600 font-bold">{t.code}</span>
                  <span className="text-red-600 font-bold">{t.deadline}</span>
                </div>
                <h5 className="font-bold text-xs text-slate-800">{t.title}</h5>
                <p className="text-[10px] text-slate-500 truncate">{t.companyName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
