import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Kanban, 
  List, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Bookmark,
  ShieldCheck,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import { Task, Company, User as UserType, TaskStatus, TaskPriority, TaskType, SavedFilter } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  companies: Company[];
  users: UserType[];
  savedFilters: SavedFilter[];
  onSelectTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onBulkChangeStatus: (taskIds: string[], newStatus: TaskStatus) => void;
  globalCompanyId?: string;
  globalPeriod?: string;
  globalFromDate?: string;
  globalToDate?: string;
  globalQuickTag?: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  companies,
  users,
  savedFilters,
  onSelectTask,
  onOpenCreateModal,
  onUpdateTaskStatus,
  onBulkChangeStatus,
  globalCompanyId,
  globalPeriod,
  globalFromDate,
  globalToDate,
  globalQuickTag
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(globalCompanyId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    globalQuickTag === 'OVERDUE' ? 'ALL' :
    globalQuickTag === 'PENDING_REVIEW' ? 'Chờ kiểm tra' :
    globalQuickTag === 'COMPLETED' ? 'Hoàn thành' : 'ALL'
  );
  const [selectedTaskType, setSelectedTaskType] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedDeadlineRange, setSelectedDeadlineRange] = useState<string>(globalQuickTag === 'OVERDUE' ? 'overdue' : 'ALL');
  const [selectedPeriodType, setSelectedPeriodType] = useState<'ALL' | 'Month' | 'Quarter' | 'Year'>('ALL');
  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>(globalPeriod && globalPeriod !== 'Tất cả kỳ' ? globalPeriod : 'ALL');
  const [fromDate, setFromDate] = useState<string>(globalFromDate || '');
  const [toDate, setToDate] = useState<string>(globalToDate || '');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Synchronize when global filters change
  React.useEffect(() => {
    if (globalCompanyId !== undefined) setSelectedCompanyId(globalCompanyId);
  }, [globalCompanyId]);

  React.useEffect(() => {
    if (globalPeriod !== undefined) {
      if (globalPeriod === 'Tất cả kỳ') {
        setSelectedPeriodValue('ALL');
      } else {
        setSelectedPeriodValue(globalPeriod);
      }
    }
  }, [globalPeriod]);

  React.useEffect(() => {
    if (globalFromDate !== undefined) setFromDate(globalFromDate);
  }, [globalFromDate]);

  React.useEffect(() => {
    if (globalToDate !== undefined) setToDate(globalToDate);
  }, [globalToDate]);

  React.useEffect(() => {
    if (globalQuickTag === 'OVERDUE') {
      setSelectedDeadlineRange('overdue');
      setSelectedStatus('ALL');
    } else if (globalQuickTag === 'PENDING_REVIEW') {
      setSelectedStatus('Chờ kiểm tra');
      setSelectedDeadlineRange('ALL');
    } else if (globalQuickTag === 'COMPLETED') {
      setSelectedStatus('Hoàn thành');
      setSelectedDeadlineRange('ALL');
    } else if (globalQuickTag === 'ALL') {
      setSelectedDeadlineRange('ALL');
      setSelectedStatus('ALL');
    }
  }, [globalQuickTag]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCompany = selectedCompanyId === 'ALL' || t.companyId === selectedCompanyId;
    const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchType = selectedTaskType === 'ALL' || t.taskType === selectedTaskType;
    const matchAssignee = selectedAssignee === 'ALL' || t.assigneeId === selectedAssignee;

    let matchPeriodType = true;
    if (selectedPeriodType === 'Month') {
      matchPeriodType = t.period.includes('Tháng') || /T[0-9]{1,2}/i.test(t.period);
    } else if (selectedPeriodType === 'Quarter') {
      matchPeriodType = t.period.includes('Quý') || /Q[1-4]/i.test(t.period);
    } else if (selectedPeriodType === 'Year') {
      matchPeriodType = t.period.includes('Năm') || t.period === '2026' || t.period === '2025';
    }

    let matchPeriodVal = true;
    if (selectedPeriodValue !== 'ALL') {
      matchPeriodVal = t.period.toLowerCase().includes(selectedPeriodValue.toLowerCase());
    }

    let matchDateRange = true;
    if (fromDate || toDate) {
      if (fromDate && t.deadline < fromDate) matchDateRange = false;
      if (toDate && t.deadline > toDate) matchDateRange = false;
    }

    let matchDeadline = true;
    if (selectedDeadlineRange === 'overdue') {
      matchDeadline = t.deadline < todayStr && t.status !== 'Hoàn thành';
    } else if (selectedDeadlineRange === 'today') {
      matchDeadline = t.deadline === todayStr;
    } else if (selectedDeadlineRange === '3days') {
      const diff = Math.ceil((new Date(t.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      matchDeadline = diff >= 0 && diff <= 3;
    }

    return matchSearch && matchCompany && matchStatus && matchType && matchAssignee && matchPeriodType && matchPeriodVal && matchDateRange && matchDeadline;
  });

  const kanbanColumns: TaskStatus[] = ['Chưa bắt đầu', 'Đang làm', 'Chờ kiểm tra', 'Cần sửa', 'Hoàn thành'];

  const applySavedFilter = (sf: SavedFilter) => {
    if (sf.filters.period) setSearchTerm(sf.filters.period);
    if (sf.filters.deadlineRange) setSelectedDeadlineRange(sf.filters.deadlineRange === 'overdue' ? 'overdue' : 'ALL');
    if (sf.filters.statuses && sf.filters.statuses.length > 0) setSelectedStatus(sf.filters.statuses[0]);
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) setSelectedTaskIds([]);
    else setSelectedTaskIds(filteredTasks.map(t => t.id));
  };

  const toggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) setSelectedTaskIds(selectedTaskIds.filter(i => i !== id));
    else setSelectedTaskIds([...selectedTaskIds, id]);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <span>Quản Lý Công Việc Kế Toán & Thuế ({filteredTasks.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi từng bước quy trình lập tờ khai, đối chiếu hóa đơn, kiểm tra & phê duyệt thuế.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Bảng Kanban</span>
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Công Việc Mới</span>
          </button>
        </div>
      </div>

      {/* Smart Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Saved Filters Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Bookmark className="w-3.5 h-3.5 text-blue-500" />
            <span>Bộ lọc đã lưu:</span>
          </span>
          {savedFilters.map(sf => (
            <button
              key={sf.id}
              onClick={() => applySavedFilter(sf)}
              className="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium px-2.5 py-1 rounded-lg shrink-0 border border-slate-200 transition-colors"
            >
              {sf.name}
            </button>
          ))}
        </div>

        {/* Multi-Condition Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mã task, tên công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Mọi Doanh Nghiệp</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>

          <select
            value={selectedPeriodValue}
            onChange={(e) => setSelectedPeriodValue(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Mọi Kỳ Kê Khai</option>
            <optgroup label="Theo Tháng">
              <option value="Tháng 01/2026">Tháng 01/2026</option>
              <option value="Tháng 02/2026">Tháng 02/2026</option>
              <option value="Tháng 03/2026">Tháng 03/2026</option>
              <option value="Tháng 04/2026">Tháng 04/2026</option>
              <option value="Tháng 05/2026">Tháng 05/2026</option>
              <option value="Tháng 06/2026">Tháng 06/2026</option>
              <option value="Tháng 07/2026">Tháng 07/2026</option>
              <option value="Tháng 08/2026">Tháng 08/2026</option>
              <option value="Tháng 09/2026">Tháng 09/2026</option>
              <option value="Tháng 10/2026">Tháng 10/2026</option>
              <option value="Tháng 11/2026">Tháng 11/2026</option>
              <option value="Tháng 12/2026">Tháng 12/2026</option>
            </optgroup>
            <optgroup label="Theo Quý">
              <option value="Quý I/2026">Quý I/2026</option>
              <option value="Quý II/2026">Quý II/2026</option>
              <option value="Quý III/2026">Quý III/2026</option>
              <option value="Quý IV/2026">Quý IV/2026</option>
            </optgroup>
            <optgroup label="Theo Năm">
              <option value="Năm 2026">Năm 2026 (BCTC & Quyết toán)</option>
              <option value="Năm 2025">Năm 2025</option>
            </optgroup>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Mọi Trạng Thái</option>
            <option value="Chưa bắt đầu">Chưa bắt đầu</option>
            <option value="Đang làm">Đang làm</option>
            <option value="Chờ bổ sung">Chờ bổ sung hồ sơ</option>
            <option value="Chờ kiểm tra">Chờ kiểm tra (KTT)</option>
            <option value="Cần sửa">Cần sửa đổi</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>

          <select
            value={selectedTaskType}
            onChange={(e) => setSelectedTaskType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Mọi Loại Thuế / Công Việc</option>
            <option value="Thuế GTGT">Thuế GTGT</option>
            <option value="Thuế TNCN">Thuế TNCN</option>
            <option value="Thuế TNDN">Thuế TNDN</option>
            <option value="Hóa đơn điện tử">Hóa đơn điện tử</option>
            <option value="Báo cáo tài chính">Báo cáo tài chính</option>
            <option value="Quyết toán thuế">Quyết toán thuế</option>
          </select>
        </div>

        {/* Date Range & Deadline Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Hạn Nộp (Deadline):</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400">Từ:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer"
              />
            </div>

            <span className="text-slate-400">→</span>

            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400">Đến:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-[11px] text-red-600 hover:underline font-medium"
              >
                Xóa ngày
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedDeadlineRange}
              onChange={(e) => setSelectedDeadlineRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Mọi Mức Thời Hạn</option>
              <option value="overdue">🔴 Quá hạn nộp</option>
              <option value="today">🟠 Hạn hôm nay</option>
              <option value="3days">🟡 Trong 3 ngày tới</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between px-5 shadow-lg">
          <span className="text-xs font-semibold">Đã chọn <strong className="text-yellow-400">{selectedTaskIds.length}</strong> công việc</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onBulkChangeStatus(selectedTaskIds, 'Hoàn thành'); setSelectedTaskIds([]); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-lg"
            >
              Đánh dấu Hoàn thành
            </button>
            <button
              onClick={() => { onBulkChangeStatus(selectedTaskIds, 'Chờ kiểm tra'); setSelectedTaskIds([]); }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold px-3 py-1 rounded-lg"
            >
              Gửi KTT Duyệt
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: Table List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Mã / Tiêu Đề Công Việc</th>
                  <th className="p-3.5">Doanh Nghiệp Tương Ứng</th>
                  <th className="p-3.5">Kỳ Kê Khai</th>
                  <th className="p-3.5">Phụ Trách / Kiểm Tra</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Ưu Tiên</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(t => {
                  const isSelected = selectedTaskIds.includes(t.id);
                  const isOverdue = t.deadline < todayStr && t.status !== 'Hoàn thành';
                  return (
                    <tr key={t.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(t.id)}
                          className="rounded border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-100 text-blue-600 font-bold px-1.5 py-0.5 rounded">
                            {t.code}
                          </span>
                          <h3 
                            onClick={() => onSelectTask(t.id)}
                            className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {t.title}
                          </h3>
                        </div>
                        {t.missingDocuments && t.missingDocuments.length > 0 && (
                          <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-600 font-medium px-1.5 py-0.2 rounded">
                            Thiếu: {t.missingDocuments.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">{t.companyName}</td>
                      <td className="p-3.5 text-slate-500 font-medium">{t.period}</td>
                      <td className="p-3.5">
                        <div className="text-slate-800 font-semibold">{t.assigneeName}</div>
                        {t.checkerName && <div className="text-[10px] text-slate-400">Duyệt: {t.checkerName}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${isOverdue ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : 'text-slate-700'}`}>
                          {t.deadline} {isOverdue && '(Quá hạn)'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                          t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'Chờ kiểm tra' ? 'bg-yellow-100 text-yellow-800' :
                          t.status === 'Cần sửa' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onSelectTask(t.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                      Không tìm thấy công việc phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(colStatus => {
            const colTasks = filteredTasks.filter(t => t.status === colStatus);
            return (
              <div key={colStatus} className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 space-y-3 flex flex-col min-w-[240px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">{colStatus}</h3>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t.id)}
                      className="bg-white border border-slate-200 hover:border-blue-400 p-3 rounded-xl shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-blue-600 font-bold">{t.code}</span>
                        <span className="text-red-600 font-bold">{t.deadline}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{t.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{t.companyName}</p>

                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>NV: {t.assigneeName}</span>
                        <span className="font-bold text-slate-800">{t.completionPct}%</span>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400">Trống</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
