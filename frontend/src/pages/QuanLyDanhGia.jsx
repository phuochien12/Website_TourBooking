
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const QuanLyDanhGia = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get('/api/admin/reviews');
            setReviews(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi fetch reviews:", err);
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await axios.put(`/api/admin/reviews/${id}`, {
                TrangThai: !currentStatus
            });
            fetchReviews();
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Cập nhật trạng thái hiển thị thành công!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            Swal.fire('Lỗi', 'Không thể cập nhật trạng thái!', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Đánh giá này sẽ bị xóa vĩnh viễn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/admin/reviews/${id}`);
                    fetchReviews();
                    Swal.fire('Đã xóa!', 'Đánh giá đã được xóa.', 'success');
                } catch (err) {
                    Swal.fire('Lỗi', 'Không thể xóa đánh giá!', 'error');
                }
            }
        });
    };

    const handleReply = async (id) => {
        if (!replyContent.trim()) return;

        try {
            await axios.put(`/api/admin/reviews/${id}`, {
                PhanHoi: replyContent,
                TrangThai: true // Luôn hiện khi có phản hồi
            });
            setReplyingTo(null);
            setReplyContent('');
            fetchReviews();
            Swal.fire({
                icon: 'success',
                title: 'Đã gửi phản hồi',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire('Lỗi', 'Không thể gửi phản hồi!', 'error');
        }
    };

    const filteredReviews = reviews.filter(r => 
        r.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.TenTour.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.BinhLuan && r.BinhLuan.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderStars = (points) => {
        return (
            <div className="flex gap-0.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < points ? 'fill-current' : 'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-navy flex items-center gap-3">
                        <span className="p-2 bg-yellow-400 rounded-lg text-white shadow-lg shadow-yellow-400/20 text-lg">⭐</span>
                        QUẢN LÝ ĐÁNH GIÁ & PHẢN HỒI
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Kiểm duyệt và trả lời ý kiến khách hàng</p>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Tìm tên khách, tour, nội dung..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-80 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="h-4 w-4 absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="bg-white rounded-[28px] shadow-xl shadow-navy/5 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-navy text-white text-[11px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4">Thông tin chung</th>
                                <th className="px-6 py-4">Nội dung đánh giá & phản hồi</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredReviews.map((review) => (
                                <tr key={review.MaDanhGia} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-6 min-w-[250px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
                                                {review.HoTen.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-navy truncate">{review.HoTen}</span>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-tighter mt-0.5 max-w-[150px] truncate leading-tight">
                                                    {review.TenTour}
                                                </span>
                                                <span className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(review.NgayDanhGia).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 min-w-[400px]">
                                        <div className="space-y-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {renderStars(review.Diem)}
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">{review.Diem}/5 BINH LUẬN KHÁCH</span>
                                                </div>
                                                <p className="text-sm text-navy italic font-medium leading-relaxed">
                                                    "{review.BinhLuan}"
                                                </p>
                                            </div>

                                            <div className="pt-2">
                                                {replyingTo === review.MaDanhGia ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
                                                            placeholder="Nhập nội dung phản hồi..."
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleReply(review.MaDanhGia)}
                                                                className="bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                                                            >
                                                                {review.PhanHoi ? 'CẬP NHẬT PHẢN HỒI' : 'GỬI PHẢN HỒI'}
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setReplyingTo(null);
                                                                    setReplyContent('');
                                                                }}
                                                                className="text-gray-400 text-[10px] font-bold px-4 py-2"
                                                            >
                                                                HỦY
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : review.PhanHoi ? (
                                                    <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-2xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Phản hồi của bạn</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {review.PhanHoi}
                                                        </p>
                                                        <button 
                                                            onClick={() => {
                                                                setReplyingTo(review.MaDanhGia);
                                                                setReplyContent(review.PhanHoi);
                                                            }}
                                                            className="text-[10px] font-bold text-primary hover:underline mt-2 inline-block"
                                                        >
                                                            Chỉnh sửa phản hồi
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setReplyingTo(review.MaDanhGia)}
                                                        className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                        VIẾT PHẢN HỒI CHO KHÁCH
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleStatus(review.MaDanhGia, review.TrangThai)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${review.TrangThai ? 'bg-primary' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${review.TrangThai ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${review.TrangThai ? 'text-primary' : 'text-gray-400'}`}>
                                                {review.TrangThai ? 'ĐANG HIỆN' : 'ĐANG ẨN'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <button 
                                            onClick={() => handleDelete(review.MaDanhGia)}
                                            className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all group"
                                        >
                                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredReviews.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="text-navy font-bold">Không tìm thấy đánh giá nào</h3>
                        <p className="text-gray-400 text-sm">Thử thay đổi từ khóa tìm kiếm</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuanLyDanhGia;
