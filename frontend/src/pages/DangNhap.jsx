import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LogoIcon from '../components/Logo';

function DangNhap() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);

        axios.post('/api/dang-nhap', { Email: email, MatKhau: password })
            .then(res => {
                if (res.data.success) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'Đăng nhập thành công!', 
                        text: `Chào mừng ${res.data.user.HoTen} quay trở lại!`, 
                        timer: 1500, 
                        showConfirmButton: false,
                        background: '#fff',
                        customClass: {
                            title: 'font-black uppercase tracking-tight text-navy',
                            popup: 'rounded-[24px]'
                        }
                    });

                    setTimeout(() => {
                        if (res.data.user.MaQuyen === 1) {
                            navigate('/admin/don-hang');
                        } else {
                            navigate('/');
                        }
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Thất bại',
                    text: err.response?.data?.message || "Email hoặc mật khẩu không đúng!",
                    confirmButtonColor: '#003c71'
                });
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 py-20 relative overflow-hidden font-sans">
            {/* Trang trí nền */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-navy/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2"></div>

            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-navy/5 p-8 md:p-10 border border-gray-100 relative z-10 animate-fadeIn">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gray-100 border border-gray-50">
                        <LogoIcon className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-navy uppercase tracking-tighter">Đăng nhập ngay</h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Khám phá vạn hành trình cùng Du Lịch Việt</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                        <label className="block text-[11px] font-black text-navy uppercase tracking-widest ml-1">Email của bạn</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-navy"
                            placeholder="example@gmail.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block text-[11px] font-black text-navy uppercase tracking-widest">Mật khẩu</label>
                            <Link to="/quen-mat-khau" className="text-[10px] font-bold text-primary uppercase hover:underline tracking-tighter">Quên mật khẩu?</Link>
                        </div>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-navy/10 disabled:opacity-70"
                    >
                        {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
                    </button>
                </form>

                <div className="mt-10 text-center space-y-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Chưa có tài khoản? <Link to="/dang-ky" className="text-primary hover:underline">Tham gia ngay</Link>
                    </p>
                    <div className="pt-4 border-t border-gray-50">
                        <Link to="/" className="text-gray-300 hover:text-navy text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            <span>←</span> Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            ` }} />
        </div>
    );
}

export default DangNhap;
