import React, { useState } from 'react';
import { X, CheckSquare, MessageSquare, Clock, UserCheck, ShieldCheck, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Task, TaskComment, User, TaskStatus } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  users: User[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, text: string) => void;
  onToggleChecklist: (taskId: string, checklistId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  users,
  onUpdateStatus,
  onAddComment,
  onToggleChecklist,
  onDeleteTask
}) => {
  const [commentText, setCommentText] = useState('');

  if (!isOpen || !task) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(task.id, commentText.trim());
    setCommentText('');
  };

  const handleDelete = () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa công việc [${task.code}] ${task.title}? Toàn bộ dữ liệu liên quan ở các tab khác sẽ được cập nhật đồng bộ.`)) return;
    if (onDeleteTask) {
      onDeleteTask(task.id);
      onClose();
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
              {task.code}
            </span>
            <h3 className="font-bold text-sm text-slate-800">{task.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onDeleteTask && (
              <button 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                title="Xóa công việc"
              >
                Xóa Task
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px]">Doanh nghiệp</span>
              <strong className="text-slate-900">{task.companyName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Kỳ kê khai</span>
              <strong className="text-slate-800">{task.period}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Hạn nộp (Deadline)</span>
              <strong className="text-red-600 font-bold">{task.deadline}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Trạng thái</span>
              <span className="font-bold text-blue-600">{task.status} ({task.completionPct}%)</span>
            </div>
          </div>

          {/* Workflow Action Bar */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-2">
            <span className="font-bold text-indigo-900 text-xs">Chuyển Trạng Thái Quy Trình:</span>
            <div className="flex items-center gap-2">
              {task.status !== 'Hoàn thành' && (
                <button
                  onClick={() => onUpdateStatus(task.id, 'Hoàn thành')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>KTT Ký Phê Duyệt</span>
                </button>
              )}

              {task.status !== 'Chờ kiểm tra' && (
                <button
                  onClick={() => onUpdateStatus(task.id, 'Chờ kiểm tra')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs"
                >
                  Gửi KTT Duyệt
                </button>
              )}

              <button
                onClick={() => onUpdateStatus(task.id, 'Cần sửa')}
                className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                Yêu cầu Sửa đổi
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Checklist Quy Trình ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})</span>
              </h4>
              <span className="text-xs font-bold text-blue-600">{task.completionPct}%</span>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {task.checklist.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={c.completed}
                    onChange={() => onToggleChecklist(task.id, c.id)}
                    className="rounded border-slate-300 cursor-pointer"
                  />
                  <span className={c.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                    {c.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Missing Documents */}
          {task.missingDocuments && task.missingDocuments.length > 0 && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
              <h4 className="font-bold text-red-800 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Cảnh Báo Chứng Từ Còn Thiếu:</span>
              </h4>
              <ul className="list-disc list-inside text-red-700 font-medium space-y-0.5">
                {task.missingDocuments.map(doc => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Internal Discussion Comments */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>Trao Đổi Nội Bộ ({task.comments.length})</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {task.comments.map(cm => (
                <div key={cm.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <strong className="text-slate-900">{cm.authorName} ({cm.authorRole})</strong>
                    <span className="text-slate-400">{new Date(cm.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-slate-700">{cm.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập trao đổi hoặc ghi chú cho đồng nghiệp..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
