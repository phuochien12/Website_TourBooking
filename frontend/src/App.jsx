import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TrangChu from './pages/TrangChu';
import ChiTietTour from './pages/ChiTietTour';
import DatTour from './pages/DatTour';
import QuanLyDonHang from './pages/QuanLyDonHang';
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy';
import LichSuDatTour from './pages/LichSuDatTour';
import TinTuc from './pages/TinTuc';
import LienHe from './pages/LienHe';
import DanhSachTour from './pages/DanhSachTour';
import QuanLyTour from './pages/QuanLyTour';
import AdminDashboard from './pages/AdminDashboard';
import LichKhoiHanhKhachHang from './pages/LichKhoiHanhKhachHang';
import QuanLyKhachHang from './pages/QuanLyKhachHang';
import QuanLyHuongDanVien from './pages/QuanLyHuongDanVien';
import QuenMatKhau from './pages/QuenMatKhau';
import HoSo from './pages/HoSo';
import YeuThich from './pages/YeuThich';
import QuanLyDanhGia from './pages/QuanLyDanhGia';



import axios from 'axios';
import LogoIcon from './components/Logo';
import ContactSpeedDial from './components/ContactSpeedDial';
import TroLyAoAI from './components/TroLyAoAI';


function App() {
    const [user, setUser] = useState(null);
    const [tours, setTours] = useState([]);
    const navigate = useNavigate();

    const [globalSearch, setGlobalSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true); // Trạng thái đóng/mở sidebar admin
    const [isScrolled, setIsScrolled] = useState(false);
    const { pathname } = useLocation();

    // Tự động cuộn lên trang trên cùng khi chuyển đường dẫn và xử lý Header trong suốt
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // Kiểm tra đăng nhập và lấy danh sách tour cho menu
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // Fetch tours để làm dropdown menu
        axios.get('/api/tours')
            .then(res => setTours(res.data))
            .catch(err => console.error("Lỗi fetch tours cho menu:", err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
        // Bỏ alert đi để tránh interrupt
    };

    const handleGlobalSearch = (e) => {
        e.preventDefault();
        // Lấy từ khóa và nhảy thẳng sang trang tìm kiếm
        if (globalSearch.trim()) {
            navigate(`/tours?diemDen=${encodeURIComponent(globalSearch.trim())}`);
        } else {
            navigate(`/tours`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Thu gọn Header: Không hiển thị trên trang Admin để tránh chồng lấn */}
            {!pathname.startsWith('/admin') && (
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-[0_2px_15px_rgba(0,0,0,0.08)] border-b border-gray-100 py-0' : 'bg-transparent py-4'}`}>
                {/* Main Nav */}
                <div className="container mx-auto px-4 flex justify-between items-center h-20">
                    <div className="flex items-center gap-6">
                        <Link to="/" onClick={() => window.scrollTo(0, 0)} className={`text-2xl font-heading font-bold flex items-center gap-1.5 transition-all duration-500 ${!isScrolled && pathname === '/' ? 'text-white' : 'text-navy'}`}>
                            <LogoIcon className="w-6 h-6 drop-shadow-md" />
                            <span className="tracking-tighter font-black uppercase">dulịch<span className="text-primary italic">việt</span></span>
                        </Link>

                        {/* Thanh tìm kiếm hiện đại (Glow & Glass) */}
                        <form onSubmit={handleGlobalSearch} className={`hidden md:flex items-center px-5 py-2 rounded-full border transition-all duration-500 w-48 lg:w-64 ${!isScrolled && pathname === '/' ? 'bg-white/10 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] backdrop-blur-[2px] focus-within:w-80 focus-within:bg-white/20 focus-within:border-white' : 'bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-primary focus-within:w-80 shadow-sm'}`}>
                            <input
                                type="text"
                                placeholder="Tìm tour..."
                                className={`bg-transparent w-full outline-none text-xs font-bold transition-all ${!isScrolled && pathname === '/' ? 'text-white placeholder:text-white/70' : 'text-navy placeholder:text-gray-400'}`}
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                            <button type="submit" className={`ml-2 transition-colors ${!isScrolled && pathname === '/' ? 'text-white hover:scale-110' : 'text-gray-500 hover:text-primary'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    <nav className="hidden lg:flex items-center h-full">
                        <ul className={`flex items-center gap-1 h-full font-bold text-[13px] uppercase tracking-tight transition-all duration-500 ${!isScrolled && pathname === '/' ? 'text-white/90' : 'text-gray-700'}`}>
                            <li><Link to="/" className="px-4 py-2 hover:text-primary transition-colors relative group">TRANG CHỦ<span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>

                            {/* TOUR MIỀN TÂY DROPDOWN */}
                            <li className="relative group/menu h-full flex items-center">
                                <Link to="/tours?diemDen=Miền Tây" className="px-4 py-5 hover:text-primary transition-colors relative flex items-center gap-1 group font-bold">
                                    TOUR MIỀN TÂY
                                    <span className="text-[10px] opacity-40 group-hover:rotate-180 transition-transform">▼</span>
                                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Link>
                                <div className="absolute top-full left-0 w-[500px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-b-2xl py-0 border-t-4 border-primary opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50 translate-y-2 group-hover/menu:translate-y-0 flex overflow-hidden">
                                    {/* Bên trái: Phân loại */}
                                    <div className="w-1/2 p-6 border-r border-gray-50 bg-gray-50/50">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Lịch trình phổ biến</h4>
                                        <div className="flex flex-col gap-1">
                                            <Link to="/tours?diemDen=Miền Tây" className="px-4 py-2.5 rounded-lg text-sm font-bold text-navy hover:bg-primary hover:text-white transition-all flex justify-between">
                                                <span>Tất cả Tour Miền Tây</span>
                                                <span className="opacity-30">→</span>
                                            </Link>
                                            <Link to="/tours?diemDen=Miền Tây&thoiGian=1 Ngày" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 1 Ngày</Link>
                                            <Link to="/tours?diemDen=Miền Tây&thoiGian=2 Ngày 1 Đêm" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 2 Ngày 1 Đêm</Link>
                                            <Link to="/tours?diemDen=Miền Tây&thoiGian=3 Ngày 2 Đêm" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 3 Ngày 2 Đêm</Link>
                                        </div>
                                    </div>
                                    {/* Bên phải: Tour gợi ý */}
                                    <div className="w-1/2 p-6 bg-white">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Gợi ý tour hot</h4>
                                        <div className="space-y-4">
                                            {tours.filter(t => t.MaLoai === 6).slice(0, 2).map(tour => (
                                                <Link key={tour.MaTour} to={`/tour/${tour.MaTour}`} className="group/item flex gap-3 items-start">
                                                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                        {tour.AnhBia ? <img src={tour.AnhBia} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" /> : <div className="w-full h-full bg-navy/10"></div>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-navy group-hover/item:text-primary line-clamp-2 leading-tight">{tour.TenTour}</span>
                                                        <span className="text-[10px] text-accent font-bold mt-1">{new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </li>

                            {/* TOUR MIỀN NAM DROPDOWN */}
                            <li className="relative group/menu h-full flex items-center">
                                <Link to="/tours?diemDen=Miền Nam" className="px-4 py-5 hover:text-primary transition-colors relative flex items-center gap-1 group font-bold">
                                    TOUR MIỀN NAM
                                    <span className="text-[10px] opacity-40 group-hover:rotate-180 transition-transform">▼</span>
                                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Link>
                                <div className="absolute top-full left-0 w-[500px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-b-2xl py-0 border-t-4 border-primary opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50 translate-y-2 group-hover/menu:translate-y-0 flex overflow-hidden">
                                    <div className="w-1/2 p-6 border-r border-gray-50 bg-gray-50/50">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Lịch trình phổ biến</h4>
                                        <div className="flex flex-col gap-1">
                                            <Link to="/tours?diemDen=Miền Nam" className="px-4 py-2.5 rounded-lg text-sm font-bold text-navy hover:bg-primary hover:text-white transition-all flex justify-between">
                                                <span>Tất cả Tour Miền Nam</span>
                                                <span className="opacity-30">→</span>
                                            </Link>
                                            <Link to="/tours?diemDen=Miền Nam&thoiGian=1 Ngày" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 1 Ngày</Link>
                                            <Link to="/tours?diemDen=Miền Nam&thoiGian=2 Ngày 1 Đêm" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 2 Ngày 1 Đêm</Link>
                                            <Link to="/tours?diemDen=Miền Nam&thoiGian=3 Ngày 2 Đêm" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 3 Ngày 2 Đêm</Link>
                                        </div>
                                    </div>
                                    <div className="w-1/2 p-6 bg-white">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Gợi ý tour hot</h4>
                                        <div className="space-y-4">
                                            {tours.filter(t => t.MaLoai === 7).slice(0, 2).map(tour => (
                                                <Link key={tour.MaTour} to={`/tour/${tour.MaTour}`} className="group/item flex gap-3 items-start">
                                                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                        {tour.AnhBia ? <img src={tour.AnhBia} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" /> : <div className="w-full h-full bg-navy/10"></div>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-navy group-hover/item:text-primary line-clamp-2 leading-tight">{tour.TenTour}</span>
                                                        <span className="text-[10px] text-accent font-bold mt-1">{new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </li>

                            {/* TOUR TRONG NƯỚC DROPDOWN */}
                            <li className="relative group/menu h-full flex items-center">
                                <Link to="/tours" className="px-4 py-5 hover:text-primary transition-colors relative flex items-center gap-1 group font-bold">
                                    TOUR TRONG NƯỚC
                                    <span className="text-[10px] opacity-40 group-hover:rotate-180 transition-transform">▼</span>
                                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Link>
                                <div className="absolute top-full left-0 w-[500px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-b-2xl py-0 border-t-4 border-primary opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50 translate-y-2 group-hover/menu:translate-y-0 flex overflow-hidden">
                                    <div className="w-1/2 p-6 border-r border-gray-50 bg-gray-50/50">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Lịch trình phổ biến</h4>
                                        <div className="flex flex-col gap-1">
                                            <Link to="/tours" className="px-4 py-2.5 rounded-lg text-sm font-bold text-navy hover:bg-primary hover:text-white transition-all flex justify-between">
                                                <span>Tất cả Tour Trong Nước</span>
                                                <span className="opacity-30">→</span>
                                            </Link>
                                            <Link to="/tours?thoiGian=1 Ngày" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 1 Ngày</Link>
                                            <Link to="/tours?thoiGian=2 Ngày 1 Đêm" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 2 Ngày 1 Đêm</Link>
                                            <Link to="/tours?thoiGian=4 Ngày 3 Đêm" className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm transition-all">Tour 4 Ngày 3 Đêm</Link>
                                        </div>
                                    </div>
                                    <div className="w-1/2 p-6 bg-white">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Gợi ý tour hot</h4>
                                        <div className="space-y-4">
                                            {tours.filter(t => t.MaLoai === 8).slice(0, 2).map(tour => (
                                                <Link key={tour.MaTour} to={`/tour/${tour.MaTour}`} className="group/item flex gap-3 items-start">
                                                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                        {tour.AnhBia ? <img src={tour.AnhBia} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" /> : <div className="w-full h-full bg-navy/10"></div>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-navy group-hover/item:text-primary line-clamp-2 leading-tight">{tour.TenTour}</span>
                                                        <span className="text-[10px] text-accent font-bold mt-1">{new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </li>

                            <li><Link to="/lich-khoi-hanh" className="px-4 py-2 hover:text-primary transition-colors relative group">LỊCH KHỞI HÀNH<span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>
                            <li><Link to="/lien-he" className="px-4 py-2 hover:text-primary transition-colors relative group">LIÊN HỆ<span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>

                            <li className="ml-4 h-8 w-[1px] bg-gray-200"></li>

                            {user ? (
                                <li className="relative group ml-4">
                                    <div className="flex items-center gap-2 cursor-pointer py-2 group/admin">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-500 ${!isScrolled && pathname === '/' ? 'bg-white/20 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] text-white' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                            {user.HoTen.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col leading-tight text-left">
                                            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${!isScrolled && pathname === '/' ? 'text-accent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-primary'}`}>
                                                {user.MaQuyen === 1 ? 'Quản trị viên' : 'Khách hàng'}
                                            </span>
                                            <span className={`font-black text-[13px] tracking-tight transition-all duration-500 ${!isScrolled && pathname === '/' ? 'text-white drop-shadow-md' : 'text-navy'}`}>
                                                {user.HoTen}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute top-full right-0 w-52 bg-[#1e293b]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-[28px] py-5 mt-4 border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0 overflow-hidden font-sans text-left">
                                        <div className="px-3 space-y-1 text-xs font-bold uppercase tracking-wider">
                                            {/* 1. Thông tin */}
                                            <Link to="/ho-so" className="flex items-center gap-4 px-5 py-3.5 rounded-[22px] hover:bg-white/5 group/item transition-all duration-300">
                                                <div className="text-white/70 group-hover/item:text-white group-hover/item:scale-110 transition-all">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <span className="text-white text-[15px] font-medium group-hover/item:translate-x-1 transition-transform">
                                                    {user.MaQuyen === 1 ? 'Thông tin Admin' : 'Thông tin'}
                                                </span>
                                            </Link>

                                            {/* 1.5 Quản trị (Chỉ cho Admin) */}
                                            {user.MaQuyen === 1 && (
                                                <Link to="/admin/bang-dieu-khien" className="flex items-center gap-4 px-5 py-3.5 rounded-[22px] hover:bg-white/5 group/item transition-all duration-300">
                                                    <div className="text-white/70 group-hover/item:text-white group-hover/item:scale-110 transition-all">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-white text-[15px] font-medium group-hover/item:translate-x-1 transition-transform">Quản trị</span>
                                                </Link>
                                            )}

                                            {/* 2. Yêu thích (Chỉ cho Thành viên) */}
                                            {user.MaQuyen !== 1 && (
                                                <Link to="/yeu-thich" className="flex items-center gap-4 px-5 py-3.5 rounded-[22px] hover:bg-white/5 group/item transition-all duration-300">
                                                    <div className="text-white/70 group-hover/item:text-white group-hover/item:scale-110 transition-all">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-white text-[15px] font-medium group-hover/item:translate-x-1 transition-transform">Yêu thích</span>
                                                </Link>
                                            )}

                                            {/* 3. Lịch sử đặt tour */}
                                            <Link to="/lich-su-dat-tour" className="flex items-center gap-4 px-5 py-3.5 rounded-[22px] hover:bg-white/5 group/item transition-all duration-300">
                                                <div className="text-white/70 group-hover/item:text-white group-hover/item:scale-110 transition-all">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-white text-[15px] font-medium group-hover/item:translate-x-1 transition-transform">Lịch sử</span>
                                            </Link>

                                            {/* 4. Đăng xuất */}
                                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-[18px] hover:bg-red-500/10 group/item transition-all duration-300 text-left">
                                                <div className="text-white/70 group-hover/item:text-red-500 group-hover/item:scale-110 transition-all">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                </div>
                                                <span className="text-white group-hover/item:text-red-500">Đăng xuất</span>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ) : (
                                <li className="ml-6 flex items-center gap-4">
                                    <Link to="/dang-nhap" className={`font-bold transition-all duration-500 ${!isScrolled && pathname === '/' ? 'text-white hover:text-accent' : 'text-navy hover:text-primary'}`}>Đăng nhập</Link>
                                    <Link to="/dang-ky" className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-teal-700 transition shadow-lg shadow-primary/20 active:scale-95">Đăng ký</Link>
                                </li>
                            )}
                        </ul>
                    </nav>

                    <button className="lg:hidden text-navy text-2xl">☰</button>
                </div>
                </header>
            )}

            {/* Nội dung thay đổi theo Route */}
            {pathname.startsWith('/admin') && user && user.MaQuyen === 1 ? (
                /* ===== LAYOUT ADMIN: Sidebar + Nội dung ===== */
                <div className="flex min-h-[calc(100vh-120px)]">
                    {/* Sidebar Admin - đóng/mở với animation */}
                    <aside className={`bg-[#1e293b] text-white flex-shrink-0 shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
                        }`}>
                        <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 flex flex-col h-full`}>
                            {/* Header sidebar: Logo + User Info */}
                            <div className="p-6 border-b border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <Link to="/" className="flex items-center gap-1.5">
                                        <LogoIcon className="w-5 h-5" />
                                        <span className="font-black text-xs tracking-tighter uppercase">dulịch<span className="text-primary">việt</span></span>
                                    </Link>
                                    <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                        ✕
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-3 py-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shadow-inner">
                                        {user.HoTen.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white font-bold text-sm truncate">{user.HoTen}</span>
                                        <span className="text-white/40 text-[10px] uppercase font-black tracking-wider group-hover:text-primary transition-colors">QUẢN TRỊ VIÊN</span>
                                    </div>
                                </div>
                            </div>
                            <nav className="py-2">
                                <Link to="/admin/bang-dieu-khien"
                                    className={`block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${pathname === '/admin/bang-dieu-khien'
                                            ? 'bg-white/10 border-yellow-400 text-yellow-300'
                                            : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30'
                                        }`}>
                                    Dashboard
                                </Link>
                                <Link to="/admin/don-hang"
                                    className={`block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${pathname === '/admin/don-hang'
                                            ? 'bg-white/10 border-yellow-400 text-yellow-300'
                                            : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30'
                                        }`}>
                                    Quản lý đơn hàng
                                </Link>
                                <Link to="/admin/quan-ly-tour"
                                    className={`block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${pathname === '/admin/quan-ly-tour'
                                            ? 'bg-white/10 border-yellow-400 text-yellow-300'
                                            : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30'
                                        }`}>
                                    Quản lý tour
                                </Link>
                                <Link to="/admin/khach-hang"
                                    className={`block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${pathname === '/admin/khach-hang'
                                            ? 'bg-white/10 border-yellow-400 text-yellow-300'
                                            : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30'
                                        }`}>
                                    Quản lý khách hàng
                                </Link>
                                <Link to="/admin/huong-dan-vien"
                                    className={`block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${pathname === '/admin/huong-dan-vien'
                                            ? 'bg-white/10 border-yellow-400 text-yellow-300'
                                            : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30'
                                        }`}>
                                    Hướng dẫn viên
                                </Link>
                                <Link to="/admin/quan-ly-danh-gia"
                                    className={`block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${pathname === '/admin/quan-ly-danh-gia'
                                            ? 'bg-white/10 border-yellow-400 text-yellow-300'
                                            : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30'
                                        }`}>
                                    Quản lý đánh giá
                                </Link>


                                <div className="mt-auto px-4 py-6 border-t border-white/5 space-y-2">
                                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group">
                                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Trang chủ khách
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-red-500/80 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Nội dung Admin */}
                    <main className="flex-1 bg-gray-100 overflow-auto">
                        {/* Nút mở sidebar khi đã đóng */}
                        {!sidebarOpen && (
                            <div className="flex items-center gap-4 bg-white p-4 shadow-sm border-b border-gray-200">
                                <button onClick={() => setSidebarOpen(true)} className="px-4 py-2 bg-[#1e293b] text-white rounded-xl hover:bg-[#334155] transition-all duration-200 text-xs font-bold shadow-lg shadow-navy/20 flex items-center gap-2">
                                    <span>☰</span> MENU QUẢN LÝ
                                </button>
                                <div className="h-4 w-[1px] bg-gray-300"></div>
                                <span className="text-xs font-black text-navy/40 uppercase tracking-widest">Hệ thống quản trị du lịch việt</span>
                            </div>
                        )}
                        <Routes>
                            <Route path="/admin/bang-dieu-khien" element={<AdminDashboard />} />
                            <Route path="/admin/don-hang" element={<QuanLyDonHang />} />
                            <Route path="/admin/quan-ly-tour" element={<QuanLyTour />} />
                            <Route path="/admin/khach-hang" element={<QuanLyKhachHang />} />
                            <Route path="/admin/huong-dan-vien" element={<QuanLyHuongDanVien />} />
                            <Route path="/admin/quan-ly-danh-gia" element={<QuanLyDanhGia />} />

                        </Routes>
                    </main>
                </div>
            ) : (
                /* ===== LAYOUT KHÁCH HÀNG: Bình thường ===== */
                <div className={pathname === '/' ? '' : 'pt-24'}>
                    <Routes>
                        <Route path="/" element={<TrangChu />} />
                        <Route path="/tours" element={<DanhSachTour />} />
                        <Route path="/tour/:id" element={<ChiTietTour />} />
                        <Route path="/dat-tour/:id" element={<DatTour />} />
                        <Route path="/dang-nhap" element={<DangNhap />} />
                        <Route path="/dang-ky" element={<DangKy />} />
                        <Route path="/lich-su-dat-tour" element={<LichSuDatTour />} />
                        <Route path="/tin-tuc" element={<TinTuc />} />
                        <Route path="/lien-he" element={<LienHe />} />
                        <Route path="/lich-khoi-hanh" element={<LichKhoiHanhKhachHang />} />
                        <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
                        <Route path="/ho-so" element={<HoSo />} />
                        <Route path="/yeu-thich" element={<YeuThich />} />
                        <Route path="/yeu_thich" element={<YeuThich />} />


                        {/* Route Admin - chặn nếu không phải admin */}
                        <Route path="/admin/*" element={
                            <div className="text-center py-20 text-red-500 font-bold">Bạn không có quyền truy cập trang này!</div>
                        } />
                    </Routes>
                </div>
            )}

            {/* Footer dùng chung (Phong cách chuyên nghiệp, nền tối) */}
            <footer className="bg-[#1e3a5f] text-white pt-16 pb-8">
                <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Cột 1: Thông tin */}
                    <div>
                        <h4 className="font-heading font-bold text-[#c9a96e] text-lg mb-6 uppercase tracking-widest">Liên Hệ</h4>
                        <div className="space-y-4 text-sm text-gray-300">
                            <p><strong className="text-white">Địa Chỉ: </strong>273 Nguyễn Văn Linh, Q. Bình Thủy, TP. Cần Thơ</p>
                            <p><strong className="text-white">Hotline: </strong><span className="text-[#c9a96e] text-xl font-bold">0354 858 892</span></p>
                            <p><strong className="text-white">Email: </strong>phuochien847@gmail.com</p>
                        </div>
                    </div>

                    {/* Cột 2: Menu */}
                    <div>
                        <h4 className="font-heading font-bold text-[#c9a96e] text-lg mb-6 uppercase tracking-widest">Chúng Tôi</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="text-gray-300 hover:text-[#c9a96e] transition-all">Trang chủ</Link></li>
                            <li><Link to="/tin-tuc" className="text-gray-300 hover:text-[#c9a96e] transition-all">Giới Thiệu</Link></li>
                            <li><Link to="/lien-he" className="text-gray-300 hover:text-[#c9a96e] transition-all">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Cột 3: Dịch vụ */}
                    <div>
                        <h4 className="font-heading font-bold text-[#c9a96e] text-lg mb-6 uppercase tracking-widest">Tour Du Lịch</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/tours?diemDen=Miền Tây" className="text-gray-300 hover:text-[#c9a96e] transition-all">Tour Miền Tây</Link></li>
                            <li><Link to="/tours?diemDen=Miền Nam" className="text-gray-300 hover:text-[#c9a96e] transition-all">Tour Miền Nam</Link></li>
                            <li><Link to="/tours" className="text-gray-300 hover:text-[#c9a96e] transition-all">Tour Trong Nước</Link></li>
                        </ul>
                    </div>

                    {/* Cột 4: Bản đồ */}
                    <div>
                        <h4 className="font-heading font-bold text-[#c9a96e] text-lg mb-6 uppercase tracking-widest">Bản Đồ</h4>
                        <div className="rounded-xl overflow-hidden h-40 border border-white/10">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8471!2d105.74069!3d10.05088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjczIE5ndXnhu4VuIFbEg24gTGluaCwgTG9uZyBUdXnhu4VuLCBCw6xuaCBUaOG7p3ksIEPhuqduIFRoxqE!5e0!3m2!1svi!2svn!4v1710630000000!5m2!1svi!2svn"
                                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Map"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-16 pt-8 text-center text-xs text-gray-400">
                    <p>© 2026 <strong className="text-[#c9a96e]">Huỳnh Phước Hiền</strong>. Thiết kế bởi Sinh Viên CS2.</p>
                </div>
            </footer>
            
            {/* Thanh nút liên hệ nổi */}
            <ContactSpeedDial />

            {/* Trợ lý ảo AI thông minh */}
            <TroLyAoAI />
        </div>
    )
}

export default App
