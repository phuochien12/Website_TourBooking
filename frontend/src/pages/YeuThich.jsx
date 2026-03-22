import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function YeuThich() {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get(`/api/wishlist/${user.MaNguoiDung}`);
            setWishlist(res.data);
        } catch (err) {
            console.error("Lỗi fetch wishlist:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (e, tourId) => {
        e.preventDefault();
        const result = await Swal.fire({
            title: 'Bỏ yêu thích?',
            text: "Tour này sẽ bị xóa khỏi danh sách yêu thích của bạn.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#14b8a6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Đúng, xóa đi',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.post('/api/wishlist/toggle', {
                    MaNguoiDung: user.MaNguoiDung,
                    MaTour: tourId
                });
                if (res.data.success) {
                    setWishlist(wishlist.filter(item => item.MaTour !== tourId));
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pt-32 pb-20 px-4 relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
            
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight">Tour Yêu Thích</h2>
                        <p className="text-white/40 text-sm mt-1">Danh sách các hành trình bạn đã lưu lại</p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-20 text-center shadow-2xl">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Chưa có tour yêu thích</h3>
                        <p className="text-white/40 mb-8 max-w-md mx-auto italic">"Thế giới rộng lớn đang chờ bạn khám phá. Hãy bắt đầu lưu lại những điểm đến mơ ước ngay hôm nay!"</p>
                        <Link to="/tours" className="inline-block bg-gradient-to-r from-primary to-blue-600 text-white font-black px-10 py-4 rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-primary/20 uppercase tracking-widest text-sm">
                            KHÁM PHÁ TOUR NGAY
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                        {wishlist.map(tour => {
                            const hasDiscount = !!(tour.PhanTramGiamGia && tour.PhanTramGiamGia > 0);
                            const salePrice = hasDiscount ? tour.GiaGoc * (1 - tour.PhanTramGiamGia / 100) : tour.GiaGoc;
                            
                            return (
                                <div key={tour.MaTour} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] overflow-hidden group hover:border-primary/50 transition-all duration-500 flex flex-col h-full shadow-xl">
                                    <Link to={`/tour/${tour.MaTour}`} className="relative h-56 block overflow-hidden">
                                        <img src={tour.AnhBia} alt={tour.TenTour} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>
                                        
                                        {/* Nút Xóa nhanh */}
                                        <button 
                                            onClick={(e) => handleRemoveFavorite(e, tour.MaTour)}
                                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                                            title="Xóa khỏi yêu thích"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>

                                        {hasDiscount && (
                                            <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                                -{tour.PhanTramGiamGia}%
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-4 left-5">
                                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{tour.ThoiGian}</span>
                                        </div>
                                    </Link>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 min-h-[56px] group-hover:text-primary transition-colors leading-snug">
                                            <Link to={`/tour/${tour.MaTour}`}>{tour.TenTour}</Link>
                                        </h3>

                                        <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Giá từ</p>
                                                <p className="text-xl font-black text-primary">
                                                    {new Intl.NumberFormat('vi-VN').format(salePrice)}
                                                    <span className="text-[10px] ml-1 opacity-60">VNĐ</span>
                                                </p>
                                            </div>
                                            <Link to={`/tour/${tour.MaTour}`} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap">
                                                CHI TIẾT
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default YeuThich;
