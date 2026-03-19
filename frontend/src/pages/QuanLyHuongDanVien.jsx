import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function QuanLyHuongDanVien() {
    const [danhSach, setDanhSach] = useState([]);
    const [timKiem, setTimKiem] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        HoTen: '', TieuSu: '', SoDienThoai: '', Email: '', AnhDaiDien: '', TrangThai: true
    });

    // Lấy danh sách HDV
    const fetchData = async () => {
        try {
            const res = await axios.get('/api/huong-dan-vien');
            setDanhSach(res.data);
        } catch (err) {
            console.error('Lỗi lấy danh sách HDV:', err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Mở form thêm mới
    const handleAdd = () => {
        setEditId(null);
        setForm({ HoTen: '', TieuSu: '', SoDienThoai: '', Email: '', AnhDaiDien: '', TrangThai: true });
        setShowForm(true);
    };

    // Mở form sửa
    const handleEdit = (hdv) => {
        setEditId(hdv.MaHDV);
        setForm({
            HoTen: hdv.HoTen || '',
            TieuSu: hdv.TieuSu || '',
            SoDienThoai: hdv.SoDienThoai || '',
            Email: hdv.Email || '',
            AnhDaiDien: hdv.AnhDaiDien || '',
            TrangThai: hdv.TrangThai
        });
        setShowForm(true);
    };

    // Xóa HDV
    const handleDelete = async (id, ten) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Bạn có chắc muốn xóa "${ten}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Xóa'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/huong-dan-vien/${id}`);
                Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false });
                fetchData();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.response?.data?.message || 'Không thể xóa.' });
            }
        }
    };

    // Submit form thêm/sửa
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.HoTen.trim()) {
            return Swal.fire({ icon: 'warning', title: 'Vui lòng nhập họ tên!' });
        }
        try {
            if (editId) {
                await axios.put(`/api/huong-dan-vien/${editId}`, form);
                Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1500, showConfirmButton: false });
            } else {
                await axios.post('/api/huong-dan-vien', form);
                Swal.fire({ icon: 'success', title: 'Thêm thành công!', timer: 1500, showConfirmButton: false });
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.response?.data?.error || 'Có lỗi xảy ra.' });
        }
    };

    // Lọc theo tìm kiếm
    const filteredList = danhSach.filter(hdv =>
        hdv.HoTen?.toLowerCase().includes(timKiem.toLowerCase()) ||
        hdv.Email?.toLowerCase().includes(timKiem.toLowerCase()) ||
        hdv.SoDienThoai?.includes(timKiem)
    );

    // Upload ảnh
    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post('/api/upload-image', formData);
            setForm(prev => ({ ...prev, AnhDaiDien: res.data.url }));
            Swal.fire({ icon: 'success', title: 'Đã tải ảnh!', timer: 1000, showConfirmButton: false });
        } catch {
            Swal.fire({ icon: 'error', title: 'Lỗi tải ảnh!' });
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý hướng dẫn viên</h1>
                <div className="flex gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Tìm kiếm HDV..."
                        value={timKiem}
                        onChange={(e) => setTimKiem(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
                    />
                    <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold whitespace-nowrap">
                        + Thêm HDV
                    </button>
                </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="flex gap-4 mb-6">
                <div className="bg-white rounded-lg shadow px-5 py-3 flex-1 text-center">
                    <div className="text-2xl font-bold text-blue-600">{danhSach.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Tổng HDV</div>
                </div>
                <div className="bg-white rounded-lg shadow px-5 py-3 flex-1 text-center">
                    <div className="text-2xl font-bold text-green-600">{danhSach.filter(h => h.TrangThai).length}</div>
                    <div className="text-xs text-gray-500 mt-1">Đang hoạt động</div>
                </div>
                <div className="bg-white rounded-lg shadow px-5 py-3 flex-1 text-center">
                    <div className="text-2xl font-bold text-red-500">{danhSach.filter(h => !h.TrangThai).length}</div>
                    <div className="text-xs text-gray-500 mt-1">Ngừng hoạt động</div>
                </div>
            </div>

            {/* Card Grid */}
            {filteredList.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-lg">Chưa có hướng dẫn viên nào</p>
                    <p className="text-sm mt-1">Bấm "Thêm HDV" để bắt đầu</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredList.map((hdv) => (
                        <div key={hdv.MaHDV} className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden group">
                            {/* Ảnh đại diện */}
                            <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                {hdv.AnhDaiDien ? (
                                    <img src={hdv.AnhDaiDien} alt={hdv.HoTen} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-600 border-4 border-white shadow">
                                        {hdv.HoTen?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Thông tin */}
                            <div className="p-4 text-center">
                                <h3 className="font-bold text-gray-800 text-base">{hdv.HoTen}</h3>
                                <p className="text-xs text-gray-400 mt-1">Hướng dẫn viên</p>

                                <div className="mt-3 space-y-1 text-sm text-gray-600">
                                    {hdv.SoDienThoai && <p>{hdv.SoDienThoai}</p>}
                                    {hdv.Email && <p className="text-blue-500 text-xs truncate">{hdv.Email}</p>}
                                </div>

                                {/* Badge trạng thái */}
                                <div className="mt-3">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                        hdv.TrangThai
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {hdv.TrangThai ? 'Hoạt động' : 'Ngừng'}
                                    </span>
                                </div>

                                {/* Nút thao tác */}
                                <div className="mt-4 flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button onClick={() => handleEdit(hdv)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition">
                                        Sửa
                                    </button>
                                    <button onClick={() => handleDelete(hdv.MaHDV, hdv.HoTen)} className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition">
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form Thêm/Sửa */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header modal */}
                        <div className="bg-[#1e293b] text-white px-6 py-4">
                            <h2 className="text-lg font-bold">{editId ? 'Cập nhật hướng dẫn viên' : 'Thêm hướng dẫn viên mới'}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Họ tên */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên *</label>
                                <input type="text" value={form.HoTen} onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Nhập họ tên HDV" />
                            </div>

                            {/* SĐT + Email */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                                    <input type="text" value={form.SoDienThoai} onChange={(e) => setForm({ ...form, SoDienThoai: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="09xxxxxxxx" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                    <input type="email" value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="email@example.com" />
                                </div>
                            </div>

                            {/* Tiểu sử */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiểu sử</label>
                                <textarea value={form.TieuSu} onChange={(e) => setForm({ ...form, TieuSu: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-20 resize-none"
                                    placeholder="Mô tả kinh nghiệm, chuyên môn..." />
                            </div>

                            {/* Ảnh đại diện */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh đại diện</label>
                                <div className="flex items-center gap-3">
                                    {form.AnhDaiDien && (
                                        <img src={form.AnhDaiDien} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                                    )}
                                    <label className="cursor-pointer px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition flex-1 text-center">
                                        Chọn ảnh...
                                        <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-semibold text-gray-700">Trạng thái:</label>
                                <button type="button" onClick={() => setForm({ ...form, TrangThai: !form.TrangThai })}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form.TrangThai ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.TrangThai ? 'translate-x-6' : ''}`}></span>
                                </button>
                                <span className={`text-sm font-medium ${form.TrangThai ? 'text-green-600' : 'text-gray-400'}`}>
                                    {form.TrangThai ? 'Hoạt động' : 'Ngừng'}
                                </span>
                            </div>

                            {/* Nút submit */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                                    Hủy
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                    {editId ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuanLyHuongDanVien;
