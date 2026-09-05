import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  ArrowRight,
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface LoginScreenProps {
  allUsers: UserType[];
  onLoginSuccess: (user: UserType) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  allUsers,
  onLoginSuccess
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (err: any) {
      setErrorMsg(err.message || 'Tài khoản hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillCredentials = (user: UserType) => {
    setUsernameInput(user.username || '');
    setPasswordInput(user.password || '123456');
    setErrorMsg('');
  };

  const roleBadgeMap: Record<UserRole, { label: string; bg: string; text: string; desc: string }> = {
    'SUPER_ADMIN': { label: 'Super Admin / Giám đốc', bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', desc: 'Toàn quyền điều hành tối cao, cấu hình, quản trị người dùng & reset dữ liệu' },
    'CHIEF_ACCOUNTANT': { label: 'Kế Toán Trưởng', bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', desc: 'Ký số nộp tờ khai, kiểm soát rủi ro, phân phối công việc, duyệt đề xuất' },
    'MANAGER': { label: 'Trưởng Nhóm / KTTH', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', desc: 'Giám sát tiến độ kê khai của nhóm, kiểm tra bảng kê mua vào bán ra' },
    'STAFF': { label: 'Chuyên Viên Thuế', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', desc: 'Nhận bàn giao doanh nghiệp, thu thập hóa đơn, lập bảng kê & dự thảo tờ khai' },
    'CHECKER': { label: 'Trợ Lý / Thực Tập Sinh', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', desc: 'Nhập liệu chứng từ, hóa đơn hợp lệ CQT, phụ tá nộp hồ sơ' },
    'ADMIN': { label: 'Quản Trị Viên', bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-700', desc: 'Quản trị hệ thống và vận hành' },
    'CLIENT': { label: 'Khách Hàng', bg: 'bg-slate-50 text-slate-500', text: 'text-slate-500', desc: '' }
  };

  const filteredUsers = allUsers.filter(u => u.role !== 'CLIENT');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background blobs for luxury look */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="mt-6 text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          AccuTax Enterprise
          <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full tracking-wider shrink-0">v2.5</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Hệ thống Quản lý Kế toán & Kê khai Thuế Đa Doanh nghiệp Chuyên nghiệp
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        
        {/* Manual Login Form */}
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 w-full">
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                Đăng nhập hệ thống AccuTax
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Sử dụng tên đăng nhập hoặc email được cấp để truy cập vào hệ thống làm việc</p>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên đăng nhập / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="login-screen-username"
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="VD: hanam10111@gmail.com, admin, ktt..."
                    className="w-full text-xs pl-9 pr-3 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="login-screen-password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-10 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-blue-500" defaultChecked />
                  <span>Duy trì đăng nhập</span>
                </label>
                <a href="#forgot" className="hover:text-blue-400 font-medium transition-colors">Quên mật khẩu?</a>
              </div>

              <button
                id="btn-login-screen-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-[10px] text-slate-500">
            Hệ thống quản lý dịch vụ kế toán chuyên nghiệp &bull; AccuTax Enterprise RBAC Security
          </div>
        </div>

      </div>
    </div>
  );
};
