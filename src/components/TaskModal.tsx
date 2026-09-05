import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Task, Company, User, TaskStatus, TaskPriority, TaskType, ChecklistItem } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  companies: Company[];
  users: User[];
  onSave: (taskData: Partial<Task>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  companies,
  users,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    companyId: '',
    period: 'Tháng 08/2026',
    taskType: 'Thuế GTGT',
    description: '',
    assigneeId: '',
    checkerId: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Normal',
    status: 'Chưa bắt đầu',
    completionPct: 0,
    checklist: [],
    missingDocuments: [],
    notes: '',
    tags: ['Kê khai']
  });

  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newMissingDoc, setNewMissingDoc] = useState('');

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      const defaultComp = companies[0];
      const defaultStaff = users.find(u => u.role === 'STAFF') || users[0];
      const defaultChecker = users.find(u => u.role === 'CHIEF_ACCOUNTANT') || users[0];

      setFormData({
        title: 'Lập Tờ Khai Thuế GTGT',
        companyId: defaultComp ? defaultComp.id : '',
        companyName: defaultComp ? defaultComp.name : '',
        companyTaxCode: defaultComp ? defaultComp.taxCode : '',
        period: 'Tháng 08/2026',
        taskType: 'Thuế GTGT',
        description: 'Thu thập chứng từ mua vào, bán ra, kiểm tra hóa đơn rủi ro, lập tờ khai.',
        assigneeId: defaultStaff ? defaultStaff.id : '',
        assigneeName: defaultStaff ? defaultStaff.fullName : '',
        checkerId: defaultChecker ? defaultChecker.id : '',
        checkerName: defaultChecker ? defaultChecker.fullName : '',
        createdById: 'u1',
        createdByName: 'Trần Kế Toán (KTT)',
        deadline: new Date().toISOString().split('T')[0],
        priority: 'Normal',
        status: 'Chưa bắt đầu',
        completionPct: 0,
        checklist: [
          { id: 'c1', title: 'Nhận bảng kê mua vào & bán ra', completed: false },
          { id: 'c2', title: 'Đối chiếu hóa đơn trên TraCuuHoaDon', completed: false },
          { id: 'c3', title: 'Lập tờ khai 01/GTGT trên HTKK', completed: false },
          { id: 'c4', title: 'Trình Kế toán trưởng duyệt & ký điện tử', completed: false }
        ],
        missingDocuments: [],
        notes: '',
        tags: ['GTGT']
      });
    }
  }, [task, isOpen, companies, users]);

  if (!isOpen) return null;

  const handleCompanyChange = (cId: string) => {
    const comp = companies.find(c => c.id === cId);
    if (comp) {
      setFormData({
        ...formData,
        companyId: comp.id,
        companyName: comp.name,
        companyTaxCode: comp.taxCode
      });
    }
  };

  const handleAssigneeChange = (uId: string) => {
    const u = users.find(x => x.id === uId);
    if (u) {
      setFormData({
        ...formData,
        assigneeId: u.id,
        assigneeName: u.fullName
      });
    }
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title: newChecklistTitle.trim(),
      completed: false
    };
    setFormData({
      ...formData,
      checklist: [...(formData.checklist || []), newItem]
    });
    setNewChecklistTitle('');
  };

  const toggleChecklistItem = (chkId: string) => {
    const list = formData.checklist || [];
    const updated = list.map(item => {
      if (item.id === chkId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    const completedCount = updated.filter(x => x.completed).length;
    const pct = updated.length ? Math.round((completedCount / updated.length) * 100) : 0;

    setFormData({
      ...formData,
      checklist: updated,
      completionPct: pct
    });
  };

  const handleAddMissingDoc = () => {
    if (!newMissingDoc.trim()) return;
    setFormData({
      ...formData,
      missingDocuments: [...(formData.missingDocuments || []), newMissingDoc.trim()]
    });
    setNewMissingDoc('');
  };

  const handleRemoveMissingDoc = (docName: string) => {
    setFormData({
      ...formData,
      missingDocuments: (formData.missingDocuments || []).filter(d => d !== docName)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.companyId) {
      alert('Vui lòng điền Tiêu đề công việc và Chọn doanh nghiệp');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">
              {task ? `Chỉnh Sửa Công Việc ${task.code}` : 'Tạo Công Việc Kế Toán - Thuế Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Tiêu Đề Công Việc *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Loại Công Việc Thuế</label>
              <select
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
              >
                <option value="Thuế GTGT">Thuế GTGT</option>
                <option value="Thuế TNCN">Thuế TNCN</option>
                <option value="Thuế TNDN">Thuế TNDN</option>
                <option value="Hóa đơn điện tử">Hóa đơn điện tử</option>
                <option value="Báo cáo tài chính">Báo cáo tài chính</option>
                <option value="Quyết toán thuế">Quyết toán thuế</option>
                <option value="Lao động & BHXH">Lao động & BHXH</option>
                <option value="Sao kê Ngân hàng">Sao kê Ngân hàng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Chọn Doanh Nghiệp *</label>
              <select
                value={formData.companyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer font-medium"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kỳ Kê Khai Thuế</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
              >
                <option value="Tháng 08/2026">Tháng 08/2026</option>
                <option value="Tháng 09/2026">Tháng 09/2026</option>
                <option value="Quý III/2026">Quý III/2026</option>
                <option value="Năm 2026">Năm 2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nhân Viên Phụ Trách</label>
              <select
                value={formData.assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
              >
                {users.filter(u => u.role === 'STAFF' || u.role === 'MANAGER').map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mức Độ Ưu Tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
              >
                <option value="Low">Low - Thấp</option>
                <option value="Normal">Normal - Bình thường</option>
                <option value="High">High - Cao</option>
                <option value="Urgent">Urgent - Khẩn cấp 🚨</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hạn Nộp (Deadline) *</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-red-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mô Tả Yêu Cầu Chi Tiết</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
            />
          </div>

          {/* Checklist Items Editor */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="font-bold text-slate-800 block">Checklist Các Bước Quy Trình ({formData.checklist?.length || 0})</label>
            <div className="space-y-1">
              {formData.checklist?.map((chk) => (
                <div key={chk.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk.completed}
                      onChange={() => toggleChecklistItem(chk.id)}
                      className="rounded border-slate-300"
                    />
                    <span className={chk.completed ? 'line-through text-slate-400' : 'text-slate-800'}>{chk.title}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Thêm bước checklist mới..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded"
              >
                + Thêm bước
              </button>
            </div>
          </div>

          {/* Missing Documents List */}
          <div className="bg-red-50/50 p-3 rounded-xl border border-red-200 space-y-2">
            <label className="font-bold text-red-800 block">Danh Sách Chứng Từ Còn Thiếu</label>
            <div className="flex flex-wrap gap-1.5">
              {formData.missingDocuments?.map(doc => (
                <span key={doc} className="bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                  <span>{doc}</span>
                  <button type="button" onClick={() => handleRemoveMissingDoc(doc)} className="text-slate-400 hover:text-red-600">×</button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Nhập tên chứng từ còn thiếu (VD: Sao kê BIDV tháng 8)..."
                value={newMissingDoc}
                onChange={(e) => setNewMissingDoc(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={handleAddMissingDoc}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded"
              >
                + Thêm báo thiếu
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Công Việc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
