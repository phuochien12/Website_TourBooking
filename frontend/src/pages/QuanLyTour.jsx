import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // [ĐỒNG BỘ] Popup đẹp cho Admin

function QuanLyTour() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal Tour (Thêm/Sửa Tour)
    const [editingTour, setEditingTour] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        TenTour: '', AnhBia: '', GiaGoc: '', PhanTramGiamGia: 0, MoTa: '', ThoiGian: '', DiemKhoiHanh: '', MaLoai: '', LichTrinh: []
    });
    const [categories, setCategories] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('image', file);

        axios.post('/api/upload-image', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => {
                if (res.data.success) {
                    setFormData({ ...formData, AnhBia: res.data.url });
                }
            })
            .catch(err => {
                // [ĐỒNG BỘ] Thông báo lỗi upload ảnh
                Swal.fire({ icon: 'error', title: 'Lỗi upload ảnh!', text: err.response?.data?.message || err.message, confirmButtonColor: '#dc2626' });
            })
            .finally(() => setIsUploading(false));
    };

    // State cho Modal Lịch Khởi Hành
    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedTourForSchedule, setSelectedTourForSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [danhSachHDV, setDanhSachHDV] = useState([]); // Danh sách Hướng Dẫn Viên
    const [newSchedule, setNewSchedule] = useState({
        NgayKhoiHanh: '', NgayVe: '', SoChoToiDa: 20, GiaTourHienTai: 0, MaHDV: ''
    });

    const fetchToursAndCategories = () => {
        // Lấy danh sách tour
        axios.get('/api/tours')
            .then(res => {
                setTours(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));

        // Lấy danh sách danh mục
        axios.get('/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error("Lỗi lấy danh mục:", err));
    };

    useEffect(() => {
        fetchToursAndCategories();
    }, []);

    // ----------------------------------------------------
    // XỬ LÝ LỊCH KHỞI HÀNH (NEW FEATURE)
    // ----------------------------------------------------
    const openScheduleModal = (tour) => {
        setSelectedTourForSchedule(tour);
        // Set giá mặc định cho form thêm lịch
        setNewSchedule({
            NgayKhoiHanh: '',
            NgayVe: '',
            SoChoToiDa: 20,
            GiaTourHienTai: tour.GiaGoc, // Mặc định lấy giá gốc
            MaHDV: '' // Mặc định chưa chọn HDV
        });

        // Load danh sách lịch hiện có
        axios.get(`/api/admin/schedules/${tour.MaTour}`)
            .then(res => setSchedules(res.data))
            .catch(err => console.error(err));

        // Load danh sách Hướng Dẫn Viên đang hoạt động
        axios.get('/api/huong-dan-vien')
            .then(res => setDanhSachHDV(res.data.filter(hdv => hdv.TrangThai)))
            .catch(err => console.error('Lỗi lấy danh sách HDV:', err));

        setShowSchedule(true);
    };

    const handleAddSchedule = (e) => {
        e.preventDefault();
        axios.post('/api/admin/schedules', { ...newSchedule, MaTour: selectedTourForSchedule.MaTour })
            .then(() => {
                // [ĐỒNG BỘ] Thông báo thêm lịch thành công
                Swal.fire({ icon: 'success', title: 'Thêm lịch thành công!', timer: 1200, showConfirmButton: false });
                // Reload lại list lịch
                axios.get(`/api/admin/schedules/${selectedTourForSchedule.MaTour}`)
                    .then(res => setSchedules(res.data));
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.message, confirmButtonColor: '#dc2626' }));
    };

    // [MỚI] Hủy lịch khởi hành do sự cố (Admin)
    const handleCancelSchedule = async (sch) => {
        const hasBookings = sch.SoChoDaDat > 0;
        const { value: reason } = await Swal.fire({
            title: hasBookings ? 'Hủy lịch & Hoàn tiền?' : 'Xác nhận Hủy lịch?',
            html: hasBookings 
                ? `Bạn đang thực hiện hủy toàn bộ chuyến đi ngày <b>${new Date(sch.NgayKhoiHanh).toLocaleDateString('vi-VN')}</b>.<br/>Hệ thống sẽ tự động hủy đơn và gửi email thông báo hoàn tiền 100% cho <b>${sch.SoChoDaDat} khách hàng</b>.`
                : `Lịch ngày <b>${new Date(sch.NgayKhoiHanh).toLocaleDateString('vi-VN')}</b> sẽ được chuyển sang trạng thái <b>Đã hủy</b> và không còn hiển thị cho khách hàng.`,
            icon: 'warning',
            input: 'text',
            inputLabel: 'Lý do hủy (Sẽ gửi trong email cho khách nếu có)',
            inputPlaceholder: 'VD: Do bão đổ bộ tại điểm đến...',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#6b7280',
            confirmButtonText: hasBookings ? 'Xác nhận Hủy & Hoàn tiền' : 'Xác nhận Hủy Lịch',
            cancelButtonText: 'Quay lại',
            inputValidator: (value) => {
                if (hasBookings && !value) return 'Bạn cần nhập lý do để khách hàng thông cảm!';
            }
        });

        if (reason !== undefined) {
             // can be empty string if hasBookings is false, that's fine
            Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            axios.put(`/api/admin/schedules/cancel/${sch.MaLich}`, { lyDoHuy: reason || "Admin chủ động hủy" })
                .then(res => {
                    Swal.fire('Thành công!', res.data.message, 'success');
                    // Reload lại list lịch
                    axios.get(`/api/admin/schedules/${selectedTourForSchedule.MaTour}`)
                        .then(res => setSchedules(res.data));
                })
                .catch(err => Swal.fire('Lỗi!', err.response?.data?.message || err.message, 'error'));
        }
    };

    // [ĐỒNG BỘ] Dùng SweetAlert2 thay vì window.confirm
    const handleDeleteSchedule = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa lịch này?',
            text: 'Bạn có chắc muốn xóa lịch khởi hành này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Giữ lại'
        });
        if (!result.isConfirmed) return;

        axios.delete(`/api/admin/schedules/${id}`)
            .then(() => {
                setSchedules(schedules.filter(s => s.MaLich !== id));
                Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1000, showConfirmButton: false });
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.response?.data?.message || err.message, confirmButtonColor: '#dc2626' }));
    };


    // ----------------------------------------------------
    // XỬ LÝ TOUR (CŨ)
    // ----------------------------------------------------
    // [ĐỒNG BỘ] Dùng SweetAlert2 thay vì window.confirm và alert
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa Tour này?',
            html: 'Bạn có chắc muốn xóa Tour này?<br/><b>Các lịch trình liên quan cũng sẽ bị xóa!</b>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '🗑️ Xóa luôn',
            cancelButtonText: 'Giữ lại'
        });
        if (!result.isConfirmed) return;

        axios.delete(`/api/admin/tours/${id}`)
            .then(() => {
                Swal.fire({ icon: 'success', title: 'Đã xóa thành công!', timer: 1200, showConfirmButton: false });
                fetchToursAndCategories();
            })
            .catch(err => Swal.fire({ 
                icon: 'error', 
                title: 'Không thể xóa!', 
                text: err.response?.data?.message || "Đã có lỗi xảy ra khi xóa tour này.", 
                confirmButtonColor: '#dc2626' 
            }));
    };

    const handleEdit = (tour) => {
        setEditingTour(tour);
        // [QUAN TRỌNG]: Gọi API lấy đầy đủ thông tin chi tiết tour để có mảng Lịch Trình hiện tại
        axios.get(`/api/tours/${tour.MaTour}`)
            .then(res => {
                const tourDetail = res.data;
                setFormData({
                    TenTour: tourDetail.TenTour || '',
                    AnhBia: tourDetail.AnhBia || '',
                    GiaGoc: tourDetail.GiaGoc || 0,
                    PhanTramGiamGia: tourDetail.PhanTramGiamGia || 0,
                    MoTa: tourDetail.MoTa || '',
                    ThoiGian: tourDetail.ThoiGian || '',
                    DiemKhoiHanh: tourDetail.DiemKhoiHanh || '',
                    MaLoai: tourDetail.MaLoai || '',
                    LichTrinh: tourDetail.LichTrinh || [] // Đưa mảng lịch trình vào form
                });
                setShowForm(true);
            })
            .catch(err => {
                console.error("Lỗi lấy chi tiết tour:", err);
                Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Không thể lấy thông tin chi tiết tour!', confirmButtonColor: '#dc2626' });
            });
    };

    const handleAddNew = () => {
        setEditingTour(null);
        setFormData({ TenTour: '', AnhBia: '', GiaGoc: '', PhanTramGiamGia: 0, MoTa: '', ThoiGian: '', DiemKhoiHanh: '', MaLoai: '', LichTrinh: [] });
        fetchToursAndCategories(); // Lấy lại danh sách danh mục để chắc chắn có dữ liệu
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingTour) {
            axios.put(`/api/admin/tours/${editingTour.MaTour}`, formData)
                .then(() => {
                    Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1200, showConfirmButton: false });
                    setShowForm(false);
                    fetchToursAndCategories();
                })
                .catch(err => Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.message, confirmButtonColor: '#dc2626' }));
        } else {
            axios.post('/api/admin/tours', formData)
                .then(() => {
                    Swal.fire({ icon: 'success', title: 'Thêm mới thành công!', timer: 1200, showConfirmButton: false });
                    setShowForm(false);
                    fetchToursAndCategories();
                })
                .catch(err => Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.message, confirmButtonColor: '#dc2626' }));
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
                
                {/* --- HEADER --- */}
                <div className="p-8 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Quản Lý <span className="text-emerald-400 font-bold">Danh Sách Tour</span>
                        </h1>
                    </div>
                    <button onClick={handleAddNew} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center gap-2">
                        <span className="text-xl">+</span> Thêm Tour Mới
                    </button>
                </div>

                {/* --- MODAL 1: FORM THÊM/SỬA TOUR (Dark Glassmorphism) --- */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-slate-700 shadow-emerald-500/10 border-t-emerald-500/30">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    {editingTour ? '🚀 Cập Nhật' : '✨ Thêm Mới'} <span className="text-emerald-400">Tour Việt</span>
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Tên Tour Hiển Thị</label>
                                    <input required className="w-full bg-slate-900 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold" value={formData.TenTour} onChange={e => setFormData({ ...formData, TenTour: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Loại Tour</label>
                                        <select className="w-full bg-slate-900 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold" value={formData.MaLoai} onChange={e => setFormData({ ...formData, MaLoai: e.target.value })}>
                                            <option value="" className="bg-slate-900">-- Chọn Loại Tour --</option>
                                            {categories.map(cat => (
                                                <option key={cat.MaLoai} value={cat.MaLoai} className="bg-slate-900">{cat.TenLoai}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Thời Gian (VD: 3N2Đ)</label>
                                        <select required className="w-full bg-slate-900 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold" value={formData.ThoiGian} onChange={e => setFormData({ ...formData, ThoiGian: e.target.value })}>
                                            <option value="" className="bg-slate-900">-- Chọn Thời Gian --</option>
                                            <option value="Trong Ngày" className="bg-slate-900">Trong Ngày</option>
                                            <option value="2 Day 1 Night" className="bg-slate-900">2 Ngày 1 Đêm</option>
                                            <option value="3 Day 2 Night" className="bg-slate-900">3 Ngày 2 Đêm</option>
                                            <option value="4 Day 3 Night" className="bg-slate-900">4 Ngày 3 Đêm</option>
                                            <option value="5 Day 4 Night" className="bg-slate-900">5 Ngày 4 Đêm</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Giá Gốc (VNĐ)</label>
                                        <input type="number" required className="w-full bg-slate-900 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold" value={formData.GiaGoc} onChange={e => setFormData({ ...formData, GiaGoc: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1 pl-1 italic">Ưu đãi giảm giá (%)</label>
                                        <select className="w-full bg-slate-900 border-rose-900/30 border p-3 rounded-2xl text-rose-400 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-black" value={formData.PhanTramGiamGia} onChange={e => setFormData({ ...formData, PhanTramGiamGia: parseInt(e.target.value) })}>
                                            <option value={0} className="bg-slate-900">Không giảm giá (0%)</option>
                                            {[...Array(20)].map((_, i) => {
                                                const discount = (i + 1) * 5;
                                                return <option key={discount} value={discount} className="bg-slate-900 font-bold">🎁 Giảm {discount}%</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Điểm Khởi Hành</label>
                                    <div className="flex flex-col gap-3">
                                        <select
                                            className="w-full bg-slate-900 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                                            value={['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Phú Quốc', 'Đà Lạt', 'Hải Phòng'].includes(formData.DiemKhoiHanh) ? formData.DiemKhoiHanh : 'Khác'}
                                            onChange={(e) => {
                                                if (e.target.value === 'Khác') {
                                                    setFormData({ ...formData, DiemKhoiHanh: '' });
                                                } else {
                                                    setFormData({ ...formData, DiemKhoiHanh: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="TP. Hồ Chí Minh" className="bg-slate-900">TP. Hồ Chí Minh</option>
                                            <option value="Hà Nội" className="bg-slate-900">Hà Nội</option>
                                            <option value="Đà Nẵng" className="bg-slate-900">Đà Nẵng</option>
                                            <option value="Cần Thơ" className="bg-slate-900">Cần Thơ</option>
                                            <option value="Nha Trang" className="bg-slate-900">Nha Trang</option>
                                            <option value="Phú Quốc" className="bg-slate-900">Phú Quốc</option>
                                            <option value="Đà Lạt" className="bg-slate-900">Đà Lạt</option>
                                            <option value="Hải Phòng" className="bg-slate-900">Hải Phòng</option>
                                            <option value="Khác" className="bg-slate-900 text-emerald-400">--- Nhập tay điểm khác ---</option>
                                        </select>
                                        {(!['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Phú Quốc', 'Đà Lạt', 'Hải Phòng'].includes(formData.DiemKhoiHanh) || formData.DiemKhoiHanh === '') && (
                                            <input type="text" className="w-full bg-slate-900 border-emerald-900 border p-3 rounded-2xl text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold" placeholder="Nhập điểm khởi hành mong muốn..." value={formData.DiemKhoiHanh} onChange={e => setFormData({ ...formData, DiemKhoiHanh: e.target.value })} />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Ảnh Banner Tour</label>
                                    <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-900/50 p-6 border border-slate-700/50 rounded-3xl shadow-inner">
                                        <div className="flex-1 w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                            {isUploading && <p className="text-emerald-400 text-xs font-bold mt-2 animate-pulse">📤 ĐANG TẢI LÊN HỆ THỐNG...</p>}
                                        </div>
                                        {formData.AnhBia && (
                                            <div className="relative group/img overflow-hidden rounded-2xl border-2 border-emerald-500/30">
                                                <img src={formData.AnhBia} alt="Preview" className="h-[100px] w-[150px] object-cover transition-transform group-hover/img:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="text-[10px] font-black text-white">XEM TRƯỚC</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1">Mô Tả Tổng Quan (HTML)</label>
                                    <textarea rows="4" className="w-full bg-slate-900 border-slate-700 border p-4 rounded-3xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium leading-relaxed" placeholder="Nhập nội dung mô tả vắn tắt về tour..." value={formData.MoTa} onChange={e => setFormData({ ...formData, MoTa: e.target.value })}></textarea>
                                </div>

                                {/* --- THÊM KHUNG NHẬP LỊCH TRÌNH CHI TIẾT (Dark Mode) --- */}
                                <div className="border border-emerald-500/20 p-6 rounded-[2rem] bg-emerald-500/5 mt-8 shadow-inner">
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="text-sm font-black text-emerald-400 uppercase tracking-widest italic">🗺️ Lịch Trình Chi Tiết</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentLichTrinh = formData.LichTrinh || [];
                                                setFormData({
                                                    ...formData,
                                                    LichTrinh: [...currentLichTrinh, { NgayThu: currentLichTrinh.length + 1, TieuDe: '', ThoiGian: '', NoiDung: '' }]
                                                });
                                            }}
                                            className="bg-emerald-600/20 text-emerald-400 text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                        >
                                            + Thêm Ngày Mới
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {(formData.LichTrinh || []).map((item, index) => (
                                            <div key={index} className="bg-slate-900/60 p-5 rounded-3xl border border-slate-700/50 relative group/itinerary hover:border-emerald-500/30 transition-all">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newLichTrinh = [...formData.LichTrinh];
                                                        newLichTrinh.splice(index, 1);
                                                        setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                    }}
                                                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                                                >✕</button>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-6">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter block mb-1">Ngày Thứ</label>
                                                        <input type="number" min="1" className="w-full bg-slate-800 border-slate-700 border p-2 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" value={item.NgayThu} onChange={e => {
                                                            const newLichTrinh = [...formData.LichTrinh];
                                                            newLichTrinh[index].NgayThu = parseInt(e.target.value) || 1;
                                                            setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                        }} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter block mb-1">Thời gian</label>
                                                        <input type="text" placeholder="VD: 07:00..." className="w-full bg-slate-800 border-slate-700 border p-2 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" value={item.ThoiGian} onChange={e => {
                                                            const newLichTrinh = [...formData.LichTrinh];
                                                            newLichTrinh[index].ThoiGian = e.target.value;
                                                            setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                        }} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter block mb-1">Tiêu đề</label>
                                                        <input type="text" placeholder="VD: Tham quan..." className="w-full bg-slate-800 border-slate-700 border p-2 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" value={item.TieuDe} onChange={e => {
                                                            const newLichTrinh = [...formData.LichTrinh];
                                                            newLichTrinh[index].TieuDe = e.target.value;
                                                            setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                        }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter block mb-1">Chi tiết hoạt động</label>
                                                    <textarea rows="2" placeholder="Nội dung trải nghiệm..." className="w-full bg-slate-800 border-slate-700 border p-3 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium" value={item.NoiDung} onChange={e => {
                                                        const newLichTrinh = [...formData.LichTrinh];
                                                        newLichTrinh[index].NoiDung = e.target.value;
                                                        setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                    }}></textarea>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {(!formData.LichTrinh || formData.LichTrinh.length === 0) && (
                                        <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-3xl opacity-50">
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Cần thêm ít nhất 01 lịch trình ngày.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 mt-12 bg-slate-900/-50 p-6 rounded-3xl border border-slate-700/50">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 text-slate-400 font-bold hover:text-white transition-colors uppercase text-xs tracking-widest">Đóng</button>
                                    <button type="submit" className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-900/20">Lưu Thông Tin</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- MODAL 2: QUẢN LÝ LỊCH KHỞI HÀNH (Dark Mode) --- */}
                {showSchedule && selectedTourForSchedule && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-y-auto max-h-[90vh] border border-slate-700 border-t-cyan-500/30">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50">
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                    🗓️ Lịch trình: <span className="text-cyan-400">{selectedTourForSchedule.TenTour}</span>
                                </h2>
                                <button onClick={() => setShowSchedule(false)} className="text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* CỘT TRÁI: FORM THÊM LỊCH */}
                                <div className="lg:col-span-4 bg-slate-900/40 p-8 rounded-[2rem] border border-slate-700/50 shadow-inner">
                                    <h3 className="font-black mb-6 text-sm text-cyan-400 uppercase tracking-widest italic">✨ Tạo Chuyến Mới</h3>
                                    <form onSubmit={handleAddSchedule} className="space-y-5">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Khởi Hành</label>
                                            <input type="date" required className="w-full bg-slate-800 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
                                                value={newSchedule.NgayKhoiHanh} onChange={e => setNewSchedule({ ...newSchedule, NgayKhoiHanh: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Ngày Kết Thúc</label>
                                            <input type="date" required className="w-full bg-slate-800 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
                                                value={newSchedule.NgayVe} onChange={e => setNewSchedule({ ...newSchedule, NgayVe: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Giá Thực Tế (VNĐ)</label>
                                            <input type="number" required className="w-full bg-slate-800 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
                                                value={newSchedule.GiaTourHienTai} onChange={e => setNewSchedule({ ...newSchedule, GiaTourHienTai: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Hướng Dẫn Viên</label>
                                            <select className="w-full bg-slate-800 border-slate-700 border p-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
                                                value={newSchedule.MaHDV} onChange={e => setNewSchedule({ ...newSchedule, MaHDV: e.target.value })}>
                                                <option value="" className="bg-slate-900">-- Chỉ định HDV --</option>
                                                {danhSachHDV.map(hdv => (
                                                    <option key={hdv.MaHDV} value={hdv.MaHDV} className="bg-slate-900">{hdv.HoTen}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-950/20 active:scale-95 mt-4">
                                            🚀 PHÁT HÀNH LỊCH
                                        </button>
                                    </form>
                                </div>

                                {/* CỘT PHẢI: DANH SÁCH LỊCH */}
                                <div className="lg:col-span-8 overflow-hidden flex flex-col">
                                    <h3 className="font-black mb-6 text-sm text-slate-500 uppercase tracking-widest italic pr-4">📋 LỊCH KHỞI HÀNH HIỆN TẠI</h3>
                                    <div className="overflow-x-auto rounded-3xl border border-slate-700/50 shadow-inner bg-slate-900/40">
                                        <table className="min-w-full border-collapse">
                                            <thead className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <tr className="border-b border-slate-700">
                                                    <th className="p-4">Ngày Đi</th>
                                                    <th className="p-4">Giá Vé</th>
                                                    <th className="p-4">HDV</th>
                                                    <th className="p-4">Tình Trạng</th>
                                                    <th className="p-4 text-center">Hành Động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {schedules.map(sch => (
                                                    <tr key={sch.MaLich} className="hover:bg-cyan-500/5 transition-all group">
                                                        <td className="p-4 text-sm font-bold text-slate-300">
                                                            {new Date(sch.NgayKhoiHanh).toLocaleDateString('vi-VN')}
                                                            <p className="text-[10px] font-medium text-slate-500 italic">Về: {new Date(sch.NgayVe).toLocaleDateString('vi-VN')}</p>
                                                        </td>
                                                        <td className="p-4 text-sm font-black text-cyan-400">
                                                            {new Intl.NumberFormat('vi-VN').format(sch.GiaTourHienTai)}đ
                                                        </td>
                                                        <td className="p-4 text-xs font-bold">
                                                            {sch.TenHDV ? (
                                                                <span className="text-emerald-400">👤 {sch.TenHDV}</span>
                                                            ) : (
                                                                <span className="text-slate-500 italic opacity-50">Trống</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-xs font-bold text-slate-400">
                                                            {sch.SoChoDaDat} / <span className="text-slate-500">{sch.SoChoToiDa}</span> khách
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex justify-center gap-2">
                                                                {sch.TrangThai === 'Đã hủy' || sch.TrangThai === 'Hủy' ? (
                                                                    <span className="text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">❌ Đã hủy</span>
                                                                ) : new Date(sch.NgayKhoiHanh) < new Date().setHours(0,0,0,0) ? (
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 w-full text-center">Done</span>
                                                                        <button onClick={() => handleDeleteSchedule(sch.MaLich)} className="text-[10px] text-slate-600 hover:text-rose-400 underline transition-colors">Xóa cũ</button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col gap-2 w-full max-w-[120px]">
                                                                        {sch.SoChoDaDat === 0 && (
                                                                            <button onClick={() => handleDeleteSchedule(sch.MaLich)} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-white transition-all">🗑️ Xóa hẳn</button>
                                                                        )}
                                                                        <button 
                                                                            onClick={() => handleCancelSchedule(sch)}
                                                                            className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-rose-500 transition-all shadow-lg shadow-rose-950/20 active:scale-95"
                                                                        >
                                                                            ❌ {sch.SoChoDaDat > 0 ? 'DỪNG & HOÀN' : 'NGỪNG CHẠY'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {schedules.length === 0 && <tr><td colSpan="5" className="p-12 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-50">Không có lịch nào được công bố.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- DANH SÁCH TOUR CHÍNH (Dark Theme Design) --- */}
                <div className="p-0 md:p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse">ĐANG TRUY XUẤT HỆ THỐNG...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-3xl border border-slate-700/50 shadow-sm bg-slate-900/20">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/80 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-700">
                                        <th className="p-6 text-center w-20">Mã</th>
                                        <th className="p-6 w-32">Ảnh bìa</th>
                                        <th className="p-6">Thông tin chi tiết tour</th>
                                        <th className="p-6 text-center w-48">Điều phối lịch</th>
                                        <th className="p-6 text-center w-48">Quản trị</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {tours.map(tour => (
                                        <tr key={tour.MaTour} className="hover:bg-emerald-500/5 transition-all duration-300 group">
                                            <td className="p-6 text-center font-black text-slate-500 group-hover:text-emerald-400">#{tour.MaTour}</td>
                                            <td className="p-6">
                                                <div className="relative w-24 h-16 rounded-xl overflow-hidden shadow-lg border border-slate-700 group-hover:scale-110 transition-transform">
                                                    <img src={tour.AnhBia} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <h4 className="font-black text-lg text-white mb-1 uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors">{tour.TenTour}</h4>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">⏱️ {tour.ThoiGian}</span>
                                                    <span className="text-sm font-black text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">{new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ</span>
                                                    {tour.PhanTramGiamGia > 0 && (
                                                        <span className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-rose-500/20 scale-90">🔥-{tour.PhanTramGiamGia}%</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase mt-2 group-hover:text-slate-400 transition-colors">📍 {tour.DiemKhoiHanh}</p>
                                            </td>
                                            <td className="p-6">
                                                <button onClick={() => openScheduleModal(tour)} className="w-full bg-slate-800 text-cyan-400 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all border border-cyan-500/20 shadow-lg shadow-cyan-900/10 active:scale-95">
                                                    📅 Xem Lịch
                                                </button>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => handleEdit(tour)} className="bg-amber-600/20 text-amber-400 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all border border-amber-600/20 flex-1">Sửa</button>
                                                    <button onClick={() => handleDelete(tour.MaTour)} className="bg-rose-600/20 text-rose-400 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-600/20 flex-1">Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {tours.length === 0 && (
                                <div className="text-center py-20 opacity-30">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="font-black text-white uppercase tracking-widest">HỆ THỐNG TRỐNG</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}

export default QuanLyTour;
