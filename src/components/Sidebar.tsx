import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  CalendarDays, 
  FolderArchive, 
  Users, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Settings, 
  Sparkles,
  Inbox,
  Clock,
  Briefcase,
  KeyRound,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { UserRole, User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  overdueCount: number;
  pendingCheckCount: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  overdueCount,
  pendingCheckCount,
  userRole,
  setUserRole,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan Hệ Thống', icon: LayoutDashboard },
    { id: 'command-center', label: 'Command Center (KTT)', icon: ShieldAlert, badge: overdueCount + pendingCheckCount, badgeColor: 'bg-red-500' },
    { id: 'companies', label: 'Quản Lý Doanh Nghiệp', icon: Building2 },
    { id: 'tasks', label: 'Quản Lý Công Việc', icon: CheckSquare, badge: overdueCount > 0 ? `${overdueCount} Quá hạn` : undefined, badgeColor: 'bg-amber-500' },
    { id: 'tax-calendar', label: 'Lịch Thuế Quan Trọng', icon: CalendarDays },
    { id: 'documents', label: 'Kho Hồ Sơ - Document Vault', icon: FolderArchive },
    { id: 'staff', label: 'Nhân Sự & Đội Ngũ', icon: Users },
    { id: 'reports', label: 'Báo Cáo Quản Trị', icon: FileText },
    { id: 'audit-logs', label: 'Nhật Ký Hoạt Động', icon: Clock },
    { id: 'settings', label: 'Cài Đặt & Quy Trình', icon: Settings },
  ];

  const allowedTabsByRole: Record<string, string[]> = {
    'SUPER_ADMIN': ['dashboard', 'command-center', 'companies', 'tasks', 'tax-calendar', 'documents', 'staff', 'reports', 'audit-logs', 'settings'],
    'ADMIN': ['dashboard', 'command-center', 'companies', 'tasks', 'tax-calendar', 'documents', 'staff', 'reports', 'audit-logs', 'settings'],
    'CHIEF_ACCOUNTANT': ['dashboard', 'command-center', 'companies', 'tasks', 'tax-calendar', 'documents', 'staff', 'reports', 'audit-logs'],
    'MANAGER': ['dashboard', 'companies', 'tasks', 'tax-calendar', 'documents', 'staff', 'reports'],
    'STAFF': ['dashboard', 'companies', 'tasks', 'tax-calendar', 'documents'],
    'CHECKER': ['dashboard', 'companies', 'tasks', 'tax-calendar', 'documents']
  };

  const roleLabels: Record<string, string> = {
    'SUPER_ADMIN': 'Super Admin (Ban Giám Đốc)',
    'ADMIN': 'Quản Trị Hệ Thống',
    'CHIEF_ACCOUNTANT': 'Kế Toán Trưởng (KTT)',
    'MANAGER': 'Trưởng Nhóm / KTTH',
    'STAFF': 'Kế Toán Viên (KTV)',
    'CHECKER': 'Trợ Lý / Thực Tập Sinh'
  };

  const currentDisplayName = currentUser ? currentUser.fullName : 'Nguyễn Hoàng Long (Admin)';
  const currentDisplayAvatar = currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 h-screen flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-wide">AccuTax</h1>
            <p className="text-[11px] text-blue-400 font-medium">Enterprise Tax Management</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50">v2.5</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Danh mục quản lý</div>
        {menuItems.filter(item => allowedTabsByRole[userRole]?.includes(item.id)).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick AI Assistant Banner */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30">
        <div className="flex items-center gap-2 mb-1 text-indigo-300 font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>AccuTax AI Assistant</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Trợ lý AI phân tích rủi ro & giải đáp nghiệp vụ kế toán thuế.
        </p>
      </div>

      {/* Role Switcher & User Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" /> Tài khoản & Phân quyền:
          </span>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium flex items-center gap-0.5"
            >
              <KeyRound className="w-2.5 h-2.5" /> Đổi tài khoản
            </button>
          )}
        </div>
        
        <select
          id="user-role-select"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value as UserRole)}
          className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          {Object.entries(roleLabels).map(([role, label]) => (
            <option key={role} value={role}>{label}</option>
          ))}
        </select>

        <div 
          className="mt-2.5 p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-2 transition-colors"
        >
          <div 
            onClick={onOpenAuthModal}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 hover:opacity-95"
            title="Bấm để mở danh sách tài khoản & ma trận phân quyền"
          >
            <img
              src={currentDisplayAvatar}
              alt="User avatar"
              className="w-8 h-8 rounded-full border border-slate-600 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentDisplayName}</p>
              <p className="text-[10px] text-blue-400 truncate">{roleLabels[userRole] || userRole}</p>
            </div>
          </div>
          
          {onLogout && (
            <button
              id="sidebar-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              title="Đăng xuất khỏi hệ thống"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

