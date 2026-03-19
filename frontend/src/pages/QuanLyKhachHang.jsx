import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // [ĐỒNG BỘ] Popup đẹp cho Admin

function QuanLyKhachHang() {
    const [danhSachKhachHang, setDanhSachKhachHang] = useState([]);
    const [dangTai, setDangTai] = useState(true);

    // Filter states
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Edit Modal states
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ HoTen: '', Email: '', SoDienThoai: '' });

    useEffect(() => {
        layDanhSachKhachHang();
    }, []);

    const layDanhSachKhachHang = () => {
        axios.get('/api/admin/users')
            .then(res => {
                setDanhSachKhachHang(res.data);
                setDangTai(false);
            })
            .catch(err => {
                console.error("Lỗi lấy danh sách khách hàng:", err);
                setDangTai(false);
            });
    };

    // Hàm chuyển đổi trạng thái Khóa/Mở Khóa
    // [ĐỒNG BỘ] Dùng SweetAlert2 thay vì window.confirm và alert
    const handleToggleLock = async (id, currentStatus) => {
        const isLocking = (currentStatus === 1 || currentStatus === true);
        const result = await Swal.fire({
            title: isLocking ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?',
            text: isLocking ? 'Tài khoản này sẽ không thể đăng nhập hoặc đặt tour.' : 'Tài khoản này sẽ được hoạt động trở lại.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isLocking ? '#dc2626' : '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: isLocking ? '🔒 Khóa' : '🔓 Mở khóa',
            cancelButtonText: 'Hủy bỏ'
        });
        if (!result.isConfirmed) return;

        const newStatus = !isLocking ? 1 : 0;
        axios.put(`/api/admin/users/${id}`, { TrangThai: newStatus })
            .then(res => {
                if (res.data.success) {
                    setDanhSachKhachHang(prev =>
                        prev.map(user => user.MaNguoiDung === id ? { ...user, TrangThai: newStatus } : user)
                    );
                    Swal.fire({ icon: 'success', title: isLocking ? 'Đã khóa!' : 'Đã mở khóa!', timer: 1200, showConfirmButton: false });
                }
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.message, confirmButtonColor: '#dc2626' }));
    };

    // Hàm Xóa tài khoản
    // [ĐỒNG BỘ] Dùng SweetAlert2 thay vì window.confirm và alert
    const handleDeleteUser = async (id) => {
        const result = await Swal.fire({
            title: '⚠️ CẢNH BÁO!',
            html: '<b>Bạn có chắc chắn muốn XÓA tài khoản này không?</b><br/>Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '🗑️ Xóa luôn',
            cancelButtonText: 'Giữ lại'
        });
        if (!result.isConfirmed) return;

        axios.delete(`/api/admin/users/${id}`)
            .then(res => {
                if (res.data.success) {
                    setDanhSachKhachHang(prev => prev.filter(user => user.MaNguoiDung !== id));
                    Swal.fire({ icon: 'success', title: 'Xóa thành công!', timer: 1200, showConfirmButton: false });
                }
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Không thể xóa!', text: err.response?.data?.message || err.message, confirmButtonColor: '#dc2626' }));
    };

    // Cập nhật thông tin User
    const openEditModal = (user) => {
        setEditingUser(user.MaNguoiDung);
        setEditForm({ HoTen: user.HoTen, Email: user.Email, SoDienThoai: user.SoDienThoai });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        // Validate SĐT
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/g;
        if (!phoneRegex.test(editForm.SoDienThoai)) {
            // [ĐỒNG BỘ] Dùng SweetAlert2
            Swal.fire({ icon: 'warning', title: 'Số điện thoại không hợp lệ!', text: 'Vui lòng nhập số hợp lệ bắt đầu bằng số 0 và đủ 10 chữ số.', confirmButtonColor: '#2563eb' });
            return;
        }

        // [ĐỒNG BỘ] Dùng SweetAlert2 thay vì window.confirm
        const result = await Swal.fire({
            title: 'Xác nhận cập nhật?',
            text: 'Bạn có chắc chắn muốn cập nhật thông tin khách hàng này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Lưu thay đổi',
            cancelButtonText: 'Hủy bỏ'
        });
        if (!result.isConfirmed) return;

        axios.put(`/api/admin/users/${editingUser}`, editForm)
            .then(res => {
                if (res.data.success) {
                    setDanhSachKhachHang(prev => prev.map(u => u.MaNguoiDung === editingUser ? { ...u, ...editForm } : u));
                    setEditingUser(null);
                    Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1200, showConfirmButton: false });
                }
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Không thể cập nhật!', text: err.response?.data?.message || err.message, confirmButtonColor: '#dc2626' }));
    };

    // Áp dụng bộ lọc
    const filteredData = danhSachKhachHang.filter(user => {
        const matchRole = filterRole === 'all' ? true : (filterRole === 'admin' ? user.MaQuyen === 1 : user.MaQuyen === 2);
        const isUserActive = user.TrangThai === 1 || user.TrangThai === true;
        const matchStatus = filterStatus === 'all' ? true : (filterStatus === 'active' ? isUserActive : !isUserActive);
        const matchSearch = user.HoTen.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            user.Email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (user.SoDienThoai && user.SoDienThoai.includes(searchKeyword));
        return matchRole && matchStatus && matchSearch;
    });

    // Phân trang
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (dangTai) return <div className="text-center py-20 flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-gray-50 min-h-screen py-10 relative">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-[#003c71]">

                    {/* Header Table */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-[#003c71] uppercase tracking-wider flex items-center gap-2">
                            <span>📇</span> QUẢN LÝ KHÁCH HÀNG
                        </h2>

                        {/* Bộ Lọc (Filters) */}
                        <div className="flex flex-wrap gap-3">
                            <input
                                type="text" placeholder="Tìm tên, email, SDT..."
                                className="border px-3 py-2 rounded focus:ring-1 focus:ring-blue-500 text-sm outline-none"
                                value={searchKeyword} onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                            />
                            <select
                                className="border px-3 py-2 rounded text-sm bg-gray-50 outline-none hover:bg-white focus:ring-1 focus:ring-blue-500"
                                value={filterRole} onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">- Tất cả Vai trò -</option>
                                <option value="admin">Quản trị viên</option>
                                <option value="customer">Khách hàng</option>
                            </select>
                            <select
                                className="border px-3 py-2 rounded text-sm bg-gray-50 outline-none hover:bg-white focus:ring-1 focus:ring-blue-500"
                                value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">- Tất cả Trạng thái -</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="locked">Đã khóa</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-[#f8fadc] text-[#003c71] border-b-2 border-gray-200">
                                    <th className="p-4 font-bold w-16 text-center">ID</th>
                                    <th className="p-4 font-bold text-left">Khách Hàng</th>
                                    <th className="p-4 font-bold text-left">Email</th>
                                    <th className="p-4 font-bold text-center">Số Điện Thoại</th>
                                    <th className="p-4 font-bold text-center">Vai Trò</th>
                                    <th className="p-4 font-bold text-center">Trạng Thái</th>
                                    <th className="p-4 font-bold text-center w-36">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length > 0 ? currentData.map((user) => (
                                    <tr key={user.MaNguoiDung} className="border-b hover:bg-blue-50 transition-colors duration-150">
                                        <td className="p-4 font-bold text-gray-500 text-center">#{user.MaNguoiDung}</td>

                                        <td className="p-4 text-gray-800 font-bold capitalize">
                                            {/* Sửa text-transform: capitalize giúp tên luôn đẹp */}
                                            {user.HoTen}
                                        </td>

                                        <td className="p-4 text-gray-600 text-left">{user.Email}</td>

                                        <td className="p-4 text-gray-800 font-semibold text-center">
                                            {user.SoDienThoai || <span className="text-red-400 italic font-normal text-xs">Chưa cập nhật</span>}
                                        </td>

                                        <td className="p-4 text-center">
                                            {user.MaQuyen === 1 ? (
                                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-purple-200">Quản trị viên</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs whitespace-nowrap border border-gray-200">Khách hàng</span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            {(user.TrangThai === 1 || user.TrangThai === true) ? (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-green-200">Hoạt động</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-red-200">Đã khóa</span>
                                            )}
                                        </td>

                                        {/* Cột Thao tác */}
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {/* Edit Button */}
                                                <button onClick={() => openEditModal(user)} className="p-1.5 bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-600 rounded transition shadow-sm" title="Sửa thông tin">
                                                    ✏️
                                                </button>

                                                {/* Toggle Lock Button */}
                                                <button
                                                    onClick={() => handleToggleLock(user.MaNguoiDung, user.TrangThai)}
                                                    className={`p-1.5 rounded transition shadow-sm font-bold ${(user.TrangThai === 1 || user.TrangThai === true) ? 'bg-orange-100 hover:bg-orange-500 hover:text-white text-orange-600' : 'bg-green-100 hover:bg-green-600 hover:text-white text-green-600'}`}
                                                    title={(user.TrangThai === 1 || user.TrangThai === true) ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                >
                                                    {(user.TrangThai === 1 || user.TrangThai === true) ? '🔒' : '🔓'}
                                                </button>

                                                {/* Delete Button */}
                                                <button onClick={() => handleDeleteUser(user.MaNguoiDung)} className="p-1.5 bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded transition shadow-sm" title="Xóa tài khoản">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center p-12 text-gray-500 text-lg">
                                            ❌ Không có dữ liệu khách hàng nào khớp với yêu cầu tìm kiếm!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Phân Trang) */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                &laquo; Trước
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded transition border ${currentPage === i + 1 ? 'bg-[#003c71] text-white current-page-btn' : 'bg-white hover:bg-gray-100'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Sau &raquo;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Edit Khách Hàng */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-xl font-bold text-[#003c71]">Cập nhật thông tin</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên (*)</label>
                                    <input
                                        type="text" required
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-[#003c71] outline-none capitalize"
                                        value={editForm.HoTen} onChange={e => setEditForm({ ...editForm, HoTen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email (*)</label>
                                    <input
                                        type="email" required
                                        className="w-full border p-2 rounded bg-gray-50 focus:ring-2 focus:ring-[#003c71] outline-none"
                                        value={editForm.Email} onChange={e => setEditForm({ ...editForm, Email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Số Điện Thoại (*)</label>
                                    <input
                                        type="tel" required
                                        placeholder="Ví dụ: 0987654321"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-[#003c71] outline-none"
                                        value={editForm.SoDienThoai} onChange={e => setEditForm({ ...editForm, SoDienThoai: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2 border rounded font-semibold text-gray-600 hover:bg-gray-100 transition">Hủy bỏ</button>
                                <button type="submit" className="px-5 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 shadow transition">Lưu Thay Đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default QuanLyKhachHang;
