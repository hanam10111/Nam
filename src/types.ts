export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'CHIEF_ACCOUNTANT' // Kế toán trưởng
  | 'MANAGER'          // Quản lý nhóm / Kế toán tổng hợp
  | 'STAFF'            // Kế toán viên
  | 'CHECKER'          // Thực tập sinh / Trợ lý kiểm tra
  | 'CLIENT';          // Khách hàng doanh nghiệp

export interface RolePermission {
  canManageCompanies: boolean;      // Thêm/Sửa/Xóa Doanh nghiệp
  canManageUsers: boolean;          // Thêm/Sửa/Xóa Nhân sự & Phân quyền
  canApproveTaxTasks: boolean;      // Ký duyệt tờ khai, duyệt hoàn thành task
  canDeleteDocuments: boolean;      // Xóa hồ sơ / chứng từ
  canAssignTasks: boolean;          // Phân công công việc cho nhân viên khác
  canViewAllCompanies: boolean;     // Xem tất cả DN hay chỉ DN được giao
  canViewFinancialReports: boolean; // Xem báo cáo doanh thu & kiểm toán
  canApproveStaffRequests: boolean; // Duyệt đề xuất xin gia hạn/phê duyệt
}

export interface User {
  id: string;
  username?: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  position?: string; // Chức vụ: Chuyên viên thuế cao cấp, Kế toán tổng hợp, Thực tập sinh...
  specialty?: string[]; // Chuyên môn: GTGT, TNDN, TNCN, BCTC, Xuất nhập khẩu...
  teamId?: string;
  teamName?: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  assignedCompanyIds: string[];
  workloadLimit?: number; // Target max tasks
  joinDate?: string;
  notes?: string;
  permissions?: Partial<RolePermission>;
}

export type StaffRequestCategory =
  | 'Gia hạn hạn nộp/deadline'
  | 'Phê duyệt tờ khai/hồ sơ'
  | 'Đề xuất phân công lại công ty'
  | 'Hỗ trợ nghiệp vụ thuế khó'
  | 'Xin nghỉ phép/Vắng mặt'
  | 'Đề xuất thiết bị & Chi phí'
  | 'Khác';

export type StaffRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'NeedsMoreInfo';

export interface StaffRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar?: string;
  staffRole?: string;
  category: StaffRequestCategory;
  title: string;
  content: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: StaffRequestStatus;
  relatedCompanyId?: string;
  relatedCompanyName?: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  targetDate?: string; // Proposed deadline or leave date
  managerFeedback?: string;
  respondedById?: string;
  respondedByName?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  assignedCompanyIds: string[];
}

export type CompanyStatus = 'Active' | 'Suspended' | 'New' | 'Terminated';
export type ServicePackage = 'Cơ bản' | 'Standard' | 'Premium' | 'VIP Custom';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type FilingCycle = 'Month' | 'Quarter' | 'Year'; // Kỳ kê khai chính
export type VatDeclarationCycle = 'Month' | 'Quarter'; // Kê khai thuế GTGT
export type PitDeclarationCycle = 'Month' | 'Quarter' | 'None'; // Kê khai thuế TNCN
export type CitDeclarationCycle = 'Quarter' | 'Year'; // Kê khai thuế TNDN

export interface Company {
  id: string;
  code: string;           // Mã công ty (VD: CTY-ABC)
  name: string;           // Tên doanh nghiệp
  taxCode: string;        // Mã số thuế
  type: string;           // Loại hình (TNHH, Cổ phần, DNTN...)
  industry: string;       // Ngành nghề
  address: string;
  representative: string; // Người đại diện
  phone: string;
  email: string;
  status: CompanyStatus;
  startDate?: string;      // Ngày bắt đầu dịch vụ
  endDate?: string;       // Ngày kết thúc
  servicePackage: ServicePackage;
  filingCycle?: FilingCycle; // 'Month' | 'Quarter' | 'Year'
  vatCycle?: VatDeclarationCycle; // 'Month' | 'Quarter'
  pitCycle?: PitDeclarationCycle; // 'Month' | 'Quarter' | 'None'
  citCycle?: CitDeclarationCycle; // 'Quarter' | 'Year'
  fiscalYearEnd?: string; // Ví dụ: '31/12'
  assigneeIds: string[];  // Danh sách nhân viên phụ trách
  teamId?: string;
  riskScore: number;      // 0 - 100
  riskLevel: RiskLevel;
  clientHealthScore: number; // 0 - 100
  notes: string;
  tags: string[];         // Tag ví dụ: 'VIP', 'Rủi ro cao', 'Hồ sơ thiếu'
  createdAt?: string;
}

export type TaxPeriodType = 'Month' | 'Quarter' | 'Year' | 'Custom';

