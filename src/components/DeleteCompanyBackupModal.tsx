import React, { useState } from 'react';
import { 
  Trash2, 
  Download, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import { Company, Task, DocumentItem } from '../types';

interface DeleteCompanyBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  tasks: Task[];
  documents: DocumentItem[];
  onConfirmDelete: (companyId: string) => void;
}

export const DeleteCompanyBackupModal: React.FC<DeleteCompanyBackupModalProps> = ({
  isOpen,
  onClose,
  company,
  tasks,
  documents,
  onConfirmDelete
}) => {
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [agreeToDelete, setAgreeToDelete] = useState(false);

  if (!isOpen || !company) return null;

  // Lọc các dữ liệu liên quan của doanh nghiệp này để sao lưu
  const companyTasks = tasks.filter(t => t.companyId === company.id);
  const companyDocs = documents.filter(d => d.companyId === company.id);

  const handleDownloadBackup = () => {
    try {
      const backupData = {
        company: company,
        tasks: companyTasks,
        documents: companyDocs,
        backupTimestamp: new Date().toISOString(),
        backupType: "AccuTax Enterprise Company Backup",
        version: "2.5"
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute(
        "download", 
        `backup_${company.code.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setHasDownloaded(true);
      setAgreeToDelete(true); // Tự động đồng ý khi đã tải về bản backup an toàn
    } catch (err) {
      console.error("Backup failed", err);
      alert("Đã xảy ra lỗi khi tạo bản sao lưu.");
    }
  };

  const handleConfirm = () => {
    onConfirmDelete(company.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-sm text-white">Xác Nhận Xóa & Sao Lưu Doanh Nghiệp</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-950 text-[13px]">Hành động này cực kỳ nhạy cảm và không thể hoàn tác!</p>
              <p className="text-red-800 mt-1">
                Bạn đang chuẩn bị xóa doanh nghiệp <strong className="text-red-950 font-bold">{company.name}</strong> ({company.code}) cùng với toàn bộ dữ liệu công việc và tài liệu liên kết.
              </p>
            </div>
          </div>

          {/* Dữ liệu liên quan sẽ bị xóa */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Các dữ liệu liên quan sẽ bị xóa vĩnh viễn kèm theo:</h4>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Công việc kê khai</p>
                  <p className="font-black text-slate-900 text-xs">{companyTasks.length} nhiệm vụ</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Chứng từ hồ sơ (Vault)</p>
                  <p className="font-black text-slate-900 text-xs">{companyDocs.length} tài liệu số hóa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hộp Backup bắt buộc */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-blue-950">📥 Bước 1: Tải Bản Sao Lưu Dữ Liệu</h4>
                <p className="text-blue-800 text-[11px] mt-1">
                  Nhấp vào nút bên dưới để lưu trữ an toàn toàn bộ dữ liệu của doanh nghiệp dưới dạng tệp tin <strong className="font-mono">JSON</strong> về máy tính cá nhân trước khi thực hiện xóa.
                </p>
              </div>
              {hasDownloaded && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> Đã sao lưu
                </span>
              )}
            </div>

            <button
              id="btn-download-backup"
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải Xuống Bản Sao Lưu Dữ Liệu (JSON)</span>
            </button>
          </div>

          {/* Checkbox xác nhận */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="checkbox-agree-delete"
                type="checkbox"
                checked={agreeToDelete}
                onChange={(e) => setAgreeToDelete(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500 border-slate-300 w-4 h-4"
              />
              <span className="text-slate-600 select-none leading-relaxed text-[11px]">
                Tôi xác nhận đã tải bản sao lưu dữ liệu an toàn (hoặc không cần sao lưu thêm) và hoàn toàn tự chịu trách nhiệm nếu xảy ra mất mát dữ liệu khi xóa vĩnh viễn doanh nghiệp <strong className="text-slate-900 font-semibold">{company.name}</strong>.
              </span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            id="btn-confirm-delete-company"
            type="button"
            disabled={!agreeToDelete}
            onClick={handleConfirm}
            className={`px-5 py-2 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
              agreeToDelete
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/10 cursor-pointer'
                : 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Xác Nhận Xóa Vĩnh Viễn</span>
          </button>
        </div>

      </div>
    </div>
  );
};
