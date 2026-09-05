import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Calendar, Clock, CheckCircle2, HelpCircle, ShieldCheck } from 'lucide-react';
import { Company, CompanyStatus, ServicePackage, User, FilingCycle, VatDeclarationCycle, PitDeclarationCycle, CitDeclarationCycle } from '../types';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company | null;
  users: User[];
  onSave: (companyData: Partial<Company> & { autoGenerateTasks?: boolean }) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  users,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    code: 'CTY-NEW',
    name: '',
    taxCode: '',
    type: 'Công ty TNHH 2 thành viên trở lên',
    industry: 'Thương mại & Dịch vụ',
    address: '',
    representative: '',
    phone: '',
    email: '',
    status: 'Active',
    servicePackage: 'Standard',
    filingCycle: 'Quarter',
    vatCycle: 'Quarter',
    pitCycle: 'Quarter',
    citCycle: 'Quarter',
    fiscalYearEnd: '31/12',
    assigneeIds: [],
    notes: '',
    tags: ['Mới']
  });

  const [autoGenerateTasks, setAutoGenerateTasks] = useState(true);

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        filingCycle: company.filingCycle || 'Quarter',
        vatCycle: company.vatCycle || 'Quarter',
        pitCycle: company.pitCycle || 'Quarter',
        citCycle: company.citCycle || 'Quarter',
        fiscalYearEnd: company.fiscalYearEnd || '31/12'
      });
      setAutoGenerateTasks(false);
    } else {
      setFormData({
        code: `CTY-${Math.floor(Math.random() * 8999 + 1000)}`,
        name: '',
        taxCode: '',
        type: 'Công ty TNHH 2 thành viên trở lên',
        industry: 'Thương mại & Dịch vụ',
        address: '',
        representative: '',
        phone: '',
        email: '',
        status: 'Active',
        servicePackage: 'Standard',
        filingCycle: 'Quarter',
        vatCycle: 'Quarter',
        pitCycle: 'Quarter',
        citCycle: 'Quarter',
        fiscalYearEnd: '31/12',
        assigneeIds: [],
        notes: '',
        tags: ['Mới']
      });
      setAutoGenerateTasks(true);
    }
  }, [company, isOpen]);

  if (!isOpen) return null;

  // Sync sub-cycles when main filing cycle changes
  const handleMainFilingCycleChange = (cycle: FilingCycle) => {
    if (cycle === 'Month') {
      setFormData(prev => ({
        ...prev,
        filingCycle: 'Month',
        vatCycle: 'Month',
        pitCycle: 'Month'
      }));
    } else if (cycle === 'Quarter') {
      setFormData(prev => ({
        ...prev,
        filingCycle: 'Quarter',
        vatCycle: 'Quarter',
        pitCycle: 'Quarter'
      }));
    } else if (cycle === 'Year') {
      setFormData(prev => ({
        ...prev,
        filingCycle: 'Year',
        vatCycle: 'Quarter',
        pitCycle: 'None'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.taxCode) {
      alert('Vui lòng nhập Tên Doanh Nghiệp và Mã Số Thuế');
      return;
    }
    onSave({
      ...formData,
      autoGenerateTasks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">
              {company ? 'Chỉnh Sửa Thông Tin & Kỳ Kê Khai Thuế Doanh Nghiệp' : 'Thêm Doanh Nghiệp Mới & Thiết Lập Lịch Thuế'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span>1. Thông Tin Pháp Nhân Doanh Nghiệp</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mã Doanh Nghiệp *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mã Số Thuế (MST) *</label>
                <input
                  type="text"
                  required
                  placeholder="010xxxxxxx"
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên Đầy Đủ Doanh Nghiệp *</label>
              <input
                type="text"
                required
                placeholder="Công ty TNHH / Cổ Phần..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loại Hình Doanh Nghiệp</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Công ty TNHH 1 thành viên">Công ty TNHH 1 thành viên</option>
                  <option value="Công ty TNHH 2 thành viên trở lên">Công ty TNHH 2 thành viên trở lên</option>
                  <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                  <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                  <option value="Công ty Hợp danh">Công ty Hợp danh</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngành Nghề Kinh Doanh</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Địa Chỉ Đăng Ký Kinh Doanh</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Tax Filing Period Configuration */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>2. Thiết Lập Kỳ Kê Khai Thuế & Lịch Công Việc Pháp Luật</span>
              </h4>
              <span className="text-[10px] text-blue-700 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                Nghị định 126/2020/NĐ-CP
              </span>
            </div>

            {/* Main Filing Cycle Selector */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Kỳ Kê Khai Thuế Chính Của Doanh Nghiệp:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleMainFilingCycleChange('Month')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.filingCycle === 'Month'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>📅 Theo Tháng</span>
                    {formData.filingCycle === 'Month' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <p className={`text-[10px] mt-1 ${formData.filingCycle === 'Month' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Doanh thu năm trước &gt; 50 tỷ VNĐ (Hạn ngày 20 hàng tháng)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleMainFilingCycleChange('Quarter')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.filingCycle === 'Quarter'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>📊 Theo Quý</span>
                    {formData.filingCycle === 'Quarter' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <p className={`text-[10px] mt-1 ${formData.filingCycle === 'Quarter' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Doanh thu ≤ 50 tỷ hoặc DN mới thành lập (Hạn ngày cuối tháng đầu quý sau)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleMainFilingCycleChange('Year')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.filingCycle === 'Year'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>📆 Theo Năm / BCTC</span>
                    {formData.filingCycle === 'Year' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <p className={`text-[10px] mt-1 ${formData.filingCycle === 'Year' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Kê khai quyết toán năm & nộp Báo cáo tài chính (Hạn ngày cuối tháng 3 năm sau)
                  </p>
                </button>
              </div>
            </div>

            {/* Granular Sub-Cycle Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-blue-100">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thuế GTGT (VAT)</label>
                <select
                  value={formData.vatCycle}
                  onChange={(e) => setFormData({ ...formData, vatCycle: e.target.value as VatDeclarationCycle })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                >
                  <option value="Quarter">Kê khai theo Quý (01/GTGT)</option>
                  <option value="Month">Kê khai theo Tháng (01/GTGT)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thuế TNCN (PIT)</label>
                <select
                  value={formData.pitCycle}
                  onChange={(e) => setFormData({ ...formData, pitCycle: e.target.value as PitDeclarationCycle })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                >
                  <option value="Quarter">Kê khai theo Quý (05/KK-TNCN)</option>
                  <option value="Month">Kê khai theo Tháng (05/KK-TNCN)</option>
                  <option value="None">Không phát sinh khấu trừ</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">TNDN & BCTC</label>
                <select
                  value={formData.citCycle}
                  onChange={(e) => setFormData({ ...formData, citCycle: e.target.value as CitDeclarationCycle })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                >
                  <option value="Quarter">Tạm nộp 4 Quý & Quyết toán Năm</option>
                  <option value="Year">Chỉ quyết toán cuối năm</option>
                </select>
              </div>
            </div>

            {/* Auto Schedule Checkbox */}
            <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-100 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateTasks}
                onChange={(e) => setAutoGenerateTasks(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-semibold text-slate-800">
                ⚡ Tự động sinh danh sách lịch công việc & hạn nộp tờ khai chuẩn pháp luật cho doanh nghiệp này
              </span>
            </label>
          </div>

          {/* Service Package & Assignee */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span>3. Gói Dịch Vụ & Phân Công Nhân Sự</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gói Dịch Vụ Kế Toán</label>
                <select
                  value={formData.servicePackage}
                  onChange={(e) => setFormData({ ...formData, servicePackage: e.target.value as ServicePackage })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Cơ bản">Gói Cơ bản</option>
                  <option value="Standard">Gói Standard</option>
                  <option value="Premium">Gói Premium</option>
                  <option value="VIP Custom">Gói VIP Custom</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trạng Thái Hoạt Động</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CompanyStatus })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Active">🟢 Đang hoạt động</option>
                  <option value="Suspended">🟡 Tạm ngừng dịch vụ</option>
                  <option value="New">🔵 Doanh nghiệp mới</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nhân Sự Phụ Trách</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-28 overflow-y-auto">
                {users.map(u => {
                  const isAssigned = (formData.assigneeIds || []).includes(u.id);
                  return (
                    <label key={u.id} className="flex items-center gap-2 cursor-pointer text-slate-800">
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => {
                          const current = formData.assigneeIds || [];
                          const updated = isAssigned ? current.filter(id => id !== u.id) : [...current, u.id];
                          setFormData({ ...formData, assigneeIds: updated });
                        }}
                        className="rounded border-slate-300"
                      />
                      <span>{u.fullName} ({u.role})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ghi Chú Đặc Thù Thuế & Hồ Sơ</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                placeholder="Nhập lưu ý đặc thù của công ty (ưu đãi thuế, rủi ro hóa đơn, đợt quyết toán...)"
              />
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
              <span>Lưu Thiết Lập Doanh Nghiệp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
