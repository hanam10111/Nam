import React from 'react';
import { Settings, ShieldCheck, Database, Bell, Lock, Cpu } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>Cài Đặt Hệ Thống & Quy Trình Kế Toán</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cấu hình quy trình phê duyệt 2 cấp, phân quyền RBAC, tích hợp Gemini AI và cảnh báo tự động.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Quy Trình Phê Duyệt Tờ Khai (Approval Workflow)</span>
          </h3>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-slate-300" />
              <span>Bắt buộc Kế Toán Trưởng duyệt nháp trước khi xuất XML nộp thuế</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-slate-300" />
              <span>Tự động cảnh báo khi tờ khai còn thiếu chứng từ gốc</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Tích Hợp AccuTax AI (Gemini 3.8 Flash)</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-purple-50 text-purple-800 rounded-xl font-medium">
              Model Active: <strong>gemini-3.8-flash</strong> (Tự động phân loại chứng từ & tư vấn thuế)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
