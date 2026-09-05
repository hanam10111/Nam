import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Plus, 
  Building2, 
  Calendar, 
  X,
  FileCheck2,
  AlertCircle,
  Clock,
  Filter,
  FileCode,
  RotateCcw,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { Company, NotificationItem, User } from '../types';

interface TopNavProps {
  companies: Company[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  globalFromDate?: string;
  setGlobalFromDate?: (date: string) => void;
  globalToDate?: string;
  setGlobalToDate?: (date: string) => void;
  globalQuickTag?: string;
  setGlobalQuickTag?: (tag: string) => void;
  onResetGlobalFilters?: () => void;
  onOpenCommandPalette: () => void;
  onOpenAIAssistant: () => void;
  notifications: NotificationItem[];
  onOpenTaskModal: () => void;
  onOpenCompanyModal: () => void;
  onOpenDocModal: () => void;
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  companies,
  selectedCompanyId,
  setSelectedCompanyId,
  selectedPeriod,
  setSelectedPeriod,
  globalFromDate = '',
  setGlobalFromDate,
  globalToDate = '',
  setGlobalToDate,
  globalQuickTag = 'ALL',
  setGlobalQuickTag,
  onResetGlobalFilters,
  onOpenCommandPalette,
  onOpenAIAssistant,
  notifications,
  onOpenTaskModal,
  onOpenCompanyModal,
  onOpenDocModal,
  currentUser,
  onOpenAuthModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showDateFilterPopover, setShowDateFilterPopover] = useState(false);

