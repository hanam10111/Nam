import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Filter, 
  MoreVertical, 
  CheckSquare, 
  AlertCircle, 
  Trash2, 
  Edit, 
  ExternalLink,
  ShieldAlert,
  Tag,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronDown,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Company, CompanyStatus, ServicePackage, User, Task, FilingCycle } from '../types';

interface CompanyListProps {
  companies: Company[];
  tasks?: Task[];
  users: User[];
  onSelectCompany: (companyId: string) => void;
  onOpenCreateModal: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (id: string) => void;
  onBulkAssignStaff: (companyIds: string[], staffId: string) => void;
  onBulkChangeStatus: (companyIds: string[], status: CompanyStatus) => void;
  onSelectTask?: (taskId: string) => void;
  onGeneratePeriodTasks?: (companyId: string, period: string) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  tasks = [],
  users,
  onSelectCompany,
  onOpenCreateModal,
  onEditCompany,
  onDeleteCompany,
  onBulkAssignStaff,
  onBulkChangeStatus,
  onSelectTask,
  onGeneratePeriodTasks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cycleFilter, setCycleFilter] = useState<'ALL' | 'Month' | 'Quarter' | 'Year'>('ALL');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('ALL');
  const [taxObligationFilter, setTaxObligationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [packageFilter, setPackageFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Counts for quick tabs
  const monthCompaniesCount = companies.filter(c => (c.filingCycle || 'Quarter') === 'Month').length;
  const quarterCompaniesCount = companies.filter(c => (c.filingCycle || 'Quarter') === 'Quarter').length;
  const yearCompaniesCount = companies.filter(c => (c.filingCycle || 'Quarter') === 'Year').length;

  // Filter logic
  const filtered = companies.filter(c => {
    const companyCycle = c.filingCycle || 'Quarter';
    
    // Search
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.taxCode.includes(searchTerm) || 
                        c.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filing cycle
    const matchCycle = cycleFilter === 'ALL' || companyCycle === cycleFilter;

    // Period filter & Tax Obligation Progress
    const companyTasks = tasks.filter(t => t.companyId === c.id);
    let matchPeriod = true;
    if (selectedPeriodFilter !== 'ALL') {
      matchPeriod = companyTasks.some(t => t.period === selectedPeriodFilter || (selectedPeriodFilter === '2026' && t.period.includes('2026')));
    }

    let matchObligation = true;
    if (taxObligationFilter === 'OVERDUE') {
      const today = new Date().toISOString().split('T')[0];
      matchObligation = companyTasks.some(t => t.deadline < today && t.status !== 'Hoàn thành' && t.status !== 'Khóa');
    } else if (taxObligationFilter === 'WAITING_CHECK') {
      matchObligation = companyTasks.some(t => t.status === 'Chờ kiểm tra' || t.status === 'Chờ duyệt');
    } else if (taxObligationFilter === 'MISSING_DOCS') {
      matchObligation = companyTasks.some(t => (t.missingDocuments && t.missingDocuments.length > 0) || t.status === 'Chờ bổ sung');
    } else if (taxObligationFilter === 'COMPLETED') {
      matchObligation = companyTasks.length > 0 && companyTasks.every(t => t.status === 'Hoàn thành');
    }

    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchPackage = packageFilter === 'ALL' || c.servicePackage === packageFilter;
    const matchRisk = riskFilter === 'ALL' || c.riskLevel === riskFilter;

    return matchSearch && matchCycle && matchPeriod && matchObligation && matchStatus && matchPackage && matchRisk;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export Companies to Excel
  const handleExportExcel = () => {
    const exportData = filtered.map(c => ({
      'Mã CTY': c.code,
      'Tên Doanh Nghiệp': c.name,
      'Mã Số Thuế': c.taxCode,
      'Kỳ Kê Khai Chính': c.filingCycle === 'Month' ? 'Theo Tháng' : c.filingCycle === 'Year' ? 'Theo Năm' : 'Theo Quý',
      'Kỳ GTGT (VAT)': c.vatCycle === 'Month' ? 'Tháng' : 'Quý',
      'Kỳ TNCN (PIT)': c.pitCycle === 'Month' ? 'Tháng' : c.pitCycle === 'None' ? 'Không' : 'Quý',
      'Loại Hình': c.type,
      'Ngành Nghề': c.industry,
      'Địa Chỉ': c.address,
      'Người Đại Diện': c.representative,
      'Số Điện Thoại': c.phone,
      'Email': c.email,
      'Trạng Thái': c.status,
      'Gói Dịch Vụ': c.servicePackage,
      'Điểm Rủi Ro (0-100)': c.riskScore,
      'Phân Loại Rủi Ro': c.riskLevel,
      'Sức Khỏe Hồ Sơ (%)': c.clientHealthScore,
      'Ghi Chú': c.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDoanhNghiep");
    XLSX.writeFile(workbook, `Danh_Sach_Doanh_Nghiep_AccuTax_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Import Companies from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        alert(`Đã import thành công ${json.length} doanh nghiệp từ tệp Excel!`);
      } catch (err) {
        alert('Lỗi đọc tệp Excel. Vui lòng định dạng đúng bảng tính.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header & Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Danh Mục Doanh Nghiệp & Kỳ Kê Khai Thuế ({filtered.length}/{companies.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tập trung toàn bộ doanh nghiệp, thiết lập kỳ kê khai theo Tháng/Quý/Năm, tự động sinh lịch công việc chuẩn pháp luật và theo dõi tiến độ hoàn thành tờ khai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Import Excel */}
          <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer transition-colors border border-slate-200">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} className="hidden" />
          </label>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Add Company */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Doanh Nghiệp Mới</span>
          </button>
        </div>
      </div>

      {/* SMART FILING PERIOD FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Row 1: Filing Cycle Segments & Quick Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Cycle Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
            <button
              onClick={() => setCycleFilter('ALL')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cycleFilter === 'ALL'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất Cả Kỳ ({companies.length})</span>
            </button>

            <button
              onClick={() => setCycleFilter('Month')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cycleFilter === 'Month'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>📅 Kê Khai Theo Tháng ({monthCompaniesCount})</span>
              <span className="text-[10px] bg-blue-500/30 text-white px-1.5 py-0.2 rounded font-mono">Hạn 20</span>
            </button>

            <button
              onClick={() => setCycleFilter('Quarter')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cycleFilter === 'Quarter'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>📊 Kê Khai Theo Quý ({quarterCompaniesCount})</span>
              <span className="text-[10px] bg-blue-500/30 text-white px-1.5 py-0.2 rounded font-mono">Hạn 30/31</span>
            </button>

            <button
              onClick={() => setCycleFilter('Year')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cycleFilter === 'Year'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>📆 Theo Năm / BCTC ({yearCompaniesCount})</span>
              <span className="text-[10px] bg-blue-500/30 text-white px-1.5 py-0.2 rounded font-mono">Hạn 31/03</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên công ty, Mã CTY hoặc MST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 2: Smart Multi-Dimensional Filters */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Specific Period Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-600 text-[11px]">Kỳ Kê Khai:</span>
              <select
                value={selectedPeriodFilter}
                onChange={(e) => setSelectedPeriodFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">Tất cả kỳ thuế</option>
                <option value="Tháng 08/2026">Tháng 08/2026 (Hiện tại)</option>
                <option value="Tháng 09/2026">Tháng 09/2026</option>
                <option value="Quý III/2026">Quý III/2026 (Hiện tại)</option>
                <option value="Quý II/2026">Quý II/2026</option>
                <option value="Quý IV/2026">Quý IV/2026</option>
                <option value="2026">Năm 2026 (BCTC & Quyết toán)</option>
              </select>
            </div>

            {/* Tax Obligation Progress Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-slate-600 text-[11px]">Tiến Độ Nghĩa Vụ Thuế:</span>
              <select
                value={taxObligationFilter}
                onChange={(e) => setTaxObligationFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">Tất cả tiến độ</option>
                <option value="OVERDUE">🔴 Có tờ khai quá hạn</option>
                <option value="WAITING_CHECK">🟡 Chờ KTT kiểm tra & ký</option>
                <option value="MISSING_DOCS">⚠️ Đang thiếu chứng từ gốc</option>
                <option value="COMPLETED">🟢 Đã hoàn thành 100% nghĩa vụ</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Mọi Mức Rủi Ro</option>
              <option value="Low">🟢 Low Risk</option>
              <option value="Medium">🟡 Medium Risk</option>
              <option value="High">🟠 High Risk</option>
              <option value="Critical">🔴 Critical Risk</option>
            </select>

            {/* Package Filter */}
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Mọi Gói Dịch Vụ</option>
              <option value="Cơ bản">Gói Cơ Bản</option>
              <option value="Standard">Gói Standard</option>
              <option value="Premium">Gói Premium</option>
              <option value="VIP Custom">Gói VIP Custom</option>
            </select>
          </div>

          {(cycleFilter !== 'ALL' || selectedPeriodFilter !== 'ALL' || taxObligationFilter !== 'ALL' || riskFilter !== 'ALL' || packageFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setCycleFilter('ALL');
                setSelectedPeriodFilter('ALL');
                setTaxObligationFilter('ALL');
                setRiskFilter('ALL');
                setPackageFilter('ALL');
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar if Selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between px-5 shadow-lg animate-fade-in">
          <div className="text-xs font-semibold">
            Đã chọn <span className="text-yellow-400 font-bold">{selectedIds.length}</span> doanh nghiệp
          </div>
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onBulkAssignStaff(selectedIds, e.target.value);
                  setSelectedIds([]);
                }
              }}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1"
            >
              <option value="">Giao Nhân Viên Phụ Trách...</option>
              {users.filter(u => u.role === 'STAFF' || u.role === 'MANAGER').map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
              ))}
            </select>

            <button
              onClick={() => {
                onBulkChangeStatus(selectedIds, 'Active');
                setSelectedIds([]);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-lg"
            >
              Mở khóa hoạt động
            </button>
          </div>
        </div>
      )}

      {/* Companies Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Mã / Tên Doanh Nghiệp</th>
                <th className="p-3.5">Mã Số Thuế</th>
                <th className="p-3.5">Kỳ Kê Khai Thuế</th>
                <th className="p-3.5">Lịch Thuế & Công Việc Kỳ Này</th>
                <th className="p-3.5">Nhân Sự Phụ Trách</th>
                <th className="p-3.5">Rủi Ro / Sức Khỏe</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const isSelected = selectedIds.includes(c.id);
                const companyCycle = c.filingCycle || 'Quarter';
                const companyTasks = tasks.filter(t => t.companyId === c.id);
                const overdueTasks = companyTasks.filter(t => t.deadline < new Date().toISOString().split('T')[0] && t.status !== 'Hoàn thành' && t.status !== 'Khóa');
                const waitingTasks = companyTasks.filter(t => t.status === 'Chờ kiểm tra' || t.status === 'Chờ duyệt');

                return (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                          {c.code}
                        </span>
                        <h3 
                          onClick={() => onSelectCompany(c.id)}
                          className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {c.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{c.address}</p>
                      
                      {/* Sub Info */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                          {c.industry}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          c.servicePackage === 'VIP Custom' ? 'bg-purple-100 text-purple-800' :
                          c.servicePackage === 'Premium' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {c.servicePackage}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-slate-800">{c.taxCode}</td>

                    {/* Filing Period Column */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                            companyCycle === 'Month' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            companyCycle === 'Quarter' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {companyCycle === 'Month' ? '📅 Theo Tháng' : companyCycle === 'Quarter' ? '📊 Theo Quý' : '📆 Theo Năm'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <div>GTGT: <strong>{c.vatCycle === 'Month' ? 'Tháng (Hạn 20)' : 'Quý (Hạn 31)'}</strong></div>
                          <div>TNCN: <strong>{c.pitCycle === 'Month' ? 'Tháng' : c.pitCycle === 'None' ? 'Không' : 'Quý'}</strong></div>
                        </div>
                      </div>
                    </td>

                    {/* Matched Tax Schedule & Tasks */}
                    <td className="p-3.5">
                      <div className="space-y-1 max-w-xs">
                        {companyTasks.slice(0, 2).map(t => {
                          const isOverdue = t.deadline < new Date().toISOString().split('T')[0] && t.status !== 'Hoàn thành';
                          return (
                            <div
                              key={t.id}
                              onClick={() => onSelectTask && onSelectTask(t.id)}
                              className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between cursor-pointer transition-all hover:bg-slate-100 ${
                                isOverdue ? 'bg-red-50/80 border-red-200 text-red-900' :
                                t.status === 'Hoàn thành' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' :
                                'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold truncate block">{t.title}</span>
                                <span className="text-[9px] text-slate-500">Hạn: {t.deadline} • {t.period}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                isOverdue ? 'bg-red-500 text-white' :
                                t.status === 'Chờ kiểm tra' ? 'bg-amber-100 text-amber-800' :
                                t.status === 'Hoàn thành' ? 'bg-emerald-600 text-white' :
                                'bg-slate-200 text-slate-700'
                              }`}>
                                {isOverdue ? 'Quá hạn' : t.status}
                              </span>
                            </div>
                          );
                        })}

                        {companyTasks.length === 0 && (
                          <div className="text-[11px] text-slate-400 italic flex items-center gap-1">
                            <span>Chưa có lịch công việc kỳ này.</span>
                            {onGeneratePeriodTasks && (
                              <button
                                onClick={() => onGeneratePeriodTasks(c.id, companyCycle === 'Month' ? 'Tháng 08/2026' : 'Quý III/2026')}
                                className="text-blue-600 hover:text-blue-800 font-bold not-italic underline"
                              >
                                + Sinh lịch ngay
                              </button>
                            )}
                          </div>
                        )}

                        {companyTasks.length > 2 && (
                          <span 
                            onClick={() => onSelectCompany(c.id)}
                            className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline block"
                          >
                            + Xem thêm {companyTasks.length - 2} công việc khác
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Staff */}
                    <td className="p-3.5">
                      <div className="flex items-center -space-x-1">
                        {(c.assigneeIds || []).map(id => {
                          const u = users.find(x => x.id === id);
                          if (!u) return null;
                          return (
                            <img key={u.id} src={u.avatar} title={u.fullName} alt="avatar" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                          );
                        })}
                        {(c.assigneeIds || []).length === 0 && (
                          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Chưa phân công</span>
                        )}
                      </div>
                    </td>

                    {/* Risk & Health */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.riskLevel === 'Critical' ? 'bg-red-600 text-white' :
                          c.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                          c.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          Risk: {c.riskScore}% ({c.riskLevel})
                        </span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${c.clientHealthScore}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'Suspended' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {c.status === 'Active' ? 'Đang dịch vụ' : c.status === 'Suspended' ? 'Tạm ngừng' : 'Doanh nghiệp mới'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectCompany(c.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          Workspace
                        </button>
                        <button
                          onClick={() => onEditCompany(c)}
                          title="Chỉnh sửa thông tin & kỳ kê khai"
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCompany(c.id)}
                          title="Xóa doanh nghiệp"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                    Không tìm thấy doanh nghiệp nào phù hợp với bộ lọc kỳ kê khai và điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
