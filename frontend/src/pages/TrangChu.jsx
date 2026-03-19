import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function TrangChu() {
    const [tours, setTours] = useState([]);
    const [wishlist, setWishlist] = useState([]); // [MỚI] Lưu MaTour của các tour đã thích
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    // State cho banner động
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = [
        "/images/banner1.jpg",
        "/images/da-nang.jpg",
        "/images/banner3.jpg",
        "/images/ha-long.jpg",
        "/images/banner5.jpg"
    ];

    // Tạo hiệu ứng đổi banner tự động sau mỗi 5s
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // State lưu giá trị tìm kiếm trên thanh search
    const [searchForm, setSearchForm] = useState({
        diemDi: '',
        diemDen: '',
        mucGia: ''
    });

    // Lấy toàn bộ tours và chia ra các mục
    useEffect(() => {
        axios.get('/api/tours')
            .then(res => setTours(res.data))
            .catch(err => console.error("Lỗi:", err));

        // [MỚI] Lấy danh sách tour đã thích nếu có đăng nhập
        if (user) {
            axios.get(`/api/wishlist/check/${user.MaNguoiDung}`)
                .then(res => setWishlist(res.data))
                .catch(err => console.error("Lỗi fetch wishlist:", err));
        }
    }, []);

    // [MỚI] Hàm xử lý yêu thích/bỏ yêu thích
    const handleToggleWishlist = async (e, tourId) => {
        e.preventDefault(); // Ngăn chuyển hướng khi click tim
        e.stopPropagation();

        if (!user) {
            return navigate('/dang-nhap');
        }

        try {
            const res = await axios.post('/api/wishlist/toggle', {
                MaNguoiDung: user.MaNguoiDung,
                MaTour: tourId
            });
            if (res.data.success) {
                if (res.data.isFavorite) {
                    setWishlist([...wishlist, tourId]);
                } else {
                    setWishlist(wishlist.filter(id => id !== tourId));
                }
            }
        } catch (err) {
            console.error("Lỗi toggle wishlist:", err);
        }
    };

    // Hàm xử lý khi user bấm nút "Tìm kiếm"
    const handleSearch = (e) => {
        e.preventDefault();
        const query = new URLSearchParams(searchForm).toString();
        navigate(`/tours?${query}`);
    };

    const toursNoiBat = tours.slice(0, 6);
    const toursBanChay = tours.slice(6, 12);

    // Lọc theo danh mục MaLoai (6: Miền Tây, 7: Miền Nam, 8: Trong Nước)
    const toursMienTay = tours.filter(t => t.MaLoai === 6).slice(0, 6);
    const toursMienNam = tours.filter(t => t.MaLoai === 7).slice(0, 6);
    const toursTrongNuoc = tours.filter(t => t.MaLoai === 8).slice(0, 6);

    // Component hiển thị thẻ tour
    const TourCard = ({ tour, badgeText, badgeColor }) => {
        const hasDiscount = tour.PhanTramGiamGia && tour.PhanTramGiamGia > 0;
        const salePrice = hasDiscount ? tour.GiaGoc * (1 - tour.PhanTramGiamGia / 100) : tour.GiaGoc;

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover-card-effect group flex flex-col h-full">
                {/* Khung ảnh có hiệu ứng hover zoom */}
                <Link to={`/tour/${tour.MaTour}`} className="relative overflow-hidden block h-56">
                    {tour.AnhBia ? (
                        <img src={tour.AnhBia} alt={tour.TenTour} className="w-full h-full object-cover hover-zoom-img" />
                    ) : (
                        <div className={`h-full w-full flex items-center justify-center text-white text-xl font-bold px-4 text-center bg-navy`}>
                            {tour.TenTour ? tour.TenTour.split(':').shift() : `Tour #${tour.MaTour}`}
                        </div>
                    )}
                    
                    {/* Tag giảm giá & Loại */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${badgeColor || 'bg-secondary'} shadow-sm`}>
                            {badgeText || 'Hot'}
                        </span>
                        {hasDiscount && (
                            <span className="bg-white text-secondary px-2 py-1 rounded-md text-[11px] font-black shadow-sm">
                                -{tour.PhanTramGiamGia}%
                            </span>
                        )}
                    </div>

                    {/* Nút yêu thích kiểu mới */}
                    {user && user.MaQuyen !== 1 && (
                        <button 
                            onClick={(e) => handleToggleWishlist(e, tour.MaTour)}
                            className={`absolute top-4 right-4 w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center group/heart active:scale-90
                                ${wishlist.includes(tour.MaTour) 
                                    ? 'bg-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-heartPop' 
                                    : 'bg-transparent hover:scale-110'}`}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-6 w-6 transition-all duration-300 ${wishlist.includes(tour.MaTour) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`} 
                                fill={wishlist.includes(tour.MaTour) ? "currentColor" : "none"}
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                                strokeWidth={wishlist.includes(tour.MaTour) ? 0 : 2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    )}

                    <div className="absolute bottom-3 left-4">
                        <span className="bg-navy/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-semibold">
                            {tour.ThoiGian || '3 Ngày 2 Đêm'}
                        </span>
                    </div>
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-[17px] font-bold mb-3 text-navy group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
                        <Link to={`/tour/${tour.MaTour}`}>{tour.TenTour}</Link>
                    </h3>

                    <div className="space-y-2 mb-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="text-primary italic">📍</span>
                            <span className="uppercase text-[11px] font-semibold tracking-wide">{tour.DiemKhoiHanh || 'Cần Thơ'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary opacity-70">📅</span>
                            <span>Khởi hành: <span className="text-gray-700 font-medium">Hàng tuần</span></span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                        <div className="flex flex-col">
                            {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                    {new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ
                                </span>
                            )}
                            <span className="text-xl font-bold text-accent">
                                {new Intl.NumberFormat('vi-VN').format(salePrice)}<small className="text-sm font-medium ml-0.5">đ</small>
                            </span>
                        </div>
                        <Link to={`/tour/${tour.MaTour}`} className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all">
                            Chi tiết →
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Banner chính theo kiểu slider mới */}
            <div
                className="relative text-white pt-40 pb-48 bg-cover bg-center overflow-hidden h-[650px] transition-all duration-1000"
                style={{ backgroundImage: `url('${banners[currentBanner]}')` }}
            >
                {/* Overlay để gradient giúp dễ đọc chữ */}
                <div className="absolute inset-0 bg-navy/40"></div>

                <div className="relative z-10 container mx-auto px-6 md:px-16 flex flex-col items-start justify-center h-full pt-20">
                    <div className="w-full animate-fade-in-up">
                        {/* Phần chữ bên trái */}
                        <div className="max-w-2xl text-left mb-12">
                            <p className="font-heading italic text-accent text-xl mb-4 tracking-[0.15em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-bold">Hành trình của bạn bắt đầu từ đây</p>
                            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 leading-tight">
                                Khám Phá Vẻ Đẹp <br /> 
                                <span className="text-accent underline decoration-primary decoration-4 underline-offset-8">Ba Miền</span> Việt Nam
                            </h1>
                            <p className="text-lg opacity-90 max-w-lg leading-relaxed mb-10">
                                Trải nghiệm những chuyến đi tuyệt vời nhất cùng đội ngũ tận tâm và dịch vụ chuẩn mực.
                            </p>
                            
                            {/* Nút Đặt Tour Ngay - Đưa về lề trái */}
                            <Link to="/tours" className="inline-block bg-primary hover:bg-teal-700 text-white shadow-2xl px-12 py-5 rounded-[32px] font-bold text-lg transition-all hover:-translate-y-1 whitespace-nowrap min-w-[220px] text-center">
                                Đặt Tour Ngay →
                            </Link>
                        </div>
                        
                        {/* Thanh Tìm Kiếm Ngang - Căn Giữa Màn Hình */}
                        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                            {/* Dots chuyển banner - Đưa lên trên khung tìm kiếm */}
                            <div className="flex space-x-2.5 mb-6">
                                {banners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentBanner(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${currentBanner === idx ? 'bg-accent w-10' : 'bg-white/40 w-2.5 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>

                            <div className="bg-white/20 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-1.5 border border-white/40 w-full">
                                <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center">
                                    {/* ĐIỂM ĐẾN */}
                                    <div className="flex-[1.2] w-full group relative flex items-center gap-3 px-5 py-3 border-b md:border-b-0 md:border-r border-white/20 hover:bg-white/10 first:rounded-l-[32px]">
                                        <div className="text-accent drop-shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col flex-1 text-left">
                                            <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.15em] mb-0.5">Điểm đến</label>
                                            <input
                                                list="destinations"
                                                placeholder="Tìm điểm đến..."
                                                className="bg-transparent outline-none font-extrabold text-white placeholder:text-white/50 w-full text-sm"
                                                value={searchForm.diemDen}
                                                onChange={(e) => setSearchForm({ ...searchForm, diemDen: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* KHỞI HÀNH */}
                                    <div className="flex-[1.1] w-full group relative flex items-center gap-3 px-5 py-3 border-b md:border-b-0 md:border-r border-white/20 hover:bg-white/10">
                                        <div className="text-accent drop-shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.15em] mb-0.5 text-left">Khởi hành</label>
                                            <input
                                                list="departures"
                                                placeholder="Nơi bắt đầu..."
                                                className="bg-transparent outline-none font-extrabold text-white placeholder:text-white/50 w-full text-sm"
                                                value={searchForm.diemDi}
                                                onChange={(e) => setSearchForm({ ...searchForm, diemDi: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* KHOẢNG GIÁ */}
                                    <div className="flex-1 w-full group relative flex items-center gap-3 px-5 py-3 hover:bg-white/10">
                                        <div className="text-accent drop-shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.15em] mb-0.5 text-left">Khoảng giá</label>
                                            <select
                                                className="bg-transparent outline-none font-extrabold text-white appearance-none w-full cursor-pointer text-sm"
                                                value={searchForm.mucGia}
                                                onChange={(e) => setSearchForm({ ...searchForm, mucGia: e.target.value })}
                                            >
                                                <option value="" className="bg-[#1e293b] text-white">Tất cả</option>
                                                <option value="duoi5" className="bg-[#1e293b] text-white">Dưới 5tr</option>
                                                <option value="5-10" className="bg-[#1e293b] text-white">5-10tr</option>
                                                <option value="tren10" className="bg-[#1e293b] text-white">Trên 10tr</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* NÚT TÌM KIẾM */}
                                    <div className="p-1">
                                        <button type="submit" className="h-11 w-11 bg-primary hover:bg-accent text-white hover:text-navy rounded-[22px] shadow-xl transition-all active:scale-95 flex items-center justify-center group/btn border border-white/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>





            {/* datalists remains for functionality */}
            <datalist id="destinations">
                <option value="Miền Tây" />
                <option value="Miền Nam" />
                <option value="Trong Nước" />
            </datalist>
            <datalist id="departures">
                <option value="Cần Thơ" />
                <option value="TP. Hồ Chí Minh" />
                <option value="Hà Nội" />
            </datalist>

            <div className="container mx-auto px-4 md:px-8">
                {/* --- MỤC 1: TOUR NỔI BẬT --- */}
                {toursNoiBat.length > 0 && (
                    <div className="mb-24 mt-24">
                        <div className="text-center mb-12">
                            <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3">Gợi ý tốt nhất</p>
                            <h2 className="text-4xl font-heading font-bold text-navy uppercase">
                                Tour Nổi Bật Chào Hè
                            </h2>
                            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {toursNoiBat.map(tour => (
                                <TourCard key={tour.MaTour} tour={tour} badgeText="Nổi Bật" badgeColor="bg-accent" />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/tours" className="inline-flex items-center gap-2 text-navy hover:text-primary font-bold border-b-2 border-transparent hover:border-primary transition-all pb-1 tracking-wide uppercase text-sm">
                                Xem tất cả hành trình <span>→</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* --- BANNER DỊCH VỤ (Kiểu tối giản sang trọng theo ảnh mẫu) --- */}
                <div className="bg-[#faf9f7] rounded-xl py-10 px-4 mb-20 shadow-sm border border-gray-100/50">
                    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-x divide-gray-200">
                        <div className="flex items-center justify-center gap-4 px-2 hover:scale-105 transition-transform cursor-default">
                            <span className="text-3xl text-navy opacity-80">🏅</span>
                            <span className="text-navy font-bold text-lg tracking-tight">Chất lượng</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 px-2 hover:scale-105 transition-transform cursor-default">
                            <span className="text-3xl text-navy opacity-80">🏷️</span>
                            <span className="text-navy font-bold text-lg tracking-tight">Giá tốt</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 px-2 hover:scale-105 transition-transform cursor-default">
                            <span className="text-3xl text-navy opacity-80">👨‍✈️</span>
                            <span className="text-navy font-bold text-lg tracking-tight">HDV chuyên nghiệp</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 px-2 hover:scale-105 transition-transform cursor-default">
                            <span className="text-3xl text-navy opacity-80">🛡️</span>
                            <span className="text-navy font-bold text-lg tracking-tight">An toàn</span>
                        </div>
                    </div>
                </div>

                {/* --- MỤC 2: TOUR BÁN CHẠY --- */}
                {toursBanChay.length > 0 && (
                    <div className="mb-16">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-[#003c71] uppercase border-b-2 border-gray-100 pb-4">
                                TOUR BÁN CHẠY
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {toursBanChay.map(tour => (
                                <TourCard key={tour.MaTour} tour={tour} badgeText="Bán Chạy" badgeColor="bg-[#ec1276]" />
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/tours" className="text-[#003c71] hover:text-blue-900 font-semibold text-[15px] flex items-center justify-center gap-2">
                                Xem tất cả <span className="text-xl">→</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* --- MỤC 3: TOUR MIỀN TÂY --- */}
                {toursMienTay.length > 0 && (
                    <div className="mb-16">
                        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-100 pb-4 gap-4">
                            <h2 className="text-3xl font-black text-[#003c71] uppercase">
                                KHÁM PHÁ MIỀN TÂY
                            </h2>
                            <Link to="/tours?loaiTour=6" className="bg-[#003c71] hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded text-sm transition hidden sm:block">
                                Xem tất cả
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {toursMienTay.map(tour => (
                                <TourCard key={tour.MaTour} tour={tour} badgeText="Miền Tây" badgeColor="bg-green-600" />
                            ))}
                        </div>
                        <div className="text-center mt-6 sm:hidden">
                            <Link to="/tours?loaiTour=6" className="bg-[#003c71] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded text-sm w-full inline-block transition">
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                )}

                {/* --- MỤC 4: TOUR MIỀN NAM --- */}
                {toursMienNam.length > 0 && (
                    <div className="mb-16">
                        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-100 pb-4 gap-4">
                            <h2 className="text-3xl font-black text-[#003c71] uppercase">
                                VI VU MIỀN NAM
                            </h2>
                            <Link to="/tours?loaiTour=7" className="bg-[#003c71] hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded text-sm transition hidden sm:block">
                                Xem tất cả
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {toursMienNam.map(tour => (
                                <TourCard key={tour.MaTour} tour={tour} badgeText="Miền Nam" badgeColor="bg-purple-600" />
                            ))}
                        </div>
                        <div className="text-center mt-6 sm:hidden">
                            <Link to="/tours?loaiTour=7" className="bg-[#003c71] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded text-sm w-full inline-block transition">
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                )}

                {/* --- MỤC 5: TOUR TRONG NƯỚC --- */}
                {toursTrongNuoc.length > 0 && (
                    <div className="mb-16">
                        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-100 pb-4 gap-4">
                            <h2 className="text-3xl font-black text-[#003c71] uppercase">
                                ĐIỂM ĐẾN TRONG NƯỚC HOT
                            </h2>
                            <Link to="/tours?loaiTour=8" className="bg-[#003c71] hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded text-sm transition hidden sm:block">
                                Xem tất cả
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {toursTrongNuoc.map(tour => (
                                <TourCard key={tour.MaTour} tour={tour} badgeText="Trong Nước" badgeColor="bg-blue-600" />
                            ))}
                        </div>
                        <div className="text-center mt-6 sm:hidden">
                            <Link to="/tours?loaiTour=8" className="bg-[#003c71] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded text-sm w-full inline-block transition">
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrangChu;
