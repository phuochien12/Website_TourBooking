import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LogoIcon from '../components/Logo';

function QuenMatKhau() {
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đổi mật khẩu
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Bước 1: Gửi yêu cầu lấy OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/forgot-password', { Email: email });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Đã gửi mã!',
                    text: res.data.message,
                    timer: 2000,
                    showConfirmButton: false,
                    popup: 'rounded-[24px]'
                });
                setStep(2);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: err.response?.data?.message || 'Có lỗi xảy ra',
                confirmButtonColor: '#003c71'
            });
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Xác thực mã OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/verify-otp', { Email: email, OTP: otp });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Mã xác thực chính xác!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setStep(3);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi OTP',
                text: err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn',
                confirmButtonColor: '#003c71'
            });
        } finally {
            setLoading(false);
        }
    };

    // Bước 3: Đặt lại mật khẩu mới
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return Swal.fire({ icon: 'warning', title: 'Chú ý', text: 'Mật khẩu nhập lại không khớp!' });
        }
        setLoading(true);
        try {
            const res = await axios.post('/api/reset-password', { 
                Email: email, 
                OTP: otp, 
                MatKhauMoi: newPassword 
            });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Hoàn tất!',
                    text: 'Mật khẩu của bạn đã được cập nhật thành công.',
                    confirmButtonColor: '#16a34a'
                }).then(() => {
                    navigate('/dang-nhap');
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: err.response?.data?.message || 'Không thể đổi mật khẩu lúc này',
                confirmButtonColor: '#003c71'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 py-20 relative overflow-hidden font-sans">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-navy/5 p-8 md:p-10 border border-gray-100 relative z-10 animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gray-100 border border-gray-50">
                        <LogoIcon className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-black text-navy uppercase tracking-tight">
                        {step === 1 ? 'Quên mật khẩu' : step === 2 ? 'Xác thực OTP' : 'Mật khẩu mới'}
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                        {step === 1 ? 'Nhập email để nhận mã xác thực đặt lại mật khẩu' 
                        : step === 2 ? `Mã xác thực đã được gửi đến ${email}` 
                        : 'Thiết lập mật khẩu mới cho tài khoản của bạn'}
                    </p>
                </div>

                {/* Bước 1: NHẬP EMAIL */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-black text-navy uppercase tracking-widest mb-2 ml-1">Email tài khoản</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-navy"
                                placeholder="example@gmail.com"
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-navy transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                        </button>
                    </form>
                )}

                {/* Bước 2: NHẬP OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-black text-navy uppercase tracking-widest mb-2 ml-1">Mã xác thực (6 số)</label>
                            <input 
                                type="text" 
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-black text-navy text-center text-2xl tracking-[10px]"
                                placeholder="000000"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <button 
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-navy transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Đang kiểm tra...' : 'Xác nhận mã'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-navy transition-colors"
                            >
                                Quay lại nhập Email
                            </button>
                        </div>
                    </form>
                )}

                {/* Bước 3: ĐỔI MẬT KHẨU */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-navy uppercase tracking-widest mb-2 ml-1">Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    required
                                    minLength="6"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-navy uppercase tracking-widest mb-2 ml-1">Xác nhận mật khẩu</label>
                                <input 
                                    type="password" 
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-navy transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-green-600/20"
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-gray-50 pt-6">
                    <Link to="/dang-nhap" className="text-gray-400 font-bold text-[11px] uppercase tracking-widest hover:text-primary transition-colors">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            ` }} />
        </div>
    );
}

export default QuenMatKhau;
