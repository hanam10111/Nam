import React, { useState, useEffect } from 'react';
import { Search, Building2, CheckSquare, FileText, ArrowRight, X } from 'lucide-react';
import { Company, Task, DocumentItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  tasks: Task[];
  documents: DocumentItem[];
  onSelectCompany: (companyId: string) => void;
  onSelectTask: (taskId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  companies,
  tasks,
  documents,
  onSelectCompany,
  onSelectTask
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.taxCode.includes(query) || 
    c.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.code.toLowerCase().includes(query.toLowerCase()) || 
    t.companyName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) || 
    d.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Tìm kiếm nhanh doanh nghiệp, mã thuế, công việc, file chứng từ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {/* Companies */}
          {filteredCompanies.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Doanh nghiệp</span>
              </div>
              <div className="space-y-1">
                {filteredCompanies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectCompany(c.id); onClose(); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800">{c.name}</span>
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded">{c.code}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">MST: {c.taxCode} • Ngành: {c.industry}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Công việc kế toán - thuế</span>
              </div>
              <div className="space-y-1">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onSelectTask(t.id); onClose(); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800">{t.title}</span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-medium px-1.5 py-0.5 rounded">{t.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.companyName} • Hạn: {t.deadline} • Người phụ trách: {t.assigneeName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>Hồ sơ - Chứng từ</span>
              </div>
              <div className="space-y-1">
                {filteredDocs.map(d => (
                  <div key={d.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-800">{d.name}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{d.companyName} • {d.category} • v{d.currentVersion}</p>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">{d.fileSize}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCompanies.length === 0 && filteredTasks.length === 0 && filteredDocs.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Không tìm thấy kết quả phù hợp với từ khóa "{query}"
            </div>
          )}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span>Sử dụng phím điều hướng để chọn</span>
          <span className="font-mono">ESC để thoát</span>
        </div>
      </div>
    </div>
  );
};
