import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { HiFilter, HiSearch, HiCheckCircle, HiXCircle, HiMail, HiPhone, HiCalendar, HiCreditCard, HiChatAlt } from 'react-icons/hi';

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
                background: '#1e293b',
                color: '#fff',
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
                cancelButtonText: 'Đóng',
                background: '#1e293b',
                color: '#fff'
            });
            if (!result.isConfirmed) return;
        }

        Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, background: '#1e293b', color: '#fff', didOpen: () => Swal.showLoading() });

        axios.put(`/api/admin/bookings/${id}`, { status, ghiChu })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: `Đơn hàng #${id} đã được chuyển sang "${status}"`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                    background: '#1e293b',
                    color: '#fff'
                });
                loadBookings();
            })
            .catch(err => {
                Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || err.message, confirmButtonColor: '#dc2626', background: '#1e293b', color: '#fff' });
            });
    };

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Quản Lý <span className="text-indigo-400 font-bold">Đơn Đặt Tour</span>
                        </h1>
                    </div>
                    
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 bg-[#1e293b] p-6 rounded-3xl border border-slate-700/50 shadow-xl">
                        <div className="flex items-center gap-3 mr-2 text-indigo-400">
                            <HiFilter size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Bộ lọc ngày</span>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Từ ngày</label>
                            <input 
                                type="date" 
                                className="bg-slate-900 border-slate-700 border p-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-sm"
                                value={dateFilters.startDate}
                                onChange={(e) => setDateFilters({...dateFilters, startDate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Đến ngày</label>
                            <input 
                                type="date" 
                                className="bg-slate-900 border-slate-700 border p-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-sm"
                                value={dateFilters.endDate}
                                onChange={(e) => setDateFilters({...dateFilters, endDate: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
                            Lọc đơn
                        </button>
                        <button type="button" onClick={clearFilters} className="bg-slate-800 text-slate-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-slate-700">
                            Tất cả
                        </button>
                    </form>
                </div>

                <div className="bg-[#1e293b] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-800/80 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-700">
                                    <th className="p-6 text-center w-20">Mã</th>
                                    <th className="p-6">Thời gian</th>
                                    <th className="p-6">Khách hàng / Liên hệ</th>
                                    <th className="p-6">Dịch vụ Tour</th>
                                    <th className="p-6">Chi phí / SL</th>
                                    <th className="p-6 text-center">Trạng thái</th>
                                    <th className="p-6 text-center">Quản trị</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse text-[10px]">ĐANG ĐỒNG BỘ DỮ LIỆU...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : bookings.length > 0 ? (
                                    bookings.map(item => (
                                        <tr key={item.MaDon} className="hover:bg-indigo-500/5 transition-all duration-300 group">
                                            <td className="p-6 text-center">
                                                <span className="font-black text-indigo-400 group-hover:text-amber-400 transition-colors">#{item.MaDon}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1.5 flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">📅 ĐẶT LÚC:</span>
                                                    <span className="text-xs font-bold text-slate-300">{new Date(item.NgayDat).toLocaleDateString('vi-VN')}</span>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">🚀 KHỞI HÀNH:</span>
                                                    <span className="text-xs font-bold text-indigo-400">{new Date(item.NgayKhoiHanh).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <p className="font-black text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">{item.HoTen}</p>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                        <HiPhone size={14} className="text-slate-600" /> {item.SoDienThoai}
                                                    </div>
                                                    {item.GhiChu && (
                                                        <div className="mt-2 p-3 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-inner max-w-[200px]">
                                                            <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                                                <span className="text-amber-500 not-italic mr-1">💬</span> {item.GhiChu}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 max-w-xs">
                                                <span className="text-sm font-bold text-slate-300 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">{item.TenTour}</span>
                                                <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Mã Tour: {item.MaTour}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-lg font-black text-rose-500 drop-shadow-sm">
                                                        {new Intl.NumberFormat('vi-VN').format(item.TongTien)}đ
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                                        <HiCheckCircle className="text-slate-600" /> {item.SoKhach} KHÁCH
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                {new Date(item.NgayKhoiHanh) < new Date().setHours(0,0,0,0) && (item.TrangThai !== 'Đã hủy' && item.TrangThai !== 'Khách đã hủy' && item.TrangThai !== 'Hủy') ? (
                                                    <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-500 border border-slate-700/50 shadow-inner italic">
                                                        🏁 Hoàn thành
                                                    </span>
                                                ) : (
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl inline-block min-w-[120px] transition-all
                                                        ${item.TrangThai === 'Đã xác nhận' || item.TrangThai === 'Đã thanh toán' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                          item.TrangThai === 'Đã hủy' || item.TrangThai === 'Hủy' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-rose-950/20' :
                                                          item.TrangThai === 'Khách đã hủy' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-orange-950/20' :
                                                          item.TrangThai === 'Chờ thanh toán' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-blue-950/20' :
                                                          'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-amber-950/20'}`}>
                                                        {item.TrangThai === 'Hủy' ? 'Đã hủy' : item.TrangThai}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {new Date(item.NgayKhoiHanh) >= new Date().setHours(0,0,0,0) && 
                                                     (item.TrangThai === 'Chờ xử lý' || item.TrangThai === 'Chờ thanh toán') ? (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(item.MaDon, 'Đã xác nhận')}
                                                                className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-90">
                                                                Duyệt Đơn
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(item.MaDon, 'Đã hủy')}
                                                                className="bg-rose-600/20 text-rose-400 border border-rose-600/30 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-90">
                                                                Hủy Bỏ
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-500 uppercase italic opacity-30 tracking-[0.2em] select-none">KHÔNG KHẢ DỤNG</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-24 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <HiChatAlt size={64} />
                                                <p className="font-black text-white uppercase tracking-[0.4em] mt-4">DANH SÁCH TRỐNG</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-6 border-t border-slate-700/50 bg-slate-900/10 flex flex-wrap justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-6">
                            <span>Tổng cộng: <span className="text-white font-black ml-1">{bookings.length}</span> đơn hàng</span>
                            <span>Đã thanh toán: <span className="text-emerald-500 font-black ml-1">{bookings.filter(b => b.TrangThai === 'Đã thanh toán').length}</span></span>
                            <span>Chờ xử lý: <span className="text-amber-500 font-black ml-1">{bookings.filter(b => b.TrangThai === 'Chờ xử lý').length}</span></span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse outline outline-4 outline-emerald-500/20"></div>
                            Hệ thống kiểm soát tài vụ ổn định
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuanLyDonHang;
