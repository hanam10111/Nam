import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Check, 
  X, 
  ArrowRight, 
  Briefcase, 
  Calendar, 
  Tag, 
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Copy,
  Lock
} from 'lucide-react';
import { User, Task, Company, Team, StaffRequest, StaffRequestCategory, StaffRequestStatus, RolePermission, UserRole } from '../types';

interface StaffViewProps {
  users: User[];
  tasks: Task[];
  companies: Company[];
  onUpdateUser?: (updated: User) => void;
  onCreateUser?: (created: User) => void;
  onDeleteUser?: (id: string) => void;
  onSelectCompany?: (id: string) => void;
  onRefreshTasks?: () => void;
  onSwitchUser?: (user: User) => void;
  currentUser?: User | null;
}

export const StaffView: React.FC<StaffViewProps> = ({ 
  users: initialUsers, 
  tasks, 
  companies, 
  onUpdateUser, 
  onCreateUser, 
  onDeleteUser,
  onSelectCompany,
  onRefreshTasks,
  onSwitchUser,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'roles-matrix' | 'requests'>('directory');
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters for Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filters for Requests
  const [requestStatusFilter, setRequestStatusFilter] = useState<'ALL' | StaffRequestStatus>('ALL');
  const [requestCategoryFilter, setRequestCategoryFilter] = useState<string>('ALL');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<StaffRequest | null>(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [requestToRespond, setRequestToRespond] = useState<StaffRequest | null>(null);

  // Form states for Staff
  const [staffForm, setStaffForm] = useState<{
    fullName: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    role: User['role'];
    position: string;
    specialty: string[];
    teamId: string;
    status: 'Active' | 'Inactive';
    assignedCompanyIds: string[];
    workloadLimit: number;
    joinDate: string;
    notes: string;
    avatar: string;
    permissions: RolePermission;
  }>({
    fullName: '',
    username: '',
    password: '123',
    email: '',
    phone: '',
    role: 'STAFF',
    position: 'Kế toán thuế viên',
    specialty: ['Thuế GTGT'],
    teamId: '',
    status: 'Active',
    assignedCompanyIds: [],
    workloadLimit: 8,
    joinDate: new Date().toISOString().split('T')[0],
    notes: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: {
      canManageCompanies: false,
      canManageUsers: false,
      canApproveTaxTasks: false,
      canDeleteDocuments: false,
      canAssignTasks: false,
      canViewAllCompanies: false,
      canViewFinancialReports: false,
      canApproveStaffRequests: false
    }
  });

  const [specialtyInput, setSpecialtyInput] = useState('');

  // Form states for Staff Request
  const [requestForm, setRequestForm] = useState<{
    staffId: string;
    category: StaffRequestCategory;
    title: string;
    content: string;
    priority: 'Low' | 'Normal' | 'High' | 'Urgent';
    relatedCompanyId: string;
    relatedTaskId: string;
    targetDate: string;
  }>({
    staffId: 'u3',
    category: 'Gia hạn hạn nộp/deadline',
    title: '',
    content: '',
    priority: 'High',
    relatedCompanyId: '',
    relatedTaskId: '',
    targetDate: ''
  });

  // Form states for Manager Response
  const [feedbackForm, setFeedbackForm] = useState<{
    status: StaffRequestStatus;
    feedback: string;
    respondedByName: string;
  }>({
    status: 'Approved',
    feedback: '',
    respondedByName: 'Trần Kế Toán (KTT)'
  });

  // Sync usersList when initialUsers prop changes
  useEffect(() => {
    setUsersList(initialUsers);
  }, [initialUsers]);

  // Load Staff Requests and Teams from backend
  const loadStaffRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const [reqRes, teamRes] = await Promise.all([
        fetch('/api/staff-requests').then(r => r.json()),
        fetch('/api/teams').then(r => r.json())
      ]);
      if (Array.isArray(reqRes)) setStaffRequests(reqRes);
      if (Array.isArray(teamRes)) setTeams(teamRes);
    } catch (e) {
      console.error('Failed to load staff requests:', e);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadStaffRequests();
  }, []);

  const handleCopyCredentials = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDefaultPermissionsForRole = (role: UserRole): RolePermission => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {
          canManageCompanies: true,
          canManageUsers: true,
          canApproveTaxTasks: true,
          canDeleteDocuments: true,
          canAssignTasks: true,
          canViewAllCompanies: true,
          canViewFinancialReports: true,
          canApproveStaffRequests: true
        };
      case 'CHIEF_ACCOUNTANT':
        return {
          canManageCompanies: true,
          canManageUsers: false,
          canApproveTaxTasks: true,
          canDeleteDocuments: true,
          canAssignTasks: true,
          canViewAllCompanies: true,
          canViewFinancialReports: true,
          canApproveStaffRequests: true
        };
      case 'MANAGER':
        return {
          canManageCompanies: false,
          canManageUsers: false,
          canApproveTaxTasks: false,
          canDeleteDocuments: false,
          canAssignTasks: true,
          canViewAllCompanies: true,
          canViewFinancialReports: true,
          canApproveStaffRequests: false
        };
      case 'STAFF':
      case 'CHECKER':
        return {
          canManageCompanies: false,
          canManageUsers: false,
          canApproveTaxTasks: false,
          canDeleteDocuments: false,
          canAssignTasks: false,
          canViewAllCompanies: false,
          canViewFinancialReports: false,
          canApproveStaffRequests: false
        };
      case 'CLIENT':
        return {
          canManageCompanies: false,
          canManageUsers: false,
          canApproveTaxTasks: false,
          canDeleteDocuments: false,
          canAssignTasks: false,
          canViewAllCompanies: false,
          canViewFinancialReports: false,
          canApproveStaffRequests: false
        };
      default:
        return {
          canManageCompanies: false,
          canManageUsers: false,
          canApproveTaxTasks: false,
          canDeleteDocuments: false,
          canAssignTasks: false,
          canViewAllCompanies: false,
          canViewFinancialReports: false,
          canApproveStaffRequests: false
        };
    }
  };

  // Open Add/Edit Staff Modal
  const handleOpenStaffModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setStaffForm({
        fullName: user.fullName,
        username: user.username || user.email.split('@')[0],
        password: user.password || '123456',
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        position: user.position || 'Kế toán viên',
        specialty: user.specialty || ['Thuế GTGT'],
        teamId: user.teamId || '',
        status: user.status || 'Active',
        assignedCompanyIds: user.assignedCompanyIds || [],
        workloadLimit: user.workloadLimit || 8,
        joinDate: user.joinDate || new Date().toISOString().split('T')[0],
        notes: user.notes || '',
        avatar: user.avatar || `https://images.unsplash.com/photo-1534528741775?w=150`,
        permissions: {
          ...getDefaultPermissionsForRole(user.role),
          ...(user.permissions || {})
        }
      });
    } else {
      setEditingUser(null);
      setStaffForm({
        fullName: '',
        username: '',
        password: '123',
        email: '',
        phone: '',
        role: 'STAFF',
        position: 'Kế toán viên',
        specialty: ['Thuế GTGT', 'Báo cáo thuế'],
        teamId: teams[0]?.id || 't1',
        status: 'Active',
        assignedCompanyIds: [],
        workloadLimit: 8,
        joinDate: new Date().toISOString().split('T')[0],
        notes: '',
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`,
        permissions: getDefaultPermissionsForRole('STAFF')
      });
    }
    setIsStaffModalOpen(true);
  };

  // Submit Staff Form (Create / Edit)
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.fullName.trim() || !staffForm.email.trim()) return;

    const selectedTeam = teams.find(t => t.id === staffForm.teamId);
    const payload = {
      ...staffForm,
      username: staffForm.username.trim() || staffForm.email.split('@')[0],
      teamName: selectedTeam ? selectedTeam.name : ''
    };

    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        setUsersList(prev => prev.map(u => u.id === editingUser.id ? res : u));
        if (onUpdateUser) onUpdateUser(res);
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        setUsersList(prev => [res, ...prev]);
        if (onCreateUser) onCreateUser(res);
      }
      setIsStaffModalOpen(false);
    } catch (err) {
      console.error('Failed to save staff:', err);
    }
  };

  // Delete Staff
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
      if (onDeleteUser) onDeleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete staff:', err);
    }
  };

  // Open Request Modal (Create / Edit)
  const handleOpenRequestModal = (req?: StaffRequest) => {
    if (req) {
      setEditingRequest(req);
      setRequestForm({
        staffId: req.staffId,
        category: req.category,
        title: req.title,
        content: req.content,
        priority: req.priority,
        relatedCompanyId: req.relatedCompanyId || '',
        relatedTaskId: req.relatedTaskId || '',
        targetDate: req.targetDate || ''
      });
    } else {
      setEditingRequest(null);
      setRequestForm({
        staffId: 'u3', // Default staff: Lê Thị Thu
        category: 'Gia hạn hạn nộp/deadline',
        title: '',
        content: '',
        priority: 'High',
        relatedCompanyId: companies[0]?.id || '',
        relatedTaskId: tasks[0]?.id || '',
        targetDate: ''
      });
    }
    setIsRequestModalOpen(true);
  };

  // Submit Staff Request Form
  const handleSaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.title.trim() || !requestForm.content.trim()) return;

    const staffObj = usersList.find(u => u.id === requestForm.staffId) || usersList[0];
    const compObj = companies.find(c => c.id === requestForm.relatedCompanyId);
    const taskObj = tasks.find(t => t.id === requestForm.relatedTaskId);

    const payload = {
      ...requestForm,
      staffName: staffObj?.fullName || 'Lê Thị Thu',
      staffAvatar: staffObj?.avatar,
      staffRole: staffObj?.position || 'Kế toán viên',
      relatedCompanyName: compObj ? compObj.name : undefined,
      relatedTaskTitle: taskObj ? taskObj.title : undefined
    };

    try {
      if (editingRequest) {
        const res = await fetch(`/api/staff-requests/${editingRequest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        setStaffRequests(prev => prev.map(r => r.id === editingRequest.id ? res : r));
      } else {
        const res = await fetch('/api/staff-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        setStaffRequests(prev => [res, ...prev]);
      }
      setIsRequestModalOpen(false);
    } catch (err) {
      console.error('Failed to save staff request:', err);
    }
  };

  // Delete Staff Request
  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu này không?')) return;
    try {
      await fetch(`/api/staff-requests/${id}`, { method: 'DELETE' });
      setStaffRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete staff request:', err);
    }
  };

  // Manager Response / Approval Submit
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestToRespond) return;

    try {
      const res = await fetch(`/api/staff-requests/${requestToRespond.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: feedbackForm.status,
          managerFeedback: feedbackForm.feedback,
          respondedByName: feedbackForm.respondedByName,
          respondedAt: new Date().toISOString()
        })
      }).then(r => r.json());

      setStaffRequests(prev => prev.map(r => r.id === requestToRespond.id ? res : r));
      setIsFeedbackModalOpen(false);
      setRequestToRespond(null);
      if (onRefreshTasks) onRefreshTasks();
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.specialty && u.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchTeam = teamFilter === 'ALL' || u.teamId === teamFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchSearch && matchRole && matchTeam && matchStatus;
  });

  // Filtered Requests
  const filteredRequests = staffRequests.filter(r => {
    const matchStatus = requestStatusFilter === 'ALL' || r.status === requestStatusFilter;
    const matchCategory = requestCategoryFilter === 'ALL' || r.category === requestCategoryFilter;
    const matchSearch = 
      r.title.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      r.staffName.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      (r.relatedCompanyName && r.relatedCompanyName.toLowerCase().includes(requestSearchQuery.toLowerCase()));

    return matchStatus && matchCategory && matchSearch;
  });

  const pendingRequestsCount = staffRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Quản Lý Nhân Sự & Yêu Cầu Đề Xuất Kế Toán Thuế</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Hệ thống quản lý toàn diện đội ngũ kế toán, phân công doanh nghiệp phụ trách, tiếp nhận và phản hồi duyệt các yêu cầu, đề xuất gia hạn deadline từ nhân viên.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'directory' ? (
              <button 
                onClick={() => handleOpenStaffModal()}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nhân Viên Mới</span>
              </button>
            ) : (
              <button 
                onClick={() => handleOpenRequestModal()}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Gửi Yêu Cầu Mới Lên Cấp Trên</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all border-b-2 ${
              activeTab === 'directory'
                ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh mục nhân viên ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all border-b-2 relative ${
              activeTab === 'requests'
                ? 'border-purple-600 text-purple-600 bg-purple-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Yêu cầu & Đề xuất từ nhân viên</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingRequestsCount} chờ duyệt
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Tổng nhân sự</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">{usersList.length}</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-4 h-4" /></span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Đang làm việc (Active)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-emerald-600">{usersList.filter(u => u.status === 'Active').length}</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="w-4 h-4" /></span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Doanh nghiệp đã giao</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-purple-600">
                  {companies.filter(c => c.assigneeIds && c.assigneeIds.length > 0).length} / {companies.length}
                </span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building2 className="w-4 h-4" /></span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Yêu cầu cần phản hồi</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-amber-600">{pendingRequestsCount}</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2.5 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên, chức danh, email, chuyên môn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="CHIEF_ACCOUNTANT">Kế toán trưởng (KTT)</option>
                <option value="MANAGER">Quản lý nhóm (Manager)</option>
                <option value="CHECKER">Người kiểm soát (Checker)</option>
                <option value="STAFF">Nhân viên kế toán thuế</option>
              </select>

              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả nhóm</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Active">Đang làm việc (Active)</option>
                <option value="Inactive">Đã tạm nghỉ (Inactive)</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Tìm thấy <strong className="text-slate-800">{filteredUsers.length}</strong> nhân viên
            </span>
          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map(u => {
              const assignedTasks = tasks.filter(t => t.assigneeId === u.id);
              const assignedComps = companies.filter(c => c.assigneeIds && c.assigneeIds.includes(u.id));
              const completedCount = assignedTasks.filter(t => t.status === 'Hoàn thành').length;
              const maxLimit = u.workloadLimit || 8;
              const loadPct = Math.min(Math.round((assignedComps.length / maxLimit) * 100), 100);

              const roleLabel = 
                u.role === 'CHIEF_ACCOUNTANT' ? 'Kế toán trưởng' :
                u.role === 'MANAGER' ? 'Trưởng nhóm' :
                u.role === 'CHECKER' ? 'Kiểm soát viên' : 'Kế toán thuế';

              const roleBadgeColor =
                u.role === 'CHIEF_ACCOUNTANT' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                u.role === 'MANAGER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                u.role === 'CHECKER' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div key={u.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    {/* Header with Avatar and Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775?w=150'} 
                          alt={u.fullName} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shrink-0" 
                        />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            {u.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                              {roleLabel}
                            </span>
                            <span className="text-[11px] text-slate-500">{u.position || 'Kế toán viên'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenStaffModal(u)}
                          title="Chỉnh sửa thông tin nhân viên"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(u);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Xóa nhân viên"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact & Team */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.phone || 'Chưa cập nhật SĐT'}</span>
                      </div>
                      {u.teamName && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="text-indigo-600 font-medium">{u.teamName}</span>
                        </div>
                      )}
                    </div>

                    {/* Specialties / Skills Tags */}
                    {u.specialty && u.specialty.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {u.specialty.map((spec, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Workload Capacity Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-600">Định mức DN phụ trách:</span>
                        <span className="font-bold text-slate-900">
                          {assignedComps.length} / {maxLimit} DN ({loadPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            loadPct > 90 ? 'bg-red-500' : loadPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${loadPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Assigned Companies Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Doanh nghiệp đang đảm nhiệm ({assignedComps.length}):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {assignedComps.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">Chưa phân công doanh nghiệp</span>
                        ) : (
                          assignedComps.map(c => (
                            <button
                              key={c.id}
                              onClick={() => onSelectCompany && onSelectCompany(c.id)}
                              className="text-[10px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors truncate max-w-[180px]"
                              title={`Click để mở workspace của ${c.name}`}
                            >
                              🏢 {c.code}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{completedCount}/{assignedTasks.length} task xong</span>
                    </div>

                    <button
                      onClick={() => handleOpenStaffModal(u)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Sửa chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF REQUESTS & APPROVALS WORKFLOW */}
      {activeTab === 'requests' && (
        <div className="space-y-5">
          {/* Requests Filters & Actions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2.5 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm tiêu đề, nội dung yêu cầu, tên nhân sự..."
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setRequestStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    requestStatusFilter === 'ALL' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({staffRequests.length})
                </button>
                <button
                  onClick={() => setRequestStatusFilter('Pending')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    requestStatusFilter === 'Pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Chờ duyệt ({staffRequests.filter(r => r.status === 'Pending').length})
                </button>
                <button
                  onClick={() => setRequestStatusFilter('Approved')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    requestStatusFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Đã duyệt ({staffRequests.filter(r => r.status === 'Approved').length})
                </button>
                <button
                  onClick={() => setRequestStatusFilter('Rejected')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    requestStatusFilter === 'Rejected' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'
                  }`}
                >
                  Từ chối ({staffRequests.filter(r => r.status === 'Rejected').length})
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={requestCategoryFilter}
                onChange={(e) => setRequestCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả phân loại yêu cầu</option>
                <option value="Gia hạn hạn nộp/deadline">Gia hạn hạn nộp/deadline</option>
                <option value="Hỗ trợ nghiệp vụ thuế khó">Hỗ trợ nghiệp vụ thuế khó</option>
                <option value="Đề xuất phân công lại công ty">Đề xuất phân công lại công ty</option>
                <option value="Xin nghỉ phép/Vắng mặt">Xin nghỉ phép/Vắng mặt</option>
                <option value="Phê duyệt tờ khai/hồ sơ">Phê duyệt tờ khai/hồ sơ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenRequestModal()}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Gửi đề xuất mới</span>
            </button>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Không tìm thấy yêu cầu nào</h4>
                <p className="text-xs text-slate-400">Hiện không có yêu cầu nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            ) : (
              filteredRequests.map(r => {
                const statusBadge = 
                  r.status === 'Pending' ? { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: '🟡 Đang chờ cấp trên duyệt' } :
                  r.status === 'Approved' ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: '✅ Đã phê duyệt' } :
                  r.status === 'Rejected' ? { bg: 'bg-red-50 text-red-800 border-red-200', text: '❌ Đã từ chối' } :
                  { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: '🔵 Cần bổ sung thông tin' };

                const priorityBadge = 
                  r.priority === 'Urgent' ? 'bg-red-100 text-red-800 font-bold' :
                  r.priority === 'High' ? 'bg-amber-100 text-amber-800 font-bold' :
                  'bg-slate-100 text-slate-700';

                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-purple-200 transition-all space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={r.staffAvatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'} 
                          alt={r.staffName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{r.staffName}</span>
                            <span className="text-[11px] text-slate-400">({r.staffRole || 'Nhân viên'})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityBadge}`}>
                              Ưu tiên: {r.priority}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Gửi lúc: {new Date(r.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge.bg}`}>
                          {statusBadge.text}
                        </span>

                        {/* Staff Actions (Edit / Delete) */}
                        <button
                          onClick={() => handleOpenRequestModal(r)}
                          title="Sửa yêu cầu"
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(r.id)}
                          title="Xóa yêu cầu"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          📌 {r.category}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">{r.title}</h3>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                        {r.content}
                      </p>
                    </div>

                    {/* Metadata References (Company, Task, Target Date) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      {r.relatedCompanyName && (
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Doanh nghiệp: <strong>{r.relatedCompanyName}</strong></span>
                        </span>
                      )}

                      {r.relatedTaskTitle && (
                        <span className="flex items-center gap-1.5 bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg">
                          <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Công việc: <strong>{r.relatedTaskTitle}</strong></span>
                        </span>
                      )}

                      {r.targetDate && (
                        <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>Thời hạn đề xuất: <strong>{r.targetDate}</strong></span>
                        </span>
                      )}
                    </div>

                    {/* Manager Feedback Section */}
                    {r.managerFeedback ? (
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Phản hồi từ Cấp trên ({r.respondedByName || 'Kế toán trưởng'}):
                          </span>
                          {r.respondedAt && (
                            <span className="text-[10px] text-emerald-700">
                              {new Date(r.respondedAt).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-800 whitespace-pre-line font-medium pl-5">
                          "{r.managerFeedback}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-400 italic">Chưa có phản hồi từ cấp trên</span>
                        <button
                          onClick={() => {
                            setRequestToRespond(r);
                            setFeedbackForm({
                              status: 'Approved',
                              feedback: '',
                              respondedByName: 'Trần Kế Toán (KTT)'
                            });
                            setIsFeedbackModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Cấp trên Phản hồi & Duyệt</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT STAFF MEMBER */}
      {/* ========================================================= */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>{editingUser ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Kế Toán Thuế Mới'}</span>
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-0.5">Cấp quyền truy cập hệ thống bằng Gmail</h4>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Nhân viên sẽ sử dụng <strong>địa chỉ Gmail</strong> và <strong>mật khẩu</strong> cấu hình bên dưới để đăng nhập vào hệ thống AccuTax. Các tab công việc và quyền thao tác (RBAC) sẽ tự động hiển thị tương ứng với vị trí Kế toán bạn chọn.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lê Thị Thu"
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Tài khoản Gmail đăng nhập) <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="VD: thu.lt@gmail.com"
                    value={staffForm.email}
                    onChange={(e) => {
                      const emailVal = e.target.value;
                      setStaffForm({ 
                        ...staffForm, 
                        email: emailVal,
                        username: staffForm.username || emailVal.split('@')[0]
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Nhân viên sẽ dùng Gmail này làm tên đăng nhập của họ.</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên đăng nhập phụ (Username)</label>
                  <input
                    type="text"
                    placeholder="Tự động theo Email"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mật khẩu đăng nhập <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Mật khẩu truy cập hệ thống"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 0923456789"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chức danh / Vị trí</label>
                  <input
                    type="text"
                    placeholder="VD: Chuyên viên thuế GTGT & BCTC"
                    value={staffForm.position}
                    onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vai trò hệ thống</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="STAFF">Nhân viên kế toán thuế (STAFF)</option>
                    <option value="CHECKER">Kiểm soát viên hồ sơ (CHECKER)</option>
                    <option value="MANAGER">Trưởng nhóm thuế (MANAGER)</option>
                    <option value="CHIEF_ACCOUNTANT">Kế toán trưởng (CHIEF_ACCOUNTANT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thuộc Nhóm / Team</label>
                  <select
                    value={staffForm.teamId}
                    onChange={(e) => setStaffForm({ ...staffForm, teamId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="">-- Chưa gán nhóm --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Định mức DN tối đa (Workload)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={staffForm.workloadLimit}
                    onChange={(e) => setStaffForm({ ...staffForm, workloadLimit: parseInt(e.target.value) || 8 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái làm việc</label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Active">Đang làm việc (Active)</option>
                    <option value="Inactive">Tạm nghỉ / Vắng mặt (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chuyên môn nghiệp vụ (Tags)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nhập chuyên môn (VD: Hoàn thuế, BCTC, Thuế TNCN...) rồi ấn Thêm"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (specialtyInput.trim() && !staffForm.specialty.includes(specialtyInput.trim())) {
                          setStaffForm({ ...staffForm, specialty: [...staffForm.specialty, specialtyInput.trim()] });
                          setSpecialtyInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (specialtyInput.trim() && !staffForm.specialty.includes(specialtyInput.trim())) {
                        setStaffForm({ ...staffForm, specialty: [...staffForm.specialty, specialtyInput.trim()] });
                        setSpecialtyInput('');
                      }
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-semibold"
                  >
                    Thêm tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {staffForm.specialty.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-200">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setStaffForm({ ...staffForm, specialty: staffForm.specialty.filter((_, idx) => idx !== i) })}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Companies Multi-select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phân công Doanh nghiệp phụ trách ({staffForm.assignedCompanyIds.length}):</label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-1.5">
                  {companies.map(c => {
                    const isChecked = staffForm.assignedCompanyIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-white p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStaffForm({ ...staffForm, assignedCompanyIds: [...staffForm.assignedCompanyIds, c.id] });
                            } else {
                              setStaffForm({ ...staffForm, assignedCompanyIds: staffForm.assignedCompanyIds.filter(id => id !== c.id) });
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-900">{c.code}</span>
                        <span className="text-slate-500 truncate">- {c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú nhân sự</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú kinh nghiệm, chứng chỉ hành nghề, lưu ý..."
                  value={staffForm.notes}
                  onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
                >
                  {editingUser ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION */}
      {/* ========================================================= */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base text-slate-900">Xác nhận xóa nhân sự?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa nhân viên <strong className="text-slate-800">{userToDelete.fullName}</strong> ({userToDelete.email}) khỏi hệ thống? Thao tác này sẽ tự động gỡ phân công các doanh nghiệp hiện tại của nhân sự này.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: STAFF CREATE / EDIT REQUEST */}
      {/* ========================================================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-purple-950 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>{editingRequest ? 'Chỉnh Sửa Yêu Cầu / Đề Xuất' : 'Gửi Yêu Cầu / Đề Xuất Lên Cấp Trên'}</span>
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-purple-400 hover:text-purple-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người gửi yêu cầu</label>
                <select
                  value={requestForm.staffId}
                  onChange={(e) => setRequestForm({ ...requestForm, staffId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                >
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.position || u.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại yêu cầu <span className="text-red-500">*</span></label>
                  <select
                    value={requestForm.category}
                    onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Gia hạn hạn nộp/deadline">Gia hạn hạn nộp/deadline</option>
                    <option value="Hỗ trợ nghiệp vụ thuế khó">Hỗ trợ nghiệp vụ thuế khó</option>
                    <option value="Đề xuất phân công lại công ty">Đề xuất phân công lại công ty</option>
                    <option value="Phê duyệt tờ khai/hồ sơ">Phê duyệt tờ khai/hồ sơ</option>
                    <option value="Xin nghỉ phép/Vắng mặt">Xin nghỉ phép/Vắng mặt</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Normal">Bình thường (Normal)</option>
                    <option value="High">Cao (High)</option>
                    <option value="Urgent">Khẩn cấp (Urgent)</option>
                    <option value="Low">Thấp (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề yêu cầu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: Xin gia hạn deadline Tờ khai GTGT Tháng 8 CTY ABC thêm 3 ngày..."
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết & Lý do <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  placeholder="Trình bày cụ thể lý do, tình hình vướng mắc và đề xuất giải quyết..."
                  value={requestForm.content}
                  onChange={(e) => setRequestForm({ ...requestForm, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              {/* Related Company & Task Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doanh nghiệp liên quan (nếu có)</label>
                  <select
                    value={requestForm.relatedCompanyId}
                    onChange={(e) => setRequestForm({ ...requestForm, relatedCompanyId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="">-- Không chọn --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Công việc / Task liên quan (nếu có)</label>
                  <select
                    value={requestForm.relatedTaskId}
                    onChange={(e) => setRequestForm({ ...requestForm, relatedTaskId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="">-- Không chọn --</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.code} - {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target date (e.g. extension date) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời hạn đề xuất / Ngày gia hạn mong muốn</label>
                <input
                  type="date"
                  value={requestForm.targetDate}
                  onChange={(e) => setRequestForm({ ...requestForm, targetDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
                >
                  {editingRequest ? 'Lưu Yêu Cầu' : 'Gửi Lên Cấp Trên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: MANAGER FEEDBACK & APPROVAL MODAL */}
      {/* ========================================================= */}
      {isFeedbackModalOpen && requestToRespond && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-indigo-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Cấp Trên Phê Duyệt & Phản Hồi Yêu Cầu</span>
              </h3>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-indigo-400 hover:text-indigo-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Yêu cầu từ: {requestToRespond.staffName}</span>
                <p className="font-bold text-slate-900">{requestToRespond.title}</p>
                <p className="text-slate-600 text-[11px]">{requestToRespond.content}</p>
                {requestToRespond.targetDate && (
                  <p className="text-[11px] text-amber-700 font-semibold pt-1">
                    ⏱️ Đề xuất hạn mới: {requestToRespond.targetDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Quyết định phê duyệt <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, status: 'Approved' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      feedbackForm.status === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    ✅ Duyệt yêu cầu
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, status: 'NeedsMoreInfo' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      feedbackForm.status === 'NeedsMoreInfo'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    📝 Bổ sung tin
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, status: 'Rejected' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      feedbackForm.status === 'Rejected'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50'
                    }`}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung ý kiến phản hồi / Hướng dẫn xử lý <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  placeholder="VD: Đã duyệt gia hạn hạn nộp task TSK-202609-001. Đề nghị nhân viên khẩn trương thu thập sổ phụ..."
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người ký duyệt / Phản hồi</label>
                <input
                  type="text"
                  value={feedbackForm.respondedByName}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, respondedByName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              {feedbackForm.status === 'Approved' && requestToRespond.category === 'Gia hạn hạn nộp/deadline' && requestToRespond.relatedTaskId && requestToRespond.targetDate && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Hệ thống sẽ <strong>tự động cập nhật deadline</strong> của task tương ứng sang ngày <strong>{requestToRespond.targetDate}</strong> ngay khi bạn bấm Xác nhận.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
                >
                  Xác Nhận & Gửi Phản Hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
