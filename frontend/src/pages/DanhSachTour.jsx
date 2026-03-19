import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function DanhSachTour() {
    const [tours, setTours] = useState([]);
    const [wishlist, setWishlist] = useState([]); // [MỚI]
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(true);

    // Lấy query string từ thanh URL 
    const location = useLocation();
    const navigate = useNavigate();

    // State cho form bộ lọc (Sidebar)
    const queryParams = new URLSearchParams(location.search);
    const [filterForm, setFilterForm] = useState({
        diemDen: queryParams.get('diemDen') || '',
        diemDi: queryParams.get('diemDi') || '',
        mucGia: queryParams.get('mucGia') || ''
    });

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/tours${location.search}`)
            .then(res => {
                setTours(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải tours:", err);
                setLoading(false);
            });

        // [MỚI]
        if (user) {
            axios.get(`/api/wishlist/check/${user.MaNguoiDung}`)
                .then(res => setWishlist(res.data));
        }
    }, [location.search]);

    // [MỚI]
    const handleToggleWishlist = async (e, tourId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return navigate('/dang-nhap');
        try {
            const res = await axios.post('/api/wishlist/toggle', { MaNguoiDung: user.MaNguoiDung, MaTour: tourId });
            if (res.data.success) {
                if (res.data.isFavorite) setWishlist([...wishlist, tourId]);
                else setWishlist(wishlist.filter(id => id !== tourId));
            }
        } catch (err) { console.error(err); }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        const query = new URLSearchParams(filterForm).toString();
        // Cập nhật lại URL sẽ trigger useEffect ở trên
        navigate(`/tours?${query}`);
    };

    return (
        <div className="bg-[#faf9f7] min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-10">
                    
                    {/* Cột trái: Kết quả Tour */}
                    <div className="md:w-3/4 order-2 md:order-1">
                        <div className="mb-8">
                            <h1 className="text-3xl font-heading font-bold text-navy">Kết Quả Tìm Kiếm</h1>
                            <p className="text-gray-500 mt-2">
                                Tìm thấy <span className="text-primary font-bold">{tours.length}</span> chương trình tour phù hợp
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-gray-500 font-medium">Đang tìm kiếm hành trình phù hợp...</p>
                            </div>
                        ) : tours.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                                <div className="text-6xl mb-6">🏝️</div>
                                <p className="text-xl text-navy font-bold mb-4">Rất tiếc, chưa có tour nào phù hợp!</p>
                                <button 
                                    onClick={() => {
                                        setFilterForm({ diemDen: '', diemDi: '', mucGia: '' });
                                        navigate('/tours');
                                    }} 
                                    className="bg-primary/10 text-primary border border-primary px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    Xem tất cả Tour
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {tours.map(tour => {
                                    const hasDiscount = tour.PhanTramGiamGia && tour.PhanTramGiamGia > 0;
                                    const salePrice = hasDiscount ? tour.GiaGoc * (1 - tour.PhanTramGiamGia / 100) : tour.GiaGoc;
                                    return (
                                        <div key={tour.MaTour} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover-card-effect group flex flex-col h-full">
                                            {/* Ảnh Tour */}
                                            <Link to={`/tour/${tour.MaTour}`} className="h-56 relative block overflow-hidden">
                                                {tour.AnhBia ? (
                                                    <img src={tour.AnhBia} alt={tour.TenTour} className="w-full h-full object-cover hover-zoom-img" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-white text-xl font-bold px-4 text-center bg-navy">
                                                        {tour.TenTour ? tour.TenTour.split(':').shift() : `Tour #${tour.MaTour}`}
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                    <span className="px-3 py-1 bg-accent text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">Hot</span>
                                                    {hasDiscount && (
                                                        <span className="bg-white text-secondary px-2 py-1 rounded-md text-[11px] font-black shadow-sm">-{tour.PhanTramGiamGia}%</span>
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
                                                    <span className="bg-navy/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-semibold italic">
                                                        {tour.ThoiGian || 'Tùy chọn'}
                                                    </span>
                                                </div>
                                            </Link>

                                            {/* Chi tiết Tour */}
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="text-base font-bold mb-3 text-navy group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
                                                    <Link to={`/tour/${tour.MaTour}`}>{tour.TenTour}</Link>
                                                </h3>
                                                <div className="space-y-2 mb-6 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-primary">📍</span>
                                                        <span className="uppercase text-[11px] font-semibold tracking-wide text-gray-400">Từ: {tour.DiemKhoiHanh || 'Cần Thơ'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={tour.SoLich > 0 ? 'text-primary' : 'text-orange-500'}>📅</span>
                                                        <span className={`text-[11px] font-bold ${tour.SoLich > 0 ? 'text-gray-500' : 'text-orange-500 italic'}`}>
                                                            {tour.SoLich > 0 ? 'Lịch: Hàng tuần' : 'Đang cập nhật lịch'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-auto flex justify-between items-center border-t border-gray-50 pt-4">
                                                    <div className="flex flex-col">
                                                        {hasDiscount && (
                                                            <span className="text-[10px] text-gray-400 line-through">
                                                                {new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ
                                                            </span>
                                                        )}
                                                        <span className="text-lg font-bold text-accent">
                                                            {new Intl.NumberFormat('vi-VN').format(salePrice)}<small className="text-xs font-medium ml-0.5 whitespace-nowrap">đ / khách</small>
                                                        </span>
                                                    </div>
                                                    <Link to={`/tour/${tour.MaTour}`} className="bg-primary/5 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl font-bold text-xs transition-all flex-shrink-0">
                                                        Chi tiết
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cột phải: Bộ lọc (Sidebar) */}
                    <div className="md:w-1/4 order-1 md:order-2">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-heading font-bold text-navy uppercase text-lg mb-6 border-b border-gray-100 pb-4">Tìm kiếm tour</h3>
                            <form onSubmit={handleFilterSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Điểm đến</label>
                                    <input
                                        type="text"
                                        placeholder="Bạn muốn đi đâu?"
                                        className="w-full text-sm font-bold text-navy border-gray-200 border rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        value={filterForm.diemDen}
                                        onChange={(e) => setFilterForm({ ...filterForm, diemDen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Khởi hành từ</label>
                                    <select
                                        className="w-full text-sm font-bold text-navy border-gray-200 border rounded-xl py-3.5 px-4 focus:outline-none focus:border-primary transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                        value={filterForm.diemDi}
                                        onChange={(e) => setFilterForm({ ...filterForm, diemDi: e.target.value })}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                        <option value="Đà Nẵng">Đà Nẵng</option>
                                        <option value="Cần Thơ">Cần Thơ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ngân sách</label>
                                    <select
                                        className="w-full text-sm font-bold text-navy border-gray-200 border rounded-xl py-3.5 px-4 focus:outline-none focus:border-primary transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                        value={filterForm.mucGia}
                                        onChange={(e) => setFilterForm({ ...filterForm, mucGia: e.target.value })}
                                    >
                                        <option value="">Tất cả mức giá</option>
                                        <option value="duoi5">Dưới 5 triệu</option>
                                        <option value="5-10">Từ 5 - 10 triệu</option>
                                        <option value="tren10">Trên 10 triệu</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-primary hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4">
                                    Lọc Kết Quả
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DanhSachTour;
