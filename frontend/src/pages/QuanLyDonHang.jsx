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

    // Xử lý duyệt đơn
    // [ĐỒNG BỘ] Dùng SweetAlert2 thay vì window.confirm và alert
    const updateStatus = async (id, status) => {
        const result = await Swal.fire({
            title: 'Xác nhận thay đổi?',
            html: `Bạn có chắc muốn chuyển trạng thái sang <b>"${status}"</b>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: status === 'Hủy' ? '#dc2626' : '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy bỏ'
        });
        if (!result.isConfirmed) return;

        axios.put(`/api/admin/bookings/${id}`, { status })
            .then(() => {
                Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1200, showConfirmButton: false });
                loadBookings();
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.message, confirmButtonColor: '#dc2626' }));
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="container mx-auto bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 border-l-4 border-navy pl-4">Quản Lý Đơn Đặt Tour</h1>
                    
                    {/* BỘ LỌC NGÀY THÁNG - ĐỒNG BỘ DASHBOARD */}
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 italic">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đơn đặt từ ngày</label>
                            <input 
                                type="date" 
                                className="border-gray-100 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-navy"
                                value={dateFilters.startDate}
                                onChange={(e) => setDateFilters({...dateFilters, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đến ngày</label>
                            <input 
                                type="date" 
                                className="border-gray-100 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-navy"
                                value={dateFilters.endDate}
                                onChange={(e) => setDateFilters({...dateFilters, endDate: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="bg-navy text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-sm active:scale-95">
                            Lọc đơn
                        </button>
                        <button type="button" onClick={clearFilters} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95">
                            Xem tất cả
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider">
                                    <th className="border p-3 w-20">Mã</th>
                                    <th className="border p-3">Ngày Đặt</th>
                                    <th className="border p-3">Khách Hàng</th>
                                    <th className="border p-3">Tour Đặt</th>
                                    <th className="border p-3">Ngày Đi</th>
                                    <th className="border p-3">Tổng Tiền</th>
                                    <th className="border p-3 text-center">Trạng Thái</th>
                                    <th className="border p-3 text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(item => (
                                    <tr key={item.MaDon} className="hover:bg-gray-50 transition-colors">
                                        <td className="border p-3 font-bold text-blue-600 text-center">#{item.MaDon}</td>
                                        <td className="border p-3 text-sm text-gray-600">
                                            {new Date(item.NgayDat).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="border p-3">
                                            <p className="font-bold">{item.HoTen}</p>
                                            <p className="text-sm text-gray-500">{item.SoDienThoai}</p>
                                        </td>
                                        <td className="border p-3 max-w-xs truncate" title={item.TenTour}>
                                            {item.TenTour}
                                        </td>
                                        <td className="border p-3">
                                            {new Date(item.NgayKhoiHanh).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="border p-3 font-bold text-red-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.TongTien)}
                                            <br />
                                            <span className="text-xs text-gray-500 font-normal">({item.SoKhach} khách)</span>
                                        </td>
                                        <td className="border p-3 text-center">
                                            {new Date(item.NgayKhoiHanh) < new Date().setHours(0,0,0,0) && 
                                             (item.TrangThai === 'Đã xác nhận' || item.TrangThai === 'Đã thanh toán' || item.TrangThai === 'Hoàn thành') ? (
                                                <span className="px-2 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white">
                                                    Đã kết thúc
                                                </span>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-widest
                                                    ${item.TrangThai === 'Đã xác nhận' ? 'bg-green-100 text-green-700' :
                                                      item.TrangThai === 'Hủy' ? 'bg-red-100 text-red-700' :
                                                      item.TrangThai === 'Chờ thanh toán' ? 'bg-blue-100 text-blue-700' :
                                                      'bg-yellow-100 text-yellow-700'}`}>
                                                    {item.TrangThai}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border p-3 space-x-2 text-center">
                                            {new Date(item.NgayKhoiHanh) >= new Date().setHours(0,0,0,0) && 
                                             (item.TrangThai === 'Chờ xử lý' || item.TrangThai === 'Chờ thanh toán') && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(item.MaDon, 'Đã xác nhận')}
                                                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-all shadow-sm shadow-green-200">
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(item.MaDon, 'Hủy')}
                                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-all shadow-sm shadow-red-200">
                                                        Hủy
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bookings.length === 0 && <p className="text-center py-4 text-gray-500">Chưa có đơn hàng nào.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuanLyDonHang;
