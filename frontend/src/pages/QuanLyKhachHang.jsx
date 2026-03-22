import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { HiLockClosed, HiLockOpen, HiTrash, HiCursorClick } from 'react-icons/hi';

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

    const handleUpdate = async (e) => {
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

    if (dangTai) return (
        <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse text-[10px] text-center">ĐANG TRUY XUẤT HỆ THỐNG KHÁCH HÀNG...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Quản Lý <span className="text-indigo-400 font-bold">Khách Hàng</span>
                        </h1>
                    </div>
                    <div className="relative w-full md:w-96 group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm tên, email hoặc SĐT..."
                            className="w-full bg-slate-900 border-slate-700 border pl-12 pr-4 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold group-hover:border-slate-600 shadow-inner"
                            value={searchKeyword}
                            onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-[#1e293b] p-6 rounded-3xl border border-slate-700/50 shadow-xl">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Phân quyền người dùng</label>
                        <select
                            className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                            value={filterRole}
                            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="customer">Khách hàng</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Trạng thái tài khoản</label>
                        <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-700">
                            {[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'active', label: 'Hoạt động' },
                                { id: 'locked', label: 'Đã khóa' }
                            ].map((status) => (
                                <button
                                    key={status.id}
                                    onClick={() => { setFilterStatus(status.id); setCurrentPage(1); }}
                                    className={`flex-1 py-2.5 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filterStatus === status.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-800/80 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-700">
                                    <th className="p-6">Thông tin tài khoản</th>
                                    <th className="p-6">Email / Liên hệ</th>
                                    <th className="p-6 text-center">Vai trò</th>
                                    <th className="p-6 text-center">Trạng thái</th>
                                    <th className="p-6 text-center">Quản trị</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {currentData.length > 0 ? (
                                    currentData.map((user) => (
                                        <tr key={user.MaNguoiDung} className="hover:bg-indigo-500/5 transition-all duration-300 group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-lg border border-indigo-500/30 group-hover:scale-110 transition-transform">
                                                        {user.HoTen ? user.HoTen.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">{user.HoTen}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">ID: KH-{user.MaNguoiDung.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-slate-300">📧 {user.Email}</p>
                                                    <p className="text-xs font-semibold text-slate-500 tracking-wide">📞 {user.SoDienThoai || 'Chưa cập nhật'}</p>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                {user.MaQuyen === 1 ? (
                                                    <span className="bg-purple-500/10 text-purple-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-purple-500/20">Admin</span>
                                                ) : (
                                                    <span className="bg-slate-700/50 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-slate-600/30">User</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                {(user.TrangThai === 1 || user.TrangThai === true) ? (
                                                    <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-[10px] uppercase italic">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        Hoạt động
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 text-rose-500 font-black text-[10px] uppercase italic">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                                        Đã khóa
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openEditModal(user)} className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-2xl border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-90" title="Sửa"><HiCursorClick size={18} /></button>
                                                    <button onClick={() => handleToggleLock(user.MaNguoiDung, user.TrangThai)} className={`p-2.5 rounded-2xl transition-all shadow-lg active:scale-90 border ${(user.TrangThai === 1 || user.TrangThai === true) ? 'bg-amber-600/10 text-amber-500 border-amber-600/20 hover:bg-amber-600 hover:text-white' : 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600 hover:text-white'}`}>{ (user.TrangThai === 1 || user.TrangThai === true) ? <HiLockClosed size={18} /> : <HiLockOpen size={18} /> }</button>
                                                    <button onClick={() => handleDeleteUser(user.MaNguoiDung)} className="p-2.5 bg-rose-600/10 text-rose-500 rounded-2xl border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-90" title="Xóa"><HiTrash size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="p-20 text-center text-slate-500 font-black tracking-[0.3em] italic">🚫 Không có dữ liệu khách hàng</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                    {/* Pagination (Phân Trang) */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-10 gap-3 pb-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="bg-slate-800 text-slate-400 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 disabled:cursor-not-allowed transition-all border border-slate-700"
                            >
                                ◀
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-12 h-12 rounded-2xl font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/20' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="bg-slate-800 text-slate-400 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 disabled:cursor-not-allowed transition-all border border-slate-700"
                            >
                                ▶
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL EDIT (Dark Mode) --- */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-700 border-t-indigo-500/30">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                🔧 Cập Nhật <span className="text-indigo-400">Tài Khoản</span>
                            </h2>
                            <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Họ và Tên</label>
                                <input
                                    required
                                    className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                    value={editForm.HoTen}
                                    onChange={e => setEditForm({...editForm, HoTen: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-slate-400 font-bold opacity-70 cursor-not-allowed"
                                    value={editForm.Email}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Số điện thoại</label>
                                <input
                                    className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                    value={editForm.SoDienThoai}
                                    onChange={e => setEditForm({...editForm, SoDienThoai: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Phân quyền</label>
                                <select
                                    className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                    value={editForm.MaQuyen}
                                    onChange={e => setEditForm({...editForm, MaQuyen: parseInt(e.target.value)})}
                                >
                                    <option value={1} className="bg-slate-900">Quản trị viên (Admin)</option>
                                    <option value={2} className="bg-slate-900">Khách hàng (User)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-700/50">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-2 text-slate-400 font-bold hover:text-white transition-colors uppercase text-xs tracking-widest">Hủy</button>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
                                    Lưu Thay Đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuanLyKhachHang;
