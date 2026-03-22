import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { HiUserAdd, HiPencilAlt, HiTrash, HiSearch, HiIdentification, HiMail, HiPhone, HiCloudUpload, HiCheckCircle, HiXCircle } from 'react-icons/hi';

function QuanLyHuongDanVien() {
    const [danhSach, setDanhSach] = useState([]);
    const [timKiem, setTimKiem] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        HoTen: '', TieuSu: '', SoDienThoai: '', Email: '', AnhDaiDien: '', TrangThai: true
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/huong-dan-vien');
            setDanhSach(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Lỗi lấy danh sách HDV:', err);
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => {
        setEditId(null);
        setForm({ HoTen: '', TieuSu: '', SoDienThoai: '', Email: '', AnhDaiDien: '', TrangThai: true });
        setShowForm(true);
    };

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

    const handleDelete = async (id, ten) => {
        const result = await Swal.fire({
            title: '❌ Xác nhận xóa?',
            html: `Bạn có chắc muốn xóa <b>"${ten}"</b> khỏi hệ thống?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy',
            background: '#1e293b',
            color: '#fff'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/huong-dan-vien/${id}`);
                Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#fff' });
                fetchData();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.response?.data?.message || 'Không thể xóa.', background: '#1e293b', color: '#fff' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.HoTen.trim()) {
            return Swal.fire({ icon: 'warning', title: 'Vui lòng nhập họ tên!', background: '#1e293b', color: '#fff' });
        }
        try {
            if (editId) {
                await axios.put(`/api/huong-dan-vien/${editId}`, form);
                Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#fff' });
            } else {
                await axios.post('/api/huong-dan-vien', form);
                Swal.fire({ icon: 'success', title: 'Thêm thành công!', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#fff' });
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.response?.data?.error || 'Có lỗi xảy ra.', background: '#1e293b', color: '#fff' });
        }
    };

    const filteredList = danhSach.filter(hdv =>
        hdv.HoTen?.toLowerCase().includes(timKiem.toLowerCase()) ||
        hdv.Email?.toLowerCase().includes(timKiem.toLowerCase()) ||
        hdv.SoDienThoai?.includes(timKiem)
    );

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post('/api/upload-image', formData);
            setForm(prev => ({ ...prev, AnhDaiDien: res.data.url }));
            Swal.fire({ icon: 'success', title: 'Đã tải ảnh!', timer: 1000, showConfirmButton: false, background: '#1e293b', color: '#fff' });
        } catch {
            Swal.fire({ icon: 'error', title: 'Lỗi tải ảnh!', background: '#1e293b', color: '#fff' });
        }
    };

    if (loading) return (
        <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse text-[10px]">ĐANG TRUY XUẤT HỆ THỐNG HDV...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Quản Lý <span className="text-cyan-400 font-bold">Hướng Dẫn Viên</span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm HDV..."
                                className="w-full bg-[#1e293b] border-slate-700 border pl-12 pr-4 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold group-hover:border-slate-600 shadow-inner"
                                value={timKiem}
                                onChange={(e) => setTimKiem(e.target.value)}
                            />
                        </div>
                        <button onClick={handleAdd} className="bg-cyan-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 active:scale-95 flex items-center gap-2">
                            <HiUserAdd size={20} /> <span className="hidden sm:inline">Thêm Mới</span>
                        </button>
                    </div>
                </div>

                {/* Grid Grid */}
                {filteredList.length === 0 ? (
                    <div className="text-center py-40 opacity-20">
                        <HiIdentification size={80} className="mx-auto mb-4" />
                        <p className="font-black text-white uppercase tracking-[0.4em] text-lg">Hệ thống HDV trống</p>
                        <p className="text-sm mt-1 uppercase tracking-widest font-bold">Thoát tìm kiếm hoặc thêm mới HDV</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredList.map((hdv) => (
                            <div key={hdv.MaHDV} className="bg-[#1e293b] rounded-[2rem] shadow-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden relative">
                                <div className="absolute top-4 right-4 z-10">
                                    {hdv.TrangThai ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Sẵn sàng
                                        </span>
                                    ) : (
                                        <span className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg border border-rose-500/20 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Ngừng nghỉ
                                        </span>
                                    )}
                                </div>

                                <div className="h-40 bg-gradient-to-br from-cyan-600/20 to-indigo-600/20 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    {hdv.AnhDaiDien ? (
                                        <img src={hdv.AnhDaiDien} alt={hdv.HoTen} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-800 shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-[2rem] bg-slate-800 flex items-center justify-center text-3xl font-black text-cyan-400 border-4 border-slate-700 shadow-2xl">
                                            {hdv.HoTen?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 text-center space-y-4">
                                    <div>
                                        <h3 className="font-black text-white text-lg group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter line-clamp-1">{hdv.HoTen}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Mã số: HDV-{hdv.MaHDV.toString().padStart(4, '0')}</p>
                                    </div>

                                    <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/30 text-[11px] font-bold">
                                        <div className="flex items-center gap-3 text-slate-400 truncate">
                                            <HiPhone className="text-cyan-500" /> {hdv.SoDienThoai || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 truncate">
                                            <HiMail className="text-cyan-500" /> {hdv.Email || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => handleEdit(hdv)} className="flex-1 bg-slate-900 hover:bg-cyan-600 hover:text-white text-cyan-500 border border-cyan-500/20 p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                            <HiPencilAlt size={14} /> Sửa
                                        </button>
                                        <button onClick={() => handleDelete(hdv.MaHDV, hdv.HoTen)} className="flex-1 bg-slate-900 hover:bg-rose-600 hover:text-white text-rose-500 border border-rose-500/20 p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                            <HiTrash size={14} /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-700 border-t-cyan-500/30 overflow-hidden">
                        <div className="p-8 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                {editId ? '🛠️ Cập nhật' : '✨ Thêm mới'} <span className="text-cyan-400">HDV</span>
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Họ và Tên HDV *</label>
                                    <div className="relative group">
                                        <HiIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                                        <input type="text" value={form.HoTen} onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
                                            className="w-full bg-slate-900 border-slate-700 border pl-12 pr-4 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold group-hover:border-slate-600"
                                            placeholder="Nhập họ tên đầy đủ..." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Số điện thoại</label>
                                        <input type="text" value={form.SoDienThoai} onChange={(e) => setForm({ ...form, SoDienThoai: e.target.value })}
                                            className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold group-hover:border-slate-600"
                                            placeholder="09xxx..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email liên hệ</label>
                                        <input type="email" value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })}
                                            className="w-full bg-slate-900 border-slate-700 border p-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold group-hover:border-slate-600"
                                            placeholder="email@..." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tiểu sử tóm tắt</label>
                                    <textarea value={form.TieuSu} onChange={(e) => setForm({ ...form, TieuSu: e.target.value })}
                                        className="w-full bg-slate-900 border-slate-700 border p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold group-hover:border-slate-600 h-24 resize-none"
                                        placeholder="Mô tả ngắn gọn kinh nghiệm..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hình ảnh đại diện</label>
                                    <div className="flex items-center gap-4 p-4 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-3xl group-hover:border-cyan-500/50 transition-colors">
                                        {form.AnhDaiDien ? (
                                            <img src={form.AnhDaiDien} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-xl" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                                                <HiCloudUpload size={24} />
                                            </div>
                                        )}
                                        <label className="flex-1 cursor-pointer">
                                            <span className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all shadow-lg inline-block">Chọn ảnh đại diện mới</span>
                                            <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <HiCheckCircle className={form.TrangThai ? 'text-emerald-500' : 'text-slate-600'} size={20} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái công tác</span>
                                    </div>
                                    <button type="button" onClick={() => setForm({ ...form, TrangThai: !form.TrangThai })}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${form.TrangThai ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${form.TrangThai ? 'translate-x-7' : ''}`}></span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 px-8 py-3.5 border border-slate-700 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-slate-500 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit"
                                    className="flex-1 px-8 py-3.5 bg-cyan-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 active:scale-95">
                                    {editId ? 'Lưu thay đổi' : 'Tạo mới'}
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
