import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';


function ChiTietTour() {
    const { id } = useParams();
    const [tour, setTour] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    // State lưu danh sách các "Ngày" (index) đang được mở ra (mặc định mở ngày 1)
    const [openDays, setOpenDays] = useState([0]);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);


    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`/api/tours/${id}`)
            .then(phanHoi => {
                const tourData = phanHoi.data;
                setTour(tourData);
                setDangTai(false);

                // Nếu tour chưa có lịch, hiện thông báo ngay khi vào trang
                if (tourData.SoLich === 0) {
                    Swal.fire({
                        title: 'Thông báo!',
                        text: 'Tour này hiện đang cập nhật lịch trình, bạn có muốn xem tiếp không? Hoặc liên hệ ngay qua trang liên hệ để được hỗ trợ!',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: '📞 Liên hệ tư vấn',
                        cancelButtonText: 'Để sau'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Chuyển sang trang liên hệ
                            window.location.href = '/lien-he';
                        }
                    });
                }
            });
        
        fetchReviews();
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, [id]);

    const fetchReviews = () => {
        axios.get(`/api/reviews/tour/${id}`)
            .then(res => setReviews(res.data))
            .catch(err => console.error("Lỗi fetch reviews:", err));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Chú ý',
                text: 'Vui lòng đăng nhập để đánh giá!',
                confirmButtonColor: '#003c71'
            });
            return;
        }
        if (!comment.trim()) {
            Swal.fire({
                icon: 'info',
                text: 'Vui lòng nhập bình luận!',
                confirmButtonColor: '#003c71'
            });
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/reviews', {
                MaNguoiDung: user.MaNguoiDung,
                MaTour: id,
                Diem: rating,
                BinhLuan: comment
            });
            setComment('');
            setRating(5);
            fetchReviews();
            Swal.fire({
                icon: 'success',
                title: 'Cảm ơn bạn!',
                text: 'Đánh giá của bạn đã được gửi thành công.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Lỗi gửi đánh giá:", err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể gửi đánh giá lúc này!',
            });
        } finally {
            setSubmitting(false);
        }

    };


    if (dangTai) return <div className="text-center py-20">Đang tải chi tiết tour...</div>;
    if (!tour) return <div className="text-center py-20">Không tìm thấy tour này!</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Breadcrumb */}
            <div className="bg-white shadow-sm py-3 px-4 mb-6">
                <div className="container mx-auto text-sm text-gray-600">
                    <Link to="/" className="hover:text-blue-500">Trang chủ</Link> / <span className="text-gray-900 font-medium">{tour.TenTour}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột trái: Thông tin chính */}
                <div className="lg:col-span-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#003c71] mb-4 uppercase">{tour.TenTour}</h1>

                    {/* Phần danh mục và chi tiết (New Layout based on screenshot) */}
                    <div className="mb-6 space-y-3 font-medium text-[15px] text-gray-800 border-b pb-6">
                        <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                            <span className="uppercase">DANH MỤC:</span>
                            <Link to="/tours" className="text-[#003c71] hover:underline uppercase">TOUR THAM QUAN TÂY NINH</Link>,
                            <Link to="/tours" className="text-[#003c71] hover:underline uppercase">TOUR MIỀN NAM</Link>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-bold mt-1">
                            <span className="uppercase">MÃ TOUR: TN{tour.MaTour}</span>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition">
                                <span>📥</span> TẢI PDF
                            </button>
                        </div>

                        <ul className="space-y-2 mt-4">
                            <li className="flex gap-2 items-start"><span className="text-blue-500 w-5">🕒</span> <span className="font-bold w-24">Thời gian:</span> <span>{tour.ThoiGian || '1 Ngày'}</span></li>
                            <li className="flex gap-2 items-start"><span className="text-blue-500 w-5">📍</span> <span className="font-bold w-24">Lịch trình:</span> <span className="uppercase">{tour.TenTour}</span></li>
                            <li className="flex gap-2 items-start"><span className="text-blue-500 w-5">📅</span> <span className="font-bold w-24">Khởi hành:</span> <span>Thứ 4 - Thứ 7 - Chủ Nhật Hàng Tuần</span></li>
                            <li className="flex gap-2 items-start"><span className="text-blue-500 w-5">🚌</span> <span className="font-bold w-24">Phương tiện:</span> <span>Xe ghế ngồi bật đời mới</span></li>
                            <li className="flex gap-2 items-start"><span className="text-blue-500 w-5">🏨</span> <span className="font-bold w-24">Khách sạn:</span> <span>Khách sạn 3 Sao++</span></li>
                            <li className="flex gap-2 items-start text-red-600"><span className="w-5">🚀</span> <span className="font-bold w-24">Khởi Hành Lễ:</span> <span className="font-bold text-lg leading-none">30/4 & 1-2-3/5</span></li>
                        </ul>
                    </div>

                    {/* Hướng Dẫn Viên Phụ Trách */}
                    {tour.HuongDanVien && (
                        <div className="mb-6 bg-gradient-to-r from-[#f0f7ff] to-white p-5 rounded-xl border border-blue-100 shadow-sm">
                            <h3 className="text-sm font-bold text-[#003c71] mb-4 flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                                Hướng dẫn viên phụ trách
                            </h3>
                            <div className="flex items-center gap-4">
                                {tour.HuongDanVien.AnhDaiDien ? (
                                    <img src={tour.HuongDanVien.AnhDaiDien} alt={tour.HuongDanVien.HoTen}
                                        className="w-16 h-16 rounded-full object-cover border-3 border-blue-300 shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                                        {tour.HuongDanVien.HoTen?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-gray-800 text-lg">{tour.HuongDanVien.HoTen}</p>
                                        <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                                            Hướng dẫn viên
                                        </span>
                                    </div>
                                    {tour.HuongDanVien.TieuSu && (
                                        <p className="text-sm text-gray-500 italic mb-1.5">"{tour.HuongDanVien.TieuSu}"</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {tour.HuongDanVien.SoDienThoai && (
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-blue-500">📞</span> {tour.HuongDanVien.SoDienThoai}
                                            </span>
                                        )}
                                        {tour.HuongDanVien.Email && (
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-blue-500">✉️</span> {tour.HuongDanVien.Email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hình ảnh */}
                    <img src={tour.AnhBia} alt={tour.TenTour} className="w-full h-[400px] object-cover rounded-lg shadow-md mb-8" />

                    {/* Giới thiệu */}
                    <div className="mb-6">
                        <div className="prose max-w-none text-gray-700 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: tour.MoTa }} />
                    </div>

                    {/* Lịch trình (Accordion) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3">Lịch Trình Chi Tiết</h2>
                        <div className="space-y-4">
                            {tour.LichTrinh && tour.LichTrinh.length > 0 ? (
                                tour.LichTrinh.map((item, index) => {
                                    const isOpen = openDays.includes(index);
                                    return (
                                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
                                            {/* Header - Nút bấm để mở/đóng */}
                                            <button
                                                onClick={() => {
                                                    if (isOpen) {
                                                        // Đóng nếu đang mở
                                                        setOpenDays(openDays.filter(dayIndex => dayIndex !== index));
                                                    } else {
                                                        // Mở nếu đang đóng
                                                        setOpenDays([...openDays, index]);
                                                    }
                                                }}
                                                className={`w-full flex justify-between items-center p-4 text-left font-bold text-base hover:bg-blue-50 transition-colors ${isOpen ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-800'}`}
                                            >
                                                <span>Ngày {item.NgayThu}: {item.TieuDe}</span>
                                                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>

                                            {/* Content - Nội dung chi tiết (Chỉ hiện khi isOpen = true) */}
                                            <div
                                                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                            >
                                                <div className="p-4 border-t border-gray-200 bg-white">
                                                    <p className="text-sm text-blue-600 font-semibold mb-2">🕒 Thời gian: {item.ThoiGian}</p>
                                                    <div className="text-gray-800 leading-relaxed text-[15px] custom-prose" dangerouslySetInnerHTML={{ __html: item.NoiDung }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 italic">Đang cập nhật lịch trình...</p>
                            )}
                        </div>
                    </div>

                    {/* Đánh giá từ khách hàng */}
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm font-sans">
                        <div className="flex items-center justify-between mb-8 border-b pb-4">
                            <h2 className="text-xl font-black text-[#003c71] flex items-center gap-2 uppercase">
                                <span className="text-yellow-400">⭐</span> Đánh giá từ khách hàng
                            </h2>
                            <div className="flex items-center gap-4">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                    {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.Diem, 0) / reviews.length).toFixed(1) : 5.0}/5
                                </span>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-400 text-sm">({reviews.length} đánh giá)</span>
                            </div>
                        </div>

                        {/* Form gửi đánh giá */}
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-[#003c71] mb-4 uppercase text-sm tracking-wider">Chia sẻ trải nghiệm của bạn</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-sm font-medium text-gray-700">Điểm đánh giá:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`text-2xl transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 ml-2 uppercase">
                                        {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất tệ'}
                                    </span>
                                </div>
                                <textarea
                                    className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all min-h-[120px]"
                                    placeholder="Cảm nhận của bạn về chuyến đi thế nào? (Chất lượng xe, khách sạn, HDV...)"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-[#003c71] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                    >
                                        {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ CỦA TÔI'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mb-10 bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
                                <p className="text-blue-800 font-medium mb-3 text-sm">Vui lòng đăng nhập để gửi đánh giá của bạn cho tour này</p>
                                <Link to="/dang-nhap" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-xs">ĐĂNG NHẬP NGAY</Link>
                            </div>
                        )}

                        {/* Danh sách bình luận */}
                        <div className="space-y-6">
                            {reviews.length > 0 ? (
                                reviews.map((rev) => (
                                    <div key={rev.MaDanhGia} className="flex gap-4 group animate-fadeIn">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center font-bold text-blue-600 text-xl border-2 border-white shadow-sm overflow-hidden">
                                            {rev.AnhDaiDien ? <img src={rev.AnhDaiDien} className="w-full h-full object-cover" alt="Avatar" /> : rev.HoTen.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-navy text-sm">{rev.HoTen}</h4>
                                                <span className="text-[10px] text-gray-400 font-medium">{new Date(rev.NgayDanhGia).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex text-yellow-400 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="text-xs">{i < rev.Diem ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 italic font-medium text-gray-700 text-sm leading-relaxed">
                                                "{rev.BinhLuan}"
                                            </div>

                                            {/* Phản hồi của admin */}
                                            {rev.PhanHoi && (
                                                <div className="mt-4 bg-blue-50/50 p-4 rounded-2xl border-l-4 border-blue-500 relative ml-4">
                                                    <div className="bg-[#003c71] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase absolute -top-2 left-4 shadow-sm">Phản hồi của admin</div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{rev.PhanHoi}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <p className="text-gray-400 italic text-sm">Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Cột phải: Đặt tour & Thông tin phụ */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
                        <p className="text-gray-500 text-sm mb-1">Giá trọn gói / khách</p>
                        {tour.PhanTramGiamGia && tour.PhanTramGiamGia > 0 ? (
                            <div className="mb-4">
                                <p className="text-sm text-gray-400 line-through mb-1">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.GiaGoc)}
                                </p>
                                <div className="flex items-center gap-3">
                                    <p className="text-4xl font-black text-red-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.GiaGoc * (1 - tour.PhanTramGiamGia / 100))}
                                    </p>
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold border border-red-200">
                                        -{tour.PhanTramGiamGia}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-red-600 mb-4">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.GiaGoc)}
                            </p>
                        )}

                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span>📅 Thời gian:</span>
                                <span className="font-medium">{tour.ThoiGian}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>🚍 Phương tiện:</span>
                                <span className="font-medium">Xe du lịch / Máy bay</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>🚩 Khởi hành:</span>
                                <span className="font-medium">{tour.DiemKhoiHanh || 'Đang cập nhật'}</span>
                            </div>
                        </div>

                        <Link to={`/dat-tour/${tour.MaTour}`} className="block w-full text-center bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition mb-3 shadow-lg uppercase">
                            ĐẶT TOUR NGAY
                        </Link>
                        <Link to="/lien-he" className="block text-center w-full border border-blue-600 text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition">
                            LIÊN HỆ TƯ VẤN
                        </Link>

                        {/* Chính sách hoàn hủy */}
                        {tour.ChinhSachHuyTour && (
                            <div className="mt-6 pt-4 border-t">
                                <h4 className="font-bold text-sm mb-2 text-gray-700">Chính sách hoàn hủy:</h4>
                                <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                    {tour.ChinhSachHuyTour}
                                </p>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChiTietTour;
