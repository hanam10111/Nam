import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { CommandPalette } from './components/CommandPalette';
import { DashboardView } from './components/DashboardView';
import { CommandCenter } from './components/CommandCenter';
import { CompanyList } from './components/CompanyList';
import { CompanyWorkspace } from './components/CompanyWorkspace';
import { CompanyModal } from './components/CompanyModal';
import { TaskManager } from './components/TaskManager';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { DocumentVault } from './components/DocumentVault';
import { ReportsView } from './components/ReportsView';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { TaxCalendarView } from './components/TaxCalendarView';
import { StaffView } from './components/StaffView';
import { AuditLogsView } from './components/AuditLogsView';
import { SettingsView } from './components/SettingsView';
import { LoginScreen } from './components/LoginScreen';
import { DeleteCompanyBackupModal } from './components/DeleteCompanyBackupModal';
import { AuthModal } from './components/AuthModal';

import { 
  Company, 
  Task, 
  DocumentItem, 
  User, 
  AuditLog, 
  NotificationItem, 
  SavedFilter,
  TaskStatus,
  CompanyStatus 
} from './types';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tất cả kỳ');
  const [globalFromDate, setGlobalFromDate] = useState<string>('');
  const [globalToDate, setGlobalToDate] = useState<string>('');
  const [globalQuickTag, setGlobalQuickTag] = useState<string>('ALL');
  const [currentRole, setCurrentRole] = useState<'CHIEF_ACCOUNTANT' | 'MANAGER' | 'STAFF' | 'SUPER_ADMIN' | 'ADMIN' | 'CHECKER'>('CHIEF_ACCOUNTANT');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleResetGlobalFilters = () => {
    setSelectedCompanyId('ALL');
    setSelectedPeriod('Tất cả kỳ');
    setGlobalFromDate('');
    setGlobalToDate('');
    setGlobalQuickTag('ALL');
  };

  // Modals & Drawers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleteBackupModalOpen, setIsDeleteBackupModalOpen] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [selectedTaskDetailId, setSelectedTaskDetailId] = useState<string | null>(null);

  // App Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Fetch initial data from Express API backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [compRes, taskRes, docRes, userRes, notifRes, logRes, filterRes] = await Promise.all([
          fetch('/api/companies').then(r => r.json()),
          fetch('/api/tasks').then(r => r.json()),
          fetch('/api/documents').then(r => r.json()),
          fetch('/api/users').then(r => r.json()),
          fetch('/api/notifications').then(r => r.json()),
          fetch('/api/audit-logs').then(r => r.json()),
          fetch('/api/saved-filters').then(r => r.json())
        ]);

        if (Array.isArray(compRes)) setCompanies(compRes);
        if (Array.isArray(taskRes)) setTasks(taskRes);
        if (Array.isArray(docRes)) setDocuments(docRes);
        if (Array.isArray(notifRes)) setNotifications(notifRes);
        if (Array.isArray(logRes)) setAuditLogs(logRes);
        if (Array.isArray(filterRes)) setSavedFilters(filterRes);
        
        if (Array.isArray(userRes)) {
          setUsers(userRes);
          // Restore login session
          const savedUserStr = localStorage.getItem('accutax_current_user');
          if (savedUserStr) {
            try {
              const savedUser = JSON.parse(savedUserStr);
              const match = userRes.find(u => u.id === savedUser.id);
              if (match) {
                setCurrentUser(match);
                setCurrentRole(match.role as any);
              }
            } catch (err) {
              console.error('Error parsing saved user', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load API data:', err);
      }
    }

    loadInitialData();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role as any);
    localStorage.setItem('accutax_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('accutax_current_user');
  };

  const handleSetRoleAndUser = (role: any) => {
    setCurrentRole(role);
    const matchedUser = users.find(u => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem('accutax_current_user', JSON.stringify(matchedUser));
    }
  };

  // Keyboard shortcut Ctrl+K or Cmd+K for global command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGeneratePeriodTasks = (companyId: string, period: string) => {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;

    const cycle = comp.filingCycle || 'Quarter';
    const newTasksToAdd: Task[] = [];

    if (cycle === 'Month' || period.includes('Tháng')) {
      newTasksToAdd.push(
        {
          id: `t-gen-${Date.now()}-1`,
          code: `GTGT-M-${Math.floor(Math.random() * 899 + 100)}`,
          title: `Lập & nộp Tờ khai thuế GTGT ${period} (Mẫu 01/GTGT)`,
          companyId: comp.id,
          companyName: comp.name,
          companyTaxCode: comp.taxCode,
          period,
          taskType: 'Thuế GTGT',
          description: `Kê khai thuế GTGT theo Tháng theo NĐ 126/2020. Rà soát hóa đơn điện tử và bảng kê mua vào - bán ra.`,
          assigneeId: comp.assigneeIds[0] || 'u3',
          assigneeName: users.find(u => u.id === comp.assigneeIds[0])?.fullName || 'Lê Thị Mai',
          checkerId: 'u1',
          checkerName: 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Hệ thống tự động',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: '2026-09-20',
          priority: 'High',
          status: 'Chưa bắt đầu',
          completionPct: 0,
          checklist: [
            { id: 'ck1', title: 'Thu thập hóa đơn đầu vào, đầu ra tháng', completed: false },
            { id: 'ck2', title: 'Đối chiếu dữ liệu cổng HĐĐT Tổng cục Thuế', completed: false },
            { id: 'ck3', title: 'Lập tờ khai 01/GTGT trên HTKK/phần mềm', completed: false },
            { id: 'ck4', title: 'KTT ký số và nộp qua thuế điện tử (thuedientu.gdt.gov.vn)', completed: false }
          ],
          tags: ['GTGT', 'Theo Tháng', 'Pháp lý'],
          updatedAt: new Date().toISOString()
        },
        {
          id: `t-gen-${Date.now()}-2`,
          code: `TNCN-M-${Math.floor(Math.random() * 899 + 100)}`,
          title: `Kê khai thuế TNCN khấu trừ ${period} (Mẫu 05/KK-TNCN)`,
          companyId: comp.id,
          companyName: comp.name,
          companyTaxCode: comp.taxCode,
          period,
          taskType: 'Thuế TNCN',
          description: `Khấu trừ và kê khai thuế TNCN tháng phát sinh từ tiền lương, tiền công.`,
          assigneeId: comp.assigneeIds[0] || 'u3',
          assigneeName: users.find(u => u.id === comp.assigneeIds[0])?.fullName || 'Lê Thị Mai',
          checkerId: 'u1',
          checkerName: 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Hệ thống tự động',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: '2026-09-20',
          priority: 'Normal',
          status: 'Chưa bắt đầu',
          completionPct: 0,
          checklist: [
            { id: 'ck1', title: 'Chốt bảng lương và trích nộp BHXH tháng', completed: false },
            { id: 'ck2', title: 'Tính thuế TNCN khấu trừ của người lao động', completed: false },
            { id: 'ck3', title: 'Lập tờ khai 05/KK-TNCN và ký nộp', completed: false }
          ],
          tags: ['TNCN', 'Theo Tháng'],
          updatedAt: new Date().toISOString()
        }
      );
    } else if (cycle === 'Quarter' || period.includes('Quý')) {
      newTasksToAdd.push(
        {
          id: `t-gen-${Date.now()}-1`,
          code: `GTGT-Q-${Math.floor(Math.random() * 899 + 100)}`,
          title: `Lập & nộp Tờ khai thuế GTGT ${period} (Mẫu 01/GTGT)`,
          companyId: comp.id,
          companyName: comp.name,
          companyTaxCode: comp.taxCode,
          period,
          taskType: 'Thuế GTGT',
          description: `Kê khai thuế GTGT theo Quý. Hạn nộp ngày cuối cùng của tháng đầu quý tiếp theo.`,
          assigneeId: comp.assigneeIds[0] || 'u3',
          assigneeName: users.find(u => u.id === comp.assigneeIds[0])?.fullName || 'Lê Thị Mai',
          checkerId: 'u1',
          checkerName: 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Hệ thống tự động',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: '2026-10-31',
          priority: 'High',
          status: 'Chưa bắt đầu',
          completionPct: 0,
          checklist: [
            { id: 'ck1', title: 'Rà soát hóa đơn 3 tháng trong quý', completed: false },
            { id: 'ck2', title: 'Kiểm tra tính hợp lệ và cảnh báo rủi ro thuế', completed: false },
            { id: 'ck3', title: 'Kết xuất XML tờ khai 01/GTGT', completed: false },
            { id: 'ck4', title: 'Trình KTT duyệt và ký nộp eTax', completed: false }
          ],
          tags: ['GTGT', 'Theo Quý', 'Trọng tâm'],
          updatedAt: new Date().toISOString()
        },
        {
          id: `t-gen-${Date.now()}-2`,
          code: `TNDN-Q-${Math.floor(Math.random() * 899 + 100)}`,
          title: `Tạm tính & Tạm nộp Thuế TNDN ${period}`,
          companyId: comp.id,
          companyName: comp.name,
          companyTaxCode: comp.taxCode,
          period,
          taskType: 'Thuế TNDN',
          description: `Tạm tính thuế TNDN quý (đảm bảo 4 quý đạt tối thiểu 80% số thuế phải nộp cả năm).`,
          assigneeId: comp.assigneeIds[0] || 'u3',
          assigneeName: users.find(u => u.id === comp.assigneeIds[0])?.fullName || 'Lê Thị Mai',
          checkerId: 'u1',
          checkerName: 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Hệ thống tự động',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: '2026-10-30',
          priority: 'Normal',
          status: 'Chưa bắt đầu',
          completionPct: 0,
          checklist: [
            { id: 'ck1', title: 'Tập hợp doanh thu và chi phí hợp lý quý', completed: false },
            { id: 'ck2', title: 'Ước tính lợi nhuận và số thuế TNDN tạm nộp', completed: false },
            { id: 'ck3', title: 'Lập giấy nộp tiền vào NSNN nếu phát sinh số phải nộp', completed: false }
          ],
          tags: ['TNDN', 'Theo Quý'],
          updatedAt: new Date().toISOString()
        }
      );
    } else {
      // Annual / Year
      newTasksToAdd.push(
        {
          id: `t-gen-${Date.now()}-1`,
          code: `BCTC-${Math.floor(Math.random() * 899 + 100)}`,
          title: `Lập Báo cáo tài chính (BCTC) & Thuyết minh Năm 2026`,
          companyId: comp.id,
          companyName: comp.name,
          companyTaxCode: comp.taxCode,
          period: 'Năm 2026',
          taskType: 'Báo cáo tài chính',
          description: `Lập Bảng CĐKT, Báo cáo KQKD, Báo cáo LCTT và Thuyết minh BCTC theo TT 200/TT 133.`,
          assigneeId: comp.assigneeIds[0] || 'u3',
          assigneeName: users.find(u => u.id === comp.assigneeIds[0])?.fullName || 'Lê Thị Mai',
          checkerId: 'u1',
          checkerName: 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Hệ thống tự động',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: '2027-03-31',
          priority: 'Urgent',
          status: 'Chưa bắt đầu',
          completionPct: 0,
          checklist: [
            { id: 'ck1', title: 'Khóa sổ kế toán và kiểm kê tài sản cuối năm', completed: false },
            { id: 'ck2', title: 'Đối chiếu công nợ phải thu - phải trả', completed: false },
            { id: 'ck3', title: 'Lập bộ BCTC hoàn chỉnh', completed: false },
            { id: 'ck4', title: 'KTT kiểm toán nội bộ và ký phát hành', completed: false }
          ],
          tags: ['BCTC', 'Quyết toán', 'Theo Năm'],
          updatedAt: new Date().toISOString()
        },
        {
          id: `t-gen-${Date.now()}-2`,
          code: `QTT-TNDN-${Math.floor(Math.random() * 899 + 100)}`,
          title: `Quyết toán thuế TNDN Năm 2026 (Mẫu 03/TNDN)`,
          companyId: comp.id,
          companyName: comp.name,
          companyTaxCode: comp.taxCode,
          period: 'Năm 2026',
          taskType: 'Quyết toán thuế',
          description: `Quyết toán thuế TNDN năm, rà soát chi phí không được trừ theo quy định pháp luật.`,
          assigneeId: comp.assigneeIds[0] || 'u3',
          assigneeName: users.find(u => u.id === comp.assigneeIds[0])?.fullName || 'Lê Thị Mai',
          checkerId: 'u1',
          checkerName: 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Hệ thống tự động',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: '2027-03-31',
          priority: 'Urgent',
          status: 'Chưa bắt đầu',
          completionPct: 0,
          checklist: [
            { id: 'ck1', title: 'Loại trừ chi phí không hợp lý (chỉ tiêu B)', completed: false },
            { id: 'ck2', title: 'Tính toán ưu đãi thuế (nếu có)', completed: false },
            { id: 'ck3', title: 'Ký nộp tờ khai 03/TNDN', completed: false }
          ],
          tags: ['Quyết toán TNDN', 'Theo Năm'],
          updatedAt: new Date().toISOString()
        }
      );
    }

    setTasks(prev => [...newTasksToAdd, ...prev]);
  };

  // Handlers for Company CRUD
  const handleSaveCompany = async (companyData: Partial<Company> & { autoGenerateTasks?: boolean }) => {
    const shouldAutoTasks = companyData.autoGenerateTasks;
    delete companyData.autoGenerateTasks;

    if (editingCompany) {
      // Update existing
      try {
        const res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        }).then(r => r.json());

        setCompanies(prev => prev.map(c => c.id === editingCompany.id ? res : c));
        // Cross-tab cascade: update companyName & taxCode across all tasks and documents
        setTasks(prev => prev.map(t => t.companyId === res.id ? { ...t, companyName: res.name, companyTaxCode: res.taxCode } : t));
        setDocuments(prev => prev.map(d => d.companyId === res.id ? { ...d, companyName: res.name, companyCode: res.code } : d));
      } catch (e) {
        const updated = { ...editingCompany, ...companyData } as Company;
        setCompanies(prev => prev.map(c => c.id === editingCompany.id ? updated : c));
        setTasks(prev => prev.map(t => t.companyId === updated.id ? { ...t, companyName: updated.name, companyTaxCode: updated.taxCode } : t));
        setDocuments(prev => prev.map(d => d.companyId === updated.id ? { ...d, companyName: updated.name, companyCode: updated.code } : d));
      }
      setEditingCompany(null);
    } else {
      // Create new
      let createdCompany: Company;
      try {
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        }).then(r => r.json());

        createdCompany = res;
        setCompanies(prev => [res, ...prev]);
      } catch (e) {
        createdCompany = {
          id: `c-${Date.now()}`,
          code: companyData.code || 'CTY-NEW',
          name: companyData.name || 'Doanh Nghiệp Mới',
          taxCode: companyData.taxCode || '0100000000',
          type: companyData.type || 'Công ty TNHH',
          industry: companyData.industry || 'Thương mại',
          address: companyData.address || '',
          representative: companyData.representative || '',
          phone: companyData.phone || '',
          email: companyData.email || '',
          status: companyData.status || 'Active',
          servicePackage: companyData.servicePackage || 'Standard',
          filingCycle: companyData.filingCycle || 'Quarter',
          vatCycle: companyData.vatCycle || 'Quarter',
          pitCycle: companyData.pitCycle || 'Quarter',
          citCycle: companyData.citCycle || 'Quarter',
          fiscalYearEnd: companyData.fiscalYearEnd || '31/12',
          assigneeIds: companyData.assigneeIds || [],
          riskScore: 20,
          riskLevel: 'Low',
          clientHealthScore: 90,
          notes: companyData.notes || '',
          tags: companyData.tags || ['Mới']
        };
        setCompanies(prev => [createdCompany, ...prev]);
      }

      if (shouldAutoTasks) {
        handleGeneratePeriodTasks(createdCompany.id, createdCompany.filingCycle === 'Month' ? 'Tháng 08/2026' : 'Quý III/2026');
      }
    }
  };

  const handleDeleteCompanyClick = (id: string) => {
    const comp = companies.find(c => c.id === id);
    if (comp) {
      setCompanyToDelete(comp);
      setIsDeleteBackupModalOpen(true);
    }
  };

  const handleConfirmDeleteCompany = async (id: string) => {
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    // Full cross-tab cascading cleanup
    setCompanies(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.filter(t => t.companyId !== id));
    setDocuments(prev => prev.filter(d => d.companyId !== id));
    setUsers(prev => prev.map(u => ({
      ...u,
      assignedCompanyIds: (u.assignedCompanyIds || []).filter(cid => cid !== id)
    })));

    if (selectedCompanyId === id) {
      setSelectedCompanyId('ALL');
      if (activeTab === 'company-workspace') {
        setActiveTab('companies');
      }
    }
  };

  const handleBulkAssignStaff = (companyIds: string[], staffId: string) => {
    setCompanies(prev => prev.map(c => {
      if (companyIds.includes(c.id)) {
        return {
          ...c,
          assigneeIds: Array.from(new Set([...c.assigneeIds, staffId]))
        };
      }
      return c;
    }));
  };

  const handleBulkChangeCompanyStatus = (companyIds: string[], status: CompanyStatus) => {
    setCompanies(prev => prev.map(c => companyIds.includes(c.id) ? { ...c, status } : c));
  };

  // Handlers for Task CRUD
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      try {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        }).then(r => r.json());

        setTasks(prev => prev.map(t => t.id === editingTask.id ? res : t));
      } catch (e) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
      }
      setEditingTask(null);
    } else {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        }).then(r => r.json());

        setTasks(prev => [res, ...prev]);
      } catch (e) {
        const newTask: Task = {
          id: `t-${Date.now()}`,
          code: `TASK-${Math.floor(Math.random() * 899 + 100)}`,
          title: taskData.title || 'Công việc mới',
          companyId: taskData.companyId || '',
          companyName: taskData.companyName || '',
          companyTaxCode: taskData.companyTaxCode || '',
          period: taskData.period || selectedPeriod,
          taskType: taskData.taskType || 'Thuế GTGT',
          description: taskData.description || '',
          assigneeId: taskData.assigneeId || 'u3',
          assigneeName: taskData.assigneeName || 'Lê Thị Mai',
          checkerId: taskData.checkerId || 'u1',
          checkerName: taskData.checkerName || 'Trần Kế Toán (KTT)',
          createdById: 'u1',
          createdByName: 'Trần Kế Toán (KTT)',
          createdDate: new Date().toISOString().split('T')[0],
          deadline: taskData.deadline || new Date().toISOString().split('T')[0],
          priority: taskData.priority || 'Normal',
          status: taskData.status || 'Chưa bắt đầu',
          completionPct: 0,
          checklist: taskData.checklist || [],
          missingDocuments: taskData.missingDocuments || [],
          comments: [],
          notes: '',
          tags: ['GTGT'],
          updatedAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
      }
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const pct = newStatus === 'Hoàn thành' ? 100 : t.completionPct;
        return { ...t, status: newStatus, completionPct: pct };
      }
      return t;
    }));
  };

  const handleBulkChangeTaskStatus = (taskIds: string[], newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (taskIds.includes(t.id)) {
        const pct = newStatus === 'Hoàn thành' ? 100 : t.completionPct;
        return { ...t, status: newStatus, completionPct: pct };
      }
      return t;
    }));
  };

  const handleToggleChecklist = (taskId: string, chkId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedList = t.checklist.map(c => c.id === chkId ? { ...c, completed: !c.completed } : c);
        const completedCount = updatedList.filter(x => x.completed).length;
        const pct = updatedList.length ? Math.round((completedCount / updatedList.length) * 100) : 0;
        return { ...t, checklist: updatedList, completionPct: pct };
      }
      return t;
    }));
  };

  const handleAddComment = (taskId: string, text: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newComment = {
          id: `cm-${Date.now()}`,
          authorId: 'u1',
          authorName: 'Trần Kế Toán (KTT)',
          authorRole: currentRole,
          content: text,
          createdAt: new Date().toISOString()
        };
        return { ...t, comments: [...t.comments, newComment] };
      }
      return t;
    }));
  };

  // Handlers for Document Upload
  const handleUploadDocument = async (docData: Partial<DocumentItem>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      }).then(r => r.json());

      setDocuments(prev => [res, ...prev]);
    } catch (e) {
      const newDoc: DocumentItem = {
        id: `d-${Date.now()}`,
        companyId: docData.companyId || '',
        companyName: docData.companyName || '',
        period: docData.period || selectedPeriod,
        category: docData.category || 'Tài liệu khác',
        name: docData.name || 'File.xml',
        fileName: docData.fileName || 'File.xml',
        fileSize: docData.fileSize || '1.2 MB',
        fileType: docData.fileType || 'application/xml',
        originalExtension: docData.originalExtension || '.xml',
        fileContent: docData.fileContent,
        currentVersion: 1,
        versions: docData.versions || [
          { 
            version: 1, 
            fileName: docData.fileName || 'File.xml', 
            uploadedAt: new Date().toISOString(), 
            uploadedBy: 'Trần Kế Toán (KTT)', 
            fileSize: docData.fileSize || '1.2 MB',
            fileContent: docData.fileContent,
            originalExtension: docData.originalExtension || '.xml'
          }
        ],
        uploadedBy: 'Trần Kế Toán (KTT)',
        uploadedAt: new Date().toISOString(),
        confidenceScore: docData.confidenceScore || 95
      };
      setDocuments(prev => [newDoc, ...prev]);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleBulkDeleteDocuments = async (docIds: string[]) => {
    try {
      await fetch('/api/documents/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: docIds })
      });
    } catch (e) {
      console.error(e);
    }
    setDocuments(prev => prev.filter(d => !docIds.includes(d.id)));
  };

  const handleBulkUpdateDocuments = async (docIds: string[], updates: Partial<DocumentItem>) => {
    try {
      await fetch('/api/documents/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: docIds, updates })
      });
    } catch (e) {
      console.error(e);
    }
    setDocuments(prev => prev.map(d => {
      if (docIds.includes(d.id)) {
        return {
          ...d,
          ...updates
        };
      }
      return d;
    }));
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskDetailId === taskId) {
      setSelectedTaskDetailId(null);
    }
  };

  // User CRUD Handlers
  const handleCreateUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    // Cascade user name update to assigned tasks
    setTasks(prev => prev.map(t => {
      let changed = false;
      let newT = { ...t };
      if (t.assigneeId === updatedUser.id) {
        newT.assigneeName = updatedUser.fullName;
        changed = true;
      }
      if (t.checkerId === updatedUser.id) {
        newT.checkerName = updatedUser.fullName;
        changed = true;
      }
      return changed ? newT : t;
    }));

    // Synchronize company assignments in local state
    if (updatedUser.assignedCompanyIds) {
      setCompanies(prev => prev.map(c => {
        if (updatedUser.assignedCompanyIds.includes(c.id)) {
          if (!c.assigneeIds.includes(updatedUser.id)) {
            return { ...c, assigneeIds: [...c.assigneeIds, updatedUser.id] };
          }
        } else {
          if (c.assigneeIds.includes(updatedUser.id)) {
            return { ...c, assigneeIds: c.assigneeIds.filter(id => id !== updatedUser.id) };
          }
        }
        return c;
      }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    // Clean up from companies
    setCompanies(prev => prev.map(c => ({
      ...c,
      assigneeIds: c.assigneeIds.filter(id => id !== userId)
    })));

    // Clean up task assignments across all tasks
    setTasks(prev => prev.map(t => {
      let changed = false;
      let newT = { ...t };
      if (t.assigneeId === userId) {
        newT.assigneeId = '';
        newT.assigneeName = 'Chưa phân công';
        changed = true;
      }
      if (t.checkerId === userId) {
        newT.checkerId = 'u1';
        newT.checkerName = 'Trần Kế Toán (KTT)';
        changed = true;
      }
      return changed ? newT : t;
    }));
  };

  const handleRefreshTasks = async () => {
    try {
      const taskRes = await fetch('/api/tasks').then(r => r.json());
      if (Array.isArray(taskRes)) setTasks(taskRes);
    } catch (e) {
      console.error(e);
    }
  };

  // AI Assistant Call Endpoint
  const handleAISendQuery = async (prompt: string) => {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, period: selectedPeriod, companyId: selectedCompanyId })
    }).then(r => r.json());

    return res;
  };

  // AI Classifier Endpoint
  const handleAIClassifyDoc = async (fileName: string, fileSnippet: string) => {
    const res = await fetch('/api/ai/classify-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileSnippet })
    }).then(r => r.json());

    return res;
  };

  const activeCompanyObj = companies.find(c => c.id === selectedCompanyId);
  const activeTaskDetailObj = tasks.find(t => t.id === selectedTaskDetailId) || null;

  if (!currentUser) {
    return (
      <LoginScreen
        allUsers={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={activeTab}
        setCurrentTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'company-workspace') setSelectedCompanyId('ALL');
        }}
        overdueCount={tasks.filter(t => t.deadline < new Date().toISOString().split('T')[0] && t.status !== 'Hoàn thành').length}
        pendingCheckCount={tasks.filter(t => t.status === 'Chờ kiểm tra' || t.status === 'Chờ duyệt').length}
        userRole={currentRole as any}
        setUserRole={handleSetRoleAndUser}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          setSelectedCompanyId={(id) => {
            setSelectedCompanyId(id);
            if (id !== 'ALL') setActiveTab('company-workspace');
          }}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          globalFromDate={globalFromDate}
          setGlobalFromDate={setGlobalFromDate}
          globalToDate={globalToDate}
          setGlobalToDate={setGlobalToDate}
          globalQuickTag={globalQuickTag}
          setGlobalQuickTag={setGlobalQuickTag}
          onResetGlobalFilters={handleResetGlobalFilters}
          notifications={notifications}
          onOpenAIAssistant={() => setIsAIOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onOpenCompanyModal={() => {
            setEditingCompany(null);
            setIsCompanyModalOpen(true);
          }}
          onOpenDocModal={() => setActiveTab('documents')}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic View Switcher */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              companies={companies}
              tasks={tasks}
              users={users}
              notifications={notifications}
              onSelectCompany={(id) => {
                setSelectedCompanyId(id);
                setActiveTab('company-workspace');
              }}
              onSelectTask={(id) => setSelectedTaskDetailId(id)}
              onNavigateTab={setActiveTab}
              onOpenAIAssistant={() => setIsAIOpen(true)}
            />
          )}

          {activeTab === 'command-center' && (
            <CommandCenter
              tasks={tasks}
              companies={companies}
              onSelectTask={(id) => setSelectedTaskDetailId(id)}
              onSelectCompany={(id) => {
                setSelectedCompanyId(id);
                setActiveTab('company-workspace');
              }}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'companies' && (
            <CompanyList
              companies={companies}
              tasks={tasks}
              users={users}
              onSelectCompany={(id) => {
                setSelectedCompanyId(id);
                setActiveTab('company-workspace');
              }}
              onOpenCreateModal={() => {
                setEditingCompany(null);
                setIsCompanyModalOpen(true);
              }}
              onEditCompany={(comp) => {
                setEditingCompany(comp);
                setIsCompanyModalOpen(true);
              }}
              onDeleteCompany={handleDeleteCompanyClick}
              onBulkAssignStaff={handleBulkAssignStaff}
              onBulkChangeStatus={handleBulkChangeCompanyStatus}
              onSelectTask={(id) => setSelectedTaskDetailId(id)}
              onGeneratePeriodTasks={handleGeneratePeriodTasks}
            />
          )}

          {activeTab === 'company-workspace' && activeCompanyObj && (
            <CompanyWorkspace
              company={activeCompanyObj}
              tasks={tasks}
              documents={documents}
              users={users}
              auditLogs={auditLogs}
              onBack={() => {
                setSelectedCompanyId('ALL');
                setActiveTab('companies');
              }}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onOpenDocModal={() => {}}
              onSelectTask={(id) => setSelectedTaskDetailId(id)}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              companies={companies}
              users={users}
              savedFilters={savedFilters}
              globalCompanyId={selectedCompanyId}
              globalPeriod={selectedPeriod}
              globalFromDate={globalFromDate}
              globalToDate={globalToDate}
              globalQuickTag={globalQuickTag}
              onSelectTask={(id) => setSelectedTaskDetailId(id)}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onBulkChangeStatus={handleBulkChangeTaskStatus}
            />
          )}

          {activeTab === 'tax-calendar' && (
            <TaxCalendarView
              tasks={tasks}
              companies={companies}
              onSelectTask={(id) => setSelectedTaskDetailId(id)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentVault
              documents={documents}
              companies={companies}
              globalCompanyId={selectedCompanyId}
              globalPeriod={selectedPeriod}
              globalFromDate={globalFromDate}
              globalToDate={globalToDate}
              globalQuickTag={globalQuickTag}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onBulkDeleteDocuments={handleBulkDeleteDocuments}
              onBulkUpdateDocuments={handleBulkUpdateDocuments}
              onClassifyWithAI={handleAIClassifyDoc}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView
              users={users}
              tasks={tasks}
              companies={companies}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onSelectCompany={(id) => {
                setSelectedCompanyId(id);
                setActiveTab('company-workspace');
              }}
              onRefreshTasks={handleRefreshTasks}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              companies={companies}
              tasks={tasks}
              users={users}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsView
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        companies={companies}
        tasks={tasks}
        documents={documents}
        onSelectCompany={(id) => {
          setSelectedCompanyId(id);
          setActiveTab('company-workspace');
        }}
        onSelectTask={(id) => setSelectedTaskDetailId(id)}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        company={editingCompany}
        users={users}
        onSave={handleSaveCompany}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        companies={companies}
        users={users}
        onSave={handleSaveTask}
      />

      <TaskDetailModal
        isOpen={selectedTaskDetailId !== null}
        onClose={() => setSelectedTaskDetailId(null)}
        task={activeTaskDetailObj}
        users={users}
        onUpdateStatus={handleUpdateTaskStatus}
        onAddComment={handleAddComment}
        onToggleChecklist={handleToggleChecklist}
        onDeleteTask={handleDeleteTask}
      />

      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSendQuery={handleAISendQuery}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
      />

      <DeleteCompanyBackupModal
        isOpen={isDeleteBackupModalOpen}
        onClose={() => {
          setIsDeleteBackupModalOpen(false);
          setCompanyToDelete(null);
        }}
        company={companyToDelete}
        tasks={tasks}
        documents={documents}
        onConfirmDelete={handleConfirmDeleteCompany}
      />
    </div>
  );
}
