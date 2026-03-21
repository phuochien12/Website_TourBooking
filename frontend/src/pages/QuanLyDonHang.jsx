import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // [ĐỒNG BỘ] Popup đẹp cho Admin

function QuanLyDonHang() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilters, setDateFilters] = useState({
        startDate: '',
        endDate: ''
    });

    // Lấy danh sách đơn hàng
    const loadBookings = (filters = dateFilters) => {
        setLoading(true);
        let url = '/api/admin/bookings';
        if (filters.startDate && filters.endDate) {
            url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
        }

        axios.get(url)
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        loadBookings();
    };

    const clearFilters = () => {
        const cleared = { startDate: '', endDate: '' };
        setDateFilters(cleared);
        loadBookings(cleared);
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // Xử lý duyệt đơn/Hủy đơn
    // [NÂNG CẤP] Thêm prompt nhập lý do khi Hủy (giống bên Lịch Sử & Quản Lý Lịch)
    const updateStatus = async (id, status) => {
        let ghiChu = '';

        if (status === 'Đã hủy') {
            const { value: reason, isConfirmed } = await Swal.fire({
                title: '❌ Xác nhận hủy đơn?',
                html: `Bạn đang thực hiện hủy đơn hàng <b>#${id}</b>.<br/>Vui lòng nhập lý do để khách hàng được biết.`,
                icon: 'warning',
                input: 'text',
                inputPlaceholder: 'VD: Khách gọi điện yêu cầu hủy...',
                inputLabel: 'Lý do hủy đơn',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Xác nhận hủy',
                cancelButtonText: 'Quay lại',
                inputValidator: (value) => {
                    if (!value) return 'Bạn phải nhập lý do hủy!';
                }
            });
            if (!isConfirmed) return;
            ghiChu = `Admin hủy: ${reason}`;
        } else {
            const result = await Swal.fire({
                title: '✅ Duyệt đơn hàng?',
                html: `Chuyển trạng thái đơn <b>#${id}</b> sang <b>"Đã xác nhận"</b>?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Duyệt đơn',
                cancelButtonText: 'Đóng'
            });
            if (!result.isConfirmed) return;
        }

        // Hiện loading
        Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        axios.put(`/api/admin/bookings/${id}`, { status, ghiChu })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: `Đơn hàng #${id} đã được chuyển sang "${status}"`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
                loadBookings();
            })
            .catch(err => {
                Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || err.message, confirmButtonColor: '#dc2626' });
            });
    };

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
                
                {/* --- HEADER --- */}
                <div className="p-8 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                                Quản Lý <span className="text-blue-400 font-bold">Đơn Đặt Tour</span>
                            </h1>
                        </div>
                        
                        {/* BỘ LỌC HIỆN ĐẠI (Glassmorphism) */}
                        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Từ ngày</label>
                                <input 
                                    type="date" 
                                    className="bg-slate-800 border-slate-600 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-white shadow-sm"
                                    value={dateFilters.startDate}
                                    onChange={(e) => setDateFilters({...dateFilters, startDate: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Đến ngày</label>
                                <input 
                                    type="date" 
                                    className="bg-slate-800 border-slate-600 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-white shadow-sm"
                                    value={dateFilters.endDate}
                                    onChange={(e) => setDateFilters({...dateFilters, endDate: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                                Lọc đơn
                            </button>
                            <button type="button" onClick={clearFilters} className="bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all active:scale-95">
                                Xem tất cả
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- TABLE CONTENT --- */}
                <div className="p-0 lg:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500"></div>
                            <span className="text-slate-400 font-bold text-sm tracking-widest animate-pulse">ĐANG TẢI DỮ LIỆU...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-700/50 shadow-sm">
                            <table className="min-w-full border-collapse bg-slate-900/20">
                                <thead>
                                    <tr className="bg-slate-800/80 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-700">
                                        <th className="p-4 w-20 text-center">Mã</th>
                                        <th className="p-4">Ngày Đặt</th>
                                        <th className="p-4">Khách Hàng</th>
                                        <th className="p-4">Tour Đặt</th>
                                        <th className="p-4">Ngày Đi</th>
                                        <th className="p-4">Tổng Tiền</th>
                                        <th className="p-4 text-center">Trạng Thái</th>
                                        <th className="p-4 text-center">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {bookings.map(item => (
                                        <tr key={item.MaDon} className="hover:bg-slate-800/50 transition-all duration-300 group">
                                            <td className="p-4 text-center">
                                                <span className="font-black text-blue-400 group-hover:text-blue-300 transition-colors">#{item.MaDon}</span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-slate-400">
                                                {new Date(item.NgayDat).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-black text-sm text-slate-200 group-hover:text-white transition-all uppercase">{item.HoTen}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{item.SoDienThoai}</p>
                                            </td>
                                            <td className="p-4 max-w-xs" title={item.TenTour}>
                                                <span className="text-sm font-bold text-slate-300 line-clamp-2 leading-relaxed">{item.TenTour}</span>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-slate-400">
                                                {new Date(item.NgayKhoiHanh).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-black text-rose-500 text-base drop-shadow-sm">
                                                    {new Intl.NumberFormat('vi-VN').format(item.TongTien)}đ
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">({item.SoKhach} khách)</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                {new Date(item.NgayKhoiHanh) < new Date().setHours(0,0,0,0) && (item.TrangThai !== 'Đã hủy' && item.TrangThai !== 'Khách đã hủy' && item.TrangThai !== 'Hủy') ? (
                                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-700/50 text-slate-400 border border-slate-600 shadow-sm whitespace-nowrap">
                                                        Đã kết thúc
                                                    </span>
                                                ) : (
                                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap inline-block min-w-[100px]
                                                        ${item.TrangThai === 'Đã xác nhận' || item.TrangThai === 'Đã thanh toán' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                          item.TrangThai === 'Đã hủy' || item.TrangThai === 'Hủy' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                          item.TrangThai === 'Khách đã hủy' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                          item.TrangThai === 'Chờ thanh toán' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                        {item.TrangThai === 'Hủy' ? 'Đã hủy' : item.TrangThai}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 space-x-2 text-center whitespace-nowrap">
                                                {new Date(item.NgayKhoiHanh) >= new Date().setHours(0,0,0,0) && 
                                                 (item.TrangThai === 'Chờ xử lý' || item.TrangThai === 'Chờ thanh toán') ? (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(item.MaDon, 'Đã xác nhận')}
                                                            className="bg-emerald-600/90 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(item.MaDon, 'Đã hủy')}
                                                            className="bg-rose-600/90 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 active:scale-95">
                                                            Hủy
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-50">Không khả dụng</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.length === 0 && (
                                <div className="text-center py-20 bg-slate-800/20">
                                    <div className="text-4xl mb-4">📭</div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Chưa có đơn hàng nào.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* --- FOOTER / PAGINATION PLACEHOLDER --- */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/20 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                    <span>Tổng cộng: {bookings.length} đơn hàng</span>
                    <div className="flex gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Hệ thống đang hoạt động
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuanLyDonHang;