export interface TaxPeriod {
  id: string;
  name: string; // VD: "Tháng 09/2026", "Quý III/2026", "Năm 2026"
  type: TaxPeriodType;
  value: string; // "2026-09", "2026-Q3", "2026"
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export type TaskType = 
  | 'Thuế GTGT'
  | 'Thuế TNCN'
  | 'Thuế TNDN'
  | 'Hóa đơn điện tử'
  | 'Báo cáo tài chính'
  | 'Quyết toán thuế'
  | 'Lao động & BHXH'
  | 'Sao kê Ngân hàng'
  | 'Công nợ'
  | 'Hồ sơ pháp lý'
  | 'Khác';

export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TaskStatus = 
  | 'Chưa bắt đầu'
  | 'Đã giao'
  | 'Đang làm'
  | 'Chờ bổ sung'
  | 'Chờ kiểm tra'
  | 'Cần sửa'
  | 'Chờ duyệt'
  | 'Hoàn thành'
  | 'Khóa'
  | 'Hủy';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  requiredFile?: boolean;
  note?: string;
}

export interface Task {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  companyTaxCode: string;
  period: string; // e.g. "Tháng 09/2026" or "2026-09"
  taskType: TaskType;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  checkerId?: string;
  checkerName?: string;
  approverId?: string;
  approverName?: string;
  createdById: string;
  createdByName: string;
  createdDate: string;
  deadline: string; // YYYY-MM-DD
  completedDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completionPct: number; // 0 - 100
  checklist: ChecklistItem[];
  missingDocuments?: string[];
  notes?: string;
  comments?: TaskComment[];
  tags: string[];
  updatedAt: string;
}

export type DocumentCategory =
  | 'Hồ sơ pháp lý'
  | 'Hợp đồng'
  | 'Hóa đơn'
  | 'Bảng kê mua vào'
  | 'Bảng kê bán ra'
  | 'Sao kê ngân hàng'
  | 'Bảng lương'
  | 'Tờ khai thuế'
  | 'Giấy nộp tiền'
  | 'Báo cáo tài chính'
  | 'Tờ khai hải quan'
  | 'Hồ sơ quyết toán'
  | 'Tài liệu khác';

export interface DocumentVersion {
  version: number;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
  fileUrl?: string;
  fileContent?: string; // Text/XML or Base64 content
  originalExtension?: string;
}

export interface DocumentItem {
  id: string;
  companyId: string;
  companyName: string;
  companyCode?: string;
  period: string;
  category: DocumentCategory;
  name: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  originalExtension?: string;
  fileContent?: string; // Stored content for download (XML, CSV, JSON, base64 data URL)
  currentVersion: number;
  versions: DocumentVersion[];
  uploadedBy: string;
  uploadedAt: string;
  taskId?: string;
  taskTitle?: string;
  confidenceScore?: number; // AI classification confidence (0 - 100)
  needsConfirmation?: boolean;
  status?: 'Valid' | 'NeedsConfirmation' | 'Archived';
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
  fileAttachment?: { name: string; url: string };
  isPinned?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  entityType: 'Company' | 'Task' | 'Document' | 'User' | 'System' | 'Automation';
  entityId?: string;
  beforeState?: string;
  afterState?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deadline' | 'task' | 'document' | 'approval' | 'alert';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  targetTaskId?: string;
  targetCompanyId?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  isDefault?: boolean;
  isPinned?: boolean;
  filters: {
    companyIds?: string[];
    period?: string;
    taskTypes?: TaskType[];
    statuses?: TaskStatus[];
    assigneeIds?: string[];
    priority?: TaskPriority[];
    deadlineRange?: 'today' | 'tomorrow' | '3days' | '7days' | '30days' | 'overdue' | 'all';
    searchTerm?: string;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: 'DeadlineApproaching' | 'TaskOverdue' | 'AllDocsUploaded' | 'TaskCompleted';
  conditionDays?: number;
  action: 'NotifyAssignee' | 'NotifyManager' | 'ChangeStatus' | 'Escalate';
  targetStatus?: TaskStatus;
  active: boolean;
}

export interface ClientRequest {
  id: string;
  companyId: string;
  companyName: string;
  requesterName: string;
  requesterPhone: string;
  title: string;
  content: string;
  status: 'Pending' | 'InProcess' | 'Completed' | 'Rejected';
  deadline: string;
  assignedToName?: string;
  createdAt: string;
}

export interface FilterState {
  companyIds: string[];
  period: string;
  taskTypes: TaskType[];
  statuses: TaskStatus[];
  assigneeIds: string[];
  priority: TaskPriority[];
  deadlineRange: 'all' | 'today' | 'tomorrow' | '3days' | '7days' | '30days' | 'overdue';
  searchTerm: string;
  tag: string;
}
