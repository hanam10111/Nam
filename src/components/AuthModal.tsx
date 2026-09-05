import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  KeyRound, 
  Users, 
  Building2, 
  Check, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLoginSuccess: (user: UserType) => void;
  allUsers: UserType[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  allUsers
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'quick-switch' | 'roles-matrix'>('quick-switch');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc email');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAs = (user: UserType) => {
    onLoginSuccess(user);
    onClose();
  };

  const roleBadgeMap: Record<UserRole, { label: string; bg: string; text: string; desc: string }> = {
    'SUPER_ADMIN': { label: 'Super Admin', bg: 'bg-red-100', text: 'text-red-700', desc: 'Toàn quyền cấu hình, quản trị người dùng, xóa hồ sơ & hệ thống' },
    'CHIEF_ACCOUNTANT': { label: 'Kế Toán Trưởng', bg: 'bg-purple-100', text: 'text-purple-700', desc: 'Ký số tờ khai, kiểm soát rủi ro, phân bổ việc, duyệt đề xuất' },
    'MANAGER': { label: 'Trưởng Nhóm / KTTH', bg: 'bg-blue-100', text: 'text-blue-700', desc: 'Giám sát tiến độ nhóm thuế, soát xét bảng kê, phân công việc' },
    'STAFF': { label: 'Kế Toán Viên', bg: 'bg-emerald-100', text: 'text-emerald-700', desc: 'Thu thập chứng từ, lập bảng kê & dự thảo tờ khai thuế GTGT, TNCN' },
    'CHECKER': { label: 'Trợ Lý / TTS', bg: 'bg-amber-100', text: 'text-amber-700', desc: 'Nhập liệu chứng từ, đối chiếu hóa đơn hợp lệ CQT, hỗ trợ nộp hồ sơ' },
    'ADMIN': { label: 'Quản Trị Viên', bg: 'bg-slate-100', text: 'text-slate-700', desc: 'Quản lý tài khoản và thiết lập vận hành' },
    'CLIENT': { label: 'Khách Hàng', bg: 'bg-slate-100', text: 'text-slate-400', desc: '' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Đăng Nhập & Phân Quyền Nhân Viên
                <span className="text-[11px] bg-blue-500/30 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">RBAC Security</span>
              </h2>
              <p className="text-xs text-slate-300">
                Chuyển đổi linh hoạt giữa các tài khoản nhân viên hoặc đăng nhập bằng tài khoản riêng biệt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current logged-in user summary bar */}
        {currentUser && (
          <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-slate-500 font-medium">Đang đăng nhập:</span>
              <img src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775?w=150"} alt="" className="w-5 h-5 rounded-full object-cover" />
              <strong className="text-slate-900 font-semibold">{currentUser.fullName}</strong>
              <span className="text-slate-500">(@{currentUser.username || currentUser.email})</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${roleBadgeMap[currentUser.role]?.bg || 'bg-slate-200'} ${roleBadgeMap[currentUser.role]?.text || 'text-slate-800'}`}>
                {roleBadgeMap[currentUser.role]?.label || currentUser.role}
              </span>
            </div>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã xác thực
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-medium">
          <button
            id="tab-quick-switch"
            onClick={() => setActiveTab('quick-switch')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'quick-switch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Chọn Nhanh Tài Khoản Nhân Viên ({allUsers.length})
          </button>
          <button
            id="tab-manual-login"
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Đăng Nhập Bằng Mật Khẩu
          </button>
          <button
            id="tab-roles-matrix"
            onClick={() => setActiveTab('roles-matrix')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'roles-matrix'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Ma Trận Phân Quyền (RBAC)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: QUICK SWITCH ACCOUNTS */}
          {activeTab === 'quick-switch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Danh Sách Tài Khoản Đã Phân Quyền Sẵn</h3>
                  <p className="text-xs text-slate-500">Nhấp vào nút "Đăng nhập" để trải nghiệm quyền hạn và giao diện của từng vị trí</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono font-medium">
                  {allUsers.filter(u => u.role !== 'CLIENT').length} tài khoản
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allUsers.filter(u => u.role !== 'CLIENT').map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const roleInfo = roleBadgeMap[u.role] || { label: u.role, bg: 'bg-slate-100', text: 'text-slate-700', desc: '' };
                  
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={u.avatar || "https://images.unsplash.com/photo-1534528741775?w=150"}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{u.fullName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${roleInfo.bg} ${roleInfo.text}`}>
                              {roleInfo.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{u.position || u.email}</p>
                          
                          {/* Credentials info */}
                          <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono bg-white/80 px-2 py-1 rounded border border-slate-200/80">
                            <span className="text-slate-500">User: <strong className="text-blue-700">{u.username || u.email.split('@')[0]}</strong></span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">Pass: <strong className="text-slate-700">{u.password || '123456'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[11px] text-slate-500 italic truncate max-w-[200px]">
                          {roleInfo.desc}
                        </p>
                        {isCurrent ? (
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đang dùng
                          </span>
                        ) : (
                          <button
                            id={`btn-login-user-${u.id}`}
                            onClick={() => handleQuickLoginAs(u)}
                            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                          >
                            Đăng nhập <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL LOGIN */}
          {activeTab === 'login' && (
            <div className="max-w-md mx-auto py-4">
              <form onSubmit={handleManualLogin} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên đăng nhập / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="login-username-input"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ví dụ: admin, ktt, ktth, ktv, tts, khachhang..."
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Gợi ý: admin, ktt, ktth, ktv, tts, khachhang</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Mật khẩu mẫu: admin123, ktt123, ktth123, ktv123, tts123, khach123</p>
                </div>

                <button
                  id="btn-submit-manual-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang xác thực...' : 'Xác Nhận Đăng Nhập'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
          {activeTab === 'roles-matrix' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bảng Ma Trận Phân Quyền Chi Tiết (RBAC Matrix)</h3>
                <p className="text-xs text-slate-500">Chi tiết các quyền hạn được gán cho từng vị trí nhân sự trong hệ thống AccuTax</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-2.5">Quyền hạn hệ thống</th>
                      <th className="p-2.5 text-center bg-red-50 text-red-700">Admin</th>
                      <th className="p-2.5 text-center bg-purple-50 text-purple-700">KTT</th>
                      <th className="p-2.5 text-center bg-blue-50 text-blue-700">KTTH</th>
                      <th className="p-2.5 text-center bg-emerald-50 text-emerald-700">KTV</th>
                      <th className="p-2.5 text-center bg-amber-50 text-amber-700">TTS/Trợ lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">1. Quản lý Doanh nghiệp (Thêm/Sửa/Xóa)</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">2. Phê duyệt & Ký số Tờ khai thuế</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">3. Phân công công việc (Task Assignment)</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">4. Lập bảng kê, dự thảo tờ khai & checklist</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">5. Xóa hồ sơ trong Kho Document Vault</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">6. Quản lý tài khoản & phân quyền (RBAC)</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">7. Duyệt đề xuất xin gia hạn / nghỉ phép</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                      <td className="p-2.5 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">8. Tra cứu tiến độ thuế & Tải tờ khai</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Hệ thống AccuTax Enterprise RBAC v2.5
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
