import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { HiStar, HiChatAlt, HiTrash, HiReply, HiEye, HiEyeOff, HiSearch } from 'react-icons/hi';

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
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
            });
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể cập nhật trạng thái!',
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Đánh giá này sẽ bị xóa vĩnh viễn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy',
            background: '#1e293b',
            color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/admin/reviews/${id}`);
                    fetchReviews();
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: 'Đánh giá đã được xóa thành công.',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#1e293b',
                        color: '#fff'
                    });
                } catch (err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không thể xóa đánh giá!',
                        background: '#1e293b',
                        color: '#fff'
                    });
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
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể gửi phản hồi!',
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    const filteredReviews = reviews.filter(r => 
        r.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.TenTour.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.BinhLuan && r.BinhLuan.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderStars = (points) => {
        return (
            <div className="flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                    <HiStar key={i} className={`h-4 w-4 ${i < points ? 'fill-current' : 'text-slate-700'}`} />
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse text-[10px]">ĐANG TRUY XUẤT ĐÁNH GIÁ...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Quản Lý <span className="text-amber-400 font-bold">Đánh Giá & Phản Hồi</span>
                        </h1>
                    </div>
                    <div className="relative w-full md:w-96 group">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm tên khách, tour, nội dung..."
                            className="w-full bg-[#1e293b] border-slate-700 border pl-12 pr-4 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold group-hover:border-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-800/80 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-700">
                                    <th className="p-6">Thông tin chung</th>
                                    <th className="p-6">Nội dung đánh giá & phản hồi</th>
                                    <th className="p-6 text-center">Trạng thái</th>
                                    <th className="p-6 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map((review) => (
                                        <tr key={review.MaDanhGia} className="hover:bg-amber-500/5 transition-all duration-300 group">
                                            <td className="p-6 min-w-[280px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 font-black text-lg border border-amber-500/30 group-hover:scale-110 transition-transform">
                                                        {review.HoTen ? review.HoTen.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white group-hover:text-amber-400 transition-colors uppercase italic tracking-tighter line-clamp-1">{review.HoTen}</h4>
                                                        <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-widest mt-0.5 line-clamp-1">{review.TenTour}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                                            📅 {new Date(review.NgayDanhGia).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 min-w-[400px]">
                                                <div className="space-y-4">
                                                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700/30">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {renderStars(review.Diem)}
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{review.Diem}/5 ĐIỂM</span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 italic font-medium leading-relaxed">
                                                            "{review.BinhLuan}"
                                                        </p>
                                                    </div>

                                                    <div className="pl-4">
                                                        {replyingTo === review.MaDanhGia ? (
                                                            <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-indigo-500/20 shadow-xl">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Viết phản hồi hệ thống</span>
                                                                </div>
                                                                <textarea
                                                                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none min-h-[100px] transition-all"
                                                                    placeholder="Nhập nội dung phản hồi của bạn..."
                                                                    value={replyContent}
                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                ></textarea>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleReply(review.MaDanhGia)}
                                                                        className="bg-indigo-600 text-white text-[10px] font-black px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 active:scale-95 uppercase tracking-widest"
                                                                    >
                                                                        {review.PhanHoi ? 'Cập nhật' : 'Gửi phản hồi'}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setReplyingTo(null);
                                                                            setReplyContent('');
                                                                        }}
                                                                        className="text-slate-500 text-[10px] font-black px-6 py-2.5 rounded-xl hover:text-white transition-all uppercase tracking-widest"
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : review.PhanHoi ? (
                                                            <div className="bg-emerald-500/5 border-l-4 border-emerald-500 p-5 rounded-r-2xl relative group/reply">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-900/20">Hệ thống phản hồi</span>
                                                                </div>
                                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                                    {review.PhanHoi}
                                                                </p>
                                                                <button 
                                                                    onClick={() => {
                                                                        setReplyingTo(review.MaDanhGia);
                                                                        setReplyContent(review.PhanHoi);
                                                                    }}
                                                                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 hover:text-emerald-400 transition-colors mt-3 uppercase tracking-widest"
                                                                >
                                                                    <HiReply size={14} className="scale-x-[-1]" /> Chỉnh sửa phản hồi
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setReplyingTo(review.MaDanhGia)}
                                                                className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-all hover:translate-x-1"
                                                            >
                                                                <HiChatAlt size={18} /> VIẾT PHẢN HỒI CHO KHÁCH
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <button 
                                                        onClick={() => handleToggleStatus(review.MaDanhGia, review.TrangThai)}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none shadow-inner ${review.TrangThai ? 'bg-amber-500' : 'bg-slate-700'}`}
                                                    >
                                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${review.TrangThai ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${review.TrangThai ? 'text-amber-500' : 'text-slate-500'}`}>
                                                        {review.TrangThai ? <><HiEye size={12} /> Đang Hiện</> : <><HiEyeOff size={12} /> Đang Ẩn</>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button 
                                                    onClick={() => handleDelete(review.MaDanhGia)}
                                                    className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl border border-rose-500/20 transition-all shadow-lg active:scale-90 group/del"
                                                    title="Xóa đánh giá"
                                                >
                                                    <HiTrash size={18} className="transition-transform group-hover/del:scale-110" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <HiChatAlt size={64} />
                                                <p className="font-black text-white uppercase tracking-[0.4em] mt-4">HỆ THỐNG TRỐNG</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredReviews.length > 0 && (
                    <div className="mt-8 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                        <span>Hiển thị {filteredReviews.length} đánh giá</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                            Hệ thống kiểm duyệt thời gian thực
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuanLyDanhGia;