  // Refs for click outside handling
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (dateFilterRef.current && !dateFilterRef.current.contains(target)) {
        setShowDateFilterPopover(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(target)) {
        setShowQuickAdd(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => `Tháng ${String(i + 1).padStart(2, '0')}/2026`);
  const quarters = ['Quý I/2026', 'Quý II/2026', 'Quý III/2026', 'Quý IV/2026'];
  const years = ['Năm 2026', 'Năm 2025', 'Năm 2024'];

  const unreadCount = notifications.filter(n => !n.read).length;

  const hasActiveFilters = 
    selectedCompanyId !== 'ALL' || 
    selectedPeriod !== 'Tất cả kỳ' || 
    Boolean(globalFromDate) || 
    Boolean(globalToDate) || 
    globalQuickTag !== 'ALL';

  // Preset Date range helpers
  const handleSetDatePreset = (preset: 'today' | 'this_month' | 'this_quarter' | 'this_year' | 'clear') => {
    if (!setGlobalFromDate || !setGlobalToDate) return;
    const now = new Date();
    const currentYear = 2026;
    
    switch (preset) {
      case 'today': {
        const dStr = now.toISOString().split('T')[0];
        setGlobalFromDate(dStr);
        setGlobalToDate(dStr);
        break;
      }
      case 'this_month': {
        setGlobalFromDate(`${currentYear}-09-01`);
        setGlobalToDate(`${currentYear}-09-30`);
        break;
      }
      case 'this_quarter': {
        setGlobalFromDate(`${currentYear}-07-01`);
        setGlobalToDate(`${currentYear}-09-30`);
        break;
      }
      case 'this_year': {
        setGlobalFromDate(`${currentYear}-01-01`);
        setGlobalToDate(`${currentYear}-12-31`);
        break;
      }
      case 'clear': {
        setGlobalFromDate('');
        setGlobalToDate('');
        break;
      }
    }
    setShowDateFilterPopover(false);
  };

  const selectedCompanyObj = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs">
      {/* Primary Header Row */}
      <header className="h-16 px-6 flex items-center justify-between">
        {/* Global Smart Filters */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* 1. Company Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:border-slate-300 transition-colors">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-500 hidden sm:inline">Doanh nghiệp:</span>
            <select
              id="global-company-select"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer max-w-[190px] truncate"
            >
              <option value="ALL">🏢 Tất cả doanh nghiệp ({companies.length})</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Smart Period Selector (Hierarchical Month, Quarter, Year) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:border-slate-300 transition-colors">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-medium text-slate-500 hidden sm:inline">Kỳ kê khai:</span>
            <select
              id="global-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Tất cả kỳ">🌐 Tất cả kỳ kê khai</option>
              <optgroup label="── THEO THÁNG (2026) ──">
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
              <optgroup label="── THEO QUÝ (2026) ──">
                {quarters.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </optgroup>
              <optgroup label="── THEO NĂM (BCTC) ──">
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 3. Smart Date Range Popover Button */}
          {setGlobalFromDate && setGlobalToDate && (
            <div ref={dateFilterRef} className="relative">
              <button
                id="global-date-filter-btn"
                onClick={() => setShowDateFilterPopover(!showDateFilterPopover)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  globalFromDate || globalToDate 
                    ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  {globalFromDate || globalToDate 
                    ? `${globalFromDate || '...'} → ${globalToDate || '...'}`
                    : 'Từ ngày - Đến ngày'}
                </span>
                {(globalFromDate || globalToDate) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 ml-0.5"></span>
                )}
              </button>

              {showDateFilterPopover && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Lọc theo khoảng ngày
                    </span>
                    <button onClick={() => setShowDateFilterPopover(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Từ ngày:</label>
                      <input
                        type="date"
                        value={globalFromDate}
                        onChange={(e) => setGlobalFromDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Đến ngày:</label>
                      <input
                        type="date"
                        value={globalToDate}
                        onChange={(e) => setGlobalToDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  {/* Date Range Quick Presets */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Chọn nhanh:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleSetDatePreset('today')}
                        className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded text-[11px] font-medium"
                      >
                        Hôm nay
                      </button>
                      <button
                        onClick={() => handleSetDatePreset('this_month')}
                        className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded text-[11px] font-medium"
                      >
                        Tháng này
                      </button>
                      <button
                        onClick={() => handleSetDatePreset('this_quarter')}
                        className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded text-[11px] font-medium"
                      >
                        Quý này
                      </button>
                      <button
                        onClick={() => handleSetDatePreset('this_year')}
                        className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded text-[11px] font-medium"
                      >
                        Năm nay
                      </button>
                      <button
                        onClick={() => handleSetDatePreset('clear')}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium ml-auto"
                      >
                        Xóa ngày
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Quick Tag / Fast Filters */}
          {setGlobalQuickTag && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                id="global-quick-tag-select"
                value={globalQuickTag}
                onChange={(e) => setGlobalQuickTag(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="ALL">🔍 Tất cả trạng thái</option>
                <option value="OVERDUE">🔴 Việc quá hạn</option>
                <option value="PENDING_REVIEW">🟡 Chờ KTT duyệt</option>
                <option value="COMPLETED">🟢 Đã hoàn thành</option>
                <option value="XML_FILES">⚡ Tệp XML (Tờ khai / HĐĐT)</option>
              </select>
            </div>
          )}
        </div>

        {/* Center Search Trigger */}
        <button
          id="global-search-trigger"
          onClick={onOpenCommandPalette}
          className="hidden xl:flex items-center justify-between bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg px-3.5 py-1.5 text-xs text-slate-500 w-64 transition-colors ml-3"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Tìm công ty, MST, task, file...</span>
          </div>
          <kbd className="bg-white text-slate-400 border border-slate-300 rounded px-1.5 text-[10px] font-mono shrink-0 ml-1">Ctrl+K</kbd>
        </button>

        {/* Right Action Items */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* AI Assistant Button */}
          <button
            id="ai-assistant-btn"
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all hover:shadow-md shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Hỏi AI Assistant</span>
          </button>

          {/* Quick Create Dropdown */}
          <div ref={quickAddRef} className="relative">
            <button
              id="quick-add-btn"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo nhanh</span>
            </button>

            {showQuickAdd && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30">
                <button
                  onClick={() => { setShowQuickAdd(false); onOpenTaskModal(); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-blue-500" />
                  <span>Tạo công việc mới</span>
                </button>
                <button
                  onClick={() => { setShowQuickAdd(false); onOpenCompanyModal(); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Thêm doanh nghiệp</span>
                </button>
                <button
                  onClick={() => { setShowQuickAdd(false); onOpenDocModal(); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                >
                  <FileCode className="w-4 h-4 text-purple-500" />
                  <span>Upload hồ sơ / Tệp XML</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div ref={notificationsRef} className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-800">Thông báo hệ thống ({notifications.length})</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${n.priority === 'urgent' ? 'text-red-500' : 'text-blue-500'}`} />
                        <div>
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account & Login Switcher Trigger */}
          {onOpenAuthModal && (
            <button
              id="top-nav-user-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shrink-0"
              title="Nhấp để đổi tài khoản hoặc đăng nhập"
            >
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-slate-300 shrink-0"
              />
              <div className="text-left hidden lg:block">
                <span className="text-slate-900 leading-none truncate block max-w-[110px]">{currentUser ? currentUser.fullName : 'Admin'}</span>
                <span className="text-[10px] text-blue-600 font-normal leading-none block">{currentUser?.role || 'SUPER_ADMIN'}</span>
              </div>
              <KeyRound className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          )}
        </div>
      </header>

      {/* Active Global Filter Strip / Ribbon (shows only when filter is active) */}
      {hasActiveFilters && (
        <div className="bg-slate-50/90 border-t border-slate-200 px-6 py-2 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-purple-600" />
            Bộ lọc tổng đang áp dụng:
          </span>

          {selectedCompanyId !== 'ALL' && selectedCompanyObj && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">
              🏢 {selectedCompanyObj.name}
              <button onClick={() => setSelectedCompanyId('ALL')} className="hover:text-blue-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedPeriod !== 'Tất cả kỳ' && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-medium">
              📅 Kỳ: {selectedPeriod}
              <button onClick={() => setSelectedPeriod('Tất cả kỳ')} className="hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(globalFromDate || globalToDate) && (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
              ⏱️ {globalFromDate || '...'} → {globalToDate || '...'}
              <button 
                onClick={() => {
                  if (setGlobalFromDate) setGlobalFromDate('');
                  if (setGlobalToDate) setGlobalToDate('');
                }} 
                className="hover:text-indigo-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {globalQuickTag !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium">
              🏷️ {
                globalQuickTag === 'OVERDUE' ? 'Việc quá hạn' :
                globalQuickTag === 'PENDING_REVIEW' ? 'Chờ KTT duyệt' :
                globalQuickTag === 'COMPLETED' ? 'Đã hoàn thành' :
                globalQuickTag === 'XML_FILES' ? 'Tệp XML' : globalQuickTag
              }
              <button onClick={() => setGlobalQuickTag && setGlobalQuickTag('ALL')} className="hover:text-amber-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onResetGlobalFilters && (
            <button
              onClick={onResetGlobalFilters}
              className="ml-auto flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Xóa toàn bộ bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
};
