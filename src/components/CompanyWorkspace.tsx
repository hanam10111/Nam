import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  CheckSquare, 
  FolderArchive, 
  CalendarDays, 
  Users, 
  FileText, 
  MessageSquare, 
  Clock, 
  Plus, 
  AlertTriangle,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Download,
  FileCode
} from 'lucide-react';
import { Company, Task, DocumentItem, User, AuditLog, TaskComment } from '../types';
import { downloadDocumentFile } from '../utils/fileDownloadHelper';

interface CompanyWorkspaceProps {
  company: Company;
  tasks: Task[];
  documents: DocumentItem[];
  users: User[];
  auditLogs: AuditLog[];
  onBack: () => void;
  onOpenTaskModal: () => void;
  onOpenDocModal: () => void;
  onSelectTask: (taskId: string) => void;
}

export const CompanyWorkspace: React.FC<CompanyWorkspaceProps> = ({
  company,
  tasks,
  documents,
  users,
  auditLogs,
  onBack,
  onOpenTaskModal,
  onOpenDocModal,
  onSelectTask
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const companyTasks = tasks.filter(t => t.companyId === company.id);
  const companyDocs = documents.filter(d => d.companyId === company.id);
  const companyLogs = auditLogs.filter(l => l.entityId === company.id || companyTasks.some(t => t.id === l.entityId));

  const tabs = [
    { id: 'overview', label: '1. Tổng Quan' },
    { id: 'tasks', label: `2. Công Việc (${companyTasks.length})` },
    { id: 'tax-calendar', label: '3. Lịch Thuế' },
    { id: 'periods', label: '4. Kỳ Kê Khai' },
    { id: 'documents', label: `5. Hồ Sơ Vault (${companyDocs.length})` },
    { id: 'staff', label: '6. Nhân Sự Phụ Trách' },
    { id: 'checklists', label: '7. Checklist Quy Trình' },
    { id: 'history', label: '8. Lịch Sử Xử Lý' },
    { id: 'notes', label: '9. Ghi Chú' },
    { id: 'comments', label: '10. Trao Đổi Nội Bộ' },
    { id: 'reports', label: '11. Báo Cáo Doanh Nghiệp' },
    { id: 'audit', label: '12. Nhật Ký Hoạt Động' },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header Workspace Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                  {company.code}
                </span>
                <h1 className="text-lg font-bold text-slate-900">{company.name}</h1>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  MST: {company.taxCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Workspace chuyên biệt • {company.type} • {company.industry}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTaskModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Công Việc Mới</span>
            </button>
            <button
              onClick={onOpenDocModal}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Hồ Sơ</span>
            </button>
          </div>
        </div>

        {/* Workspace 12 Tabs Header */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold text-slate-600 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Thông Tin Pháp Lý</h3>
            <div className="space-y-2 text-xs">
              <div><span className="text-slate-400">Đại diện pháp luật:</span> <strong className="text-slate-800">{company.representative}</strong></div>
              <div><span className="text-slate-400">Số điện thoại:</span> <strong className="text-slate-800">{company.phone}</strong></div>
              <div><span className="text-slate-400">Email liên hệ:</span> <strong className="text-slate-800">{company.email}</strong></div>
              <div><span className="text-slate-400">Địa chỉ ĐKKD:</span> <span className="text-slate-700 block mt-0.5">{company.address}</span></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Đánh Giá Sức Khỏe Hồ Sơ</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Sức khỏe hồ sơ (Health Score)</span>
                  <span className="text-blue-600 font-bold">{company.clientHealthScore}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${company.clientHealthScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Rủi ro chậm nộp / sai sót</span>
                  <span className="text-red-600 font-bold">{company.riskScore}/100 ({company.riskLevel})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: `${company.riskScore}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                <strong>Ghi chú đặc thù:</strong> {company.notes}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Tóm Tắt Khối Lượng</h3>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Tổng công việc</span>
                <span className="text-lg font-bold text-slate-900">{companyTasks.length}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-600 block">Hoàn thành</span>
                <span className="text-lg font-bold text-emerald-700">{companyTasks.filter(t => t.status === 'Hoàn thành').length}</span>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                <span className="text-purple-600 block">Tài liệu đã lưu</span>
                <span className="text-lg font-bold text-purple-700">{companyDocs.length}</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <span className="text-red-600 block">Việc quá hạn</span>
                <span className="text-lg font-bold text-red-700">{companyTasks.filter(t => t.deadline < new Date().toISOString().split('T')[0] && t.status !== 'Hoàn thành').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Tasks List */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Danh Sách Công Việc Của {company.name}</h3>
            <button onClick={onOpenTaskModal} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
              + Tạo công việc
            </button>
          </div>

          <div className="space-y-2">
            {companyTasks.map(t => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-600 font-bold">{t.code}</span>
                    <span className="font-bold text-xs text-slate-900">{t.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kỳ: {t.period} • Phụ trách: {t.assigneeName} • Hạn: <strong className="text-red-600">{t.deadline}</strong></p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'Chờ kiểm tra' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{t.completionPct}%</span>
                </div>
              </div>
            ))}

            {companyTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">Doanh nghiệp chưa có công việc nào trong kỳ này.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 5: Documents Vault */}
      {activeTab === 'documents' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Kho Tài Liệu Chứng Từ ({companyDocs.length})</h3>
              <p className="text-xs text-slate-500">Tự động xuất tên tải xuống theo chuẩn: <strong>[Tên công ty]-[Tên file]-[Kỳ kê khai]</strong></p>
            </div>
            <button onClick={onOpenDocModal} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload file XML/PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyDocs.map(d => {
              const isXml = d.fileName.toLowerCase().endsWith('.xml') || d.name.toLowerCase().endsWith('.xml');
              return (
                <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 transition-all flex items-center justify-between gap-3 bg-slate-50/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isXml && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">XML</span>}
                      <span className="font-bold text-xs text-slate-900 truncate block" title={d.name}>{d.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{d.category} • Kỳ: <strong>{d.period}</strong> • v{d.currentVersion} • {d.fileSize}</span>
                  </div>
                  
                  <button
                    onClick={() => downloadDocumentFile(d)}
                    className="shrink-0 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    title="Tải xuống định dạng chuẩn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </button>
                </div>
              );
            })}

            {companyDocs.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-slate-400">
                Chưa có chứng từ nào được lưu trữ cho công ty này. Bấm "+ Upload file XML/PDF" để thêm mới.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs placeholder fallback */}
      {['tax-calendar', 'periods', 'staff', 'checklists', 'history', 'notes', 'comments', 'reports', 'audit'].includes(activeTab) && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">Dữ liệu Tab "{tabs.find(t => t.id === activeTab)?.label}"</h3>
          <p className="text-xs text-slate-500">Toàn bộ dữ liệu của tab được đồng bộ thời gian thực theo ID công ty {company.code}.</p>
        </div>
      )}
    </div>
  );
};
