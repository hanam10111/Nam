import React from 'react';
import { Clock, ShieldCheck, User, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const dummyLogs = [
    { id: 'l1', userName: 'Trần Kế Toán (KTT)', userRole: 'Kế Toán Trưởng', action: 'SIGN_AND_APPROVE', entityName: 'Tờ khai Thuế GTGT CTY-MINHPHAT Tháng 08/2026', timestamp: '2026-09-04 18:22:10', details: 'Đã kiểm tra số liệu v2 và ký điện tử phê duyệt.' },
    { id: 'l2', userName: 'Lê Thị Mai (NV)', userRole: 'Nhân Viên Kế Toán', action: 'UPLOAD_DOCUMENT', entityName: 'Bảng kê mua vào CTY-A_v2.xlsx', timestamp: '2026-09-04 15:40:05', details: 'Upload tài liệu bổ sung lên Vault.' },
    { id: 'l3', userName: 'Phạm Đức Anh (NV)', userRole: 'Nhân Viên Thuế', action: 'UPDATE_STATUS', entityName: 'Báo cáo sử dụng hóa đơn Quý III', timestamp: '2026-09-04 11:15:30', details: 'Chuyển trạng thái từ "Đang làm" sang "Chờ kiểm tra".' },
    { id: 'l4', userName: 'Trần Kế Toán (KTT)', userRole: 'Kế Toán Trưởng', action: 'REJECT_TASK', entityName: 'Tờ khai thuế TNCN CTY-X', timestamp: '2026-09-03 16:05:00', details: 'Trả lại yêu cầu điều chỉnh danh sách giảm trừ gia cảnh.' }
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          <span>Nhật Ký Hoạt Động Hệ Thống (Audit Trail & Log)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ghi nhận toàn bộ vết lịch sử thay đổi trạng thái tờ khai, người ký duyệt, thời gian upload và phê duyệt chứng từ.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        {dummyLogs.map(log => (
          <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="text-slate-900 font-bold">{log.userName}</strong>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">{log.userRole}</span>
                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">{log.action}</span>
              </div>
              <p className="text-slate-800 font-medium">{log.entityName}</p>
              <p className="text-slate-500 text-[11px]">{log.details}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
