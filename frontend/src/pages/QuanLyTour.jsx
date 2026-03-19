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
        const { value: reason } = await Swal.fire({
            title: 'Hủy lịch & Hoàn tiền?',
            html: `Bạn đang thực hiện hủy toàn bộ chuyến đi ngày <b>${new Date(sch.NgayKhoiHanh).toLocaleDateString('vi-VN')}</b>.<br/>Hệ thống sẽ tự động hủy đơn và gửi email thông báo hoàn tiền 100% cho <b>${sch.SoChoDaDat} khách hàng</b>.`,
            icon: 'warning',
            input: 'text',
            inputLabel: 'Lý do hủy (Sẽ gửi trong email cho khách)',
            inputPlaceholder: 'VD: Do bão đổ bộ tại điểm đến...',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xác nhận Hủy & Hoàn tiền',
            cancelButtonText: 'Quay lại',
            inputValidator: (value) => {
                if (!value) return 'Bạn cần nhập lý do để khách hàng thông cảm!';
            }
        });

        if (reason) {
            Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            axios.put(`/api/admin/schedules/cancel/${sch.MaLich}`, { lyDoHuy: reason })
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
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="container mx-auto bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-800">Quản Lý Danh Sách Tour</h1>
                    <button onClick={handleAddNew} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
                        + Thêm Tour Mới
                    </button>
                </div>

                {/* --- MODAL 1: FORM THÊM/SỬA TOUR --- */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-xl font-bold mb-4">{editingTour ? 'Cập Nhật Tour' : 'Thêm Tour Mới'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Tên Tour</label><input required className="w-full border p-2 rounded" value={formData.TenTour} onChange={e => setFormData({ ...formData, TenTour: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Loại Tour (Danh Mục)</label>
                                        <select className="w-full border p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.MaLoai} onChange={e => setFormData({ ...formData, MaLoai: e.target.value })}>
                                            <option value="">-- Chọn Loại Tour --</option>
                                            {categories.map(cat => (
                                                <option key={cat.MaLoai} value={cat.MaLoai}>{cat.TenLoai}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Thời Gian (VD: 3N2Đ)</label>
                                        <select required className="w-full border p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.ThoiGian} onChange={e => setFormData({ ...formData, ThoiGian: e.target.value })}>
                                            <option value="">-- Chọn Thời Gian --</option>
                                            <option value="Trong Ngày">Trong Ngày</option>
                                            <option value="2 Ngày 1 Đêm">2 Ngày 1 Đêm</option>
                                            <option value="3 Ngày 2 Đêm">3 Ngày 2 Đêm</option>
                                            <option value="4 Ngày 3 Đêm">4 Ngày 3 Đêm</option>
                                            <option value="5 Ngày 4 Đêm">5 Ngày 4 Đêm</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Giá Gốc</label><input type="number" required className="w-full border p-2 rounded" value={formData.GiaGoc} onChange={e => setFormData({ ...formData, GiaGoc: e.target.value })} /></div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-red-600">Phần Trăm Giảm Giá (%)</label>
                                        <select className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 font-bold" value={formData.PhanTramGiamGia} onChange={e => setFormData({ ...formData, PhanTramGiamGia: parseInt(e.target.value) })}>
                                            <option value={0}>Không giảm giá (0%)</option>
                                            {[...Array(20)].map((_, i) => {
                                                const discount = (i + 1) * 5; // 5%, 10%, 15% ... 100%
                                                return <option key={discount} value={discount}>Giảm {discount}%</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Điểm Khởi Hành</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full border p-2 rounded"
                                            value={['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Phú Quốc', 'Đà Lạt', 'Hải Phòng'].includes(formData.DiemKhoiHanh) ? formData.DiemKhoiHanh : 'Khác'}
                                            onChange={(e) => {
                                                if (e.target.value === 'Khác') {
                                                    setFormData({ ...formData, DiemKhoiHanh: '' });
                                                } else {
                                                    setFormData({ ...formData, DiemKhoiHanh: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                            <option value="Hà Nội">Hà Nội</option>
                                            <option value="Đà Nẵng">Đà Nẵng</option>
                                            <option value="Cần Thơ">Cần Thơ</option>
                                            <option value="Nha Trang">Nha Trang</option>
                                            <option value="Phú Quốc">Phú Quốc</option>
                                            <option value="Đà Lạt">Đà Lạt</option>
                                            <option value="Hải Phòng">Hải Phòng</option>
                                            <option value="Khác">Khác (Nhập tay)...</option>
                                        </select>
                                    </div>
                                    {(!['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Phú Quốc', 'Đà Lạt', 'Hải Phòng'].includes(formData.DiemKhoiHanh) || formData.DiemKhoiHanh === '') && (
                                        <input type="text" className="w-full border p-2 rounded mt-2" placeholder="Nhập điểm khởi hành khác..." value={formData.DiemKhoiHanh} onChange={e => setFormData({ ...formData, DiemKhoiHanh: e.target.value })} />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Ảnh Bìa (Tải lên từ máy tính)</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full border p-2 rounded bg-white"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                        {isUploading && <span className="text-blue-500 font-bold whitespace-nowrap animate-pulse mt-1">Đang tải lên...</span>}
                                    </div>
                                    {formData.AnhBia && (
                                        <div className="mt-3">
                                            <img src={formData.AnhBia} alt="Preview" className="h-[120px] object-cover rounded shadow-md border" />
                                            <p className="text-xs text-gray-400 mt-1">File: {formData.AnhBia}</p>
                                        </div>
                                    )}
                                </div>

                                <div><label className="block text-sm font-bold mb-1">Mô Tả Chi Tiết (HTML)</label><textarea rows="4" className="w-full border p-2 rounded" value={formData.MoTa} onChange={e => setFormData({ ...formData, MoTa: e.target.value })}></textarea></div>

                                {/* --- THÊM KHUNG NHẬP LỊCH TRÌNH CHI TIẾT --- */}
                                <div className="border border-blue-200 p-4 rounded bg-blue-50 mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-md font-bold text-blue-800">Lịch Trình Chi Tiết (Từng ngày)</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentLichTrinh = formData.LichTrinh || [];
                                                setFormData({
                                                    ...formData,
                                                    LichTrinh: [...currentLichTrinh, { NgayThu: currentLichTrinh.length + 1, TieuDe: '', ThoiGian: '', NoiDung: '' }]
                                                });
                                            }}
                                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded font-bold hover:bg-blue-700 shadow-sm"
                                        >
                                            + Thêm Ngày Mới
                                        </button>
                                    </div>

                                    {(formData.LichTrinh || []).map((item, index) => (
                                        <div key={index} className="mb-4 border p-3 rounded bg-white relative shadow-sm">
                                            {/* Nút Xóa Ngày */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newLichTrinh = [...formData.LichTrinh];
                                                    newLichTrinh.splice(index, 1);
                                                    setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                }}
                                                className="absolute top-2 right-2 text-red-500 hover:text-white font-bold bg-red-100 hover:bg-red-500 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors"
                                                title="Xóa ngày này"
                                            >
                                                ✕
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 pr-8">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-700">Ngày Thứ (Số)</label>
                                                    <input type="number" min="1" className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" value={item.NgayThu} onChange={e => {
                                                        const newLichTrinh = [...formData.LichTrinh];
                                                        newLichTrinh[index].NgayThu = parseInt(e.target.value) || 1;
                                                        setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                    }} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-700">Thời gian (VD: 07:00 - 08:00)</label>
                                                    <input type="text" placeholder="Ghi thời gian..." className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" value={item.ThoiGian} onChange={e => {
                                                        const newLichTrinh = [...formData.LichTrinh];
                                                        newLichTrinh[index].ThoiGian = e.target.value;
                                                        setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                    }} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-700">Tiêu đề (VD: Tham quan đảo)</label>
                                                    <input type="text" placeholder="Tiêu đề hoạt động..." className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" value={item.TieuDe} onChange={e => {
                                                        const newLichTrinh = [...formData.LichTrinh];
                                                        newLichTrinh[index].TieuDe = e.target.value;
                                                        setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                    }} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-700">Nội dung chi tiết từng hoạt động</label>
                                                <textarea rows="2" placeholder="Nhập chi tiết về chuyến đi..." className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" value={item.NoiDung} onChange={e => {
                                                    const newLichTrinh = [...formData.LichTrinh];
                                                    newLichTrinh[index].NoiDung = e.target.value;
                                                    setFormData({ ...formData, LichTrinh: newLichTrinh });
                                                }}></textarea>
                                            </div>
                                        </div>
                                    ))}
                                    {(!formData.LichTrinh || formData.LichTrinh.length === 0) && (
                                        <div className="text-sm text-gray-500 italic text-center py-4 bg-white rounded border border-dashed">
                                            Chưa có lịch trình nào. Bấm <b>"+ Thêm Ngày Mới"</b> để thêm chi tiết.
                                        </div>
                                    )}
                                </div>
                                {/* ---------------------------------------- */}

                                <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Lưu Thông Tin</button></div>
                            </form>
                        </div>
                    </div>
                )
                }

                {/* --- MODAL 2: QUẢN LÝ LỊCH KHỞI HÀNH (NEW) --- */}
                {
                    showSchedule && selectedTourForSchedule && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-blue-800">Lịch Chạy: {selectedTourForSchedule.TenTour}</h2>
                                    <button onClick={() => setShowSchedule(false)} className="text-red-500 font-bold text-xl">&times;</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* CỘT TRÁI: FORM THÊM LỊCH */}
                                    <div className="bg-gray-50 p-4 rounded border">
                                        <h3 className="font-bold mb-3 text-lg">📅 Thêm Lịch Mới</h3>
                                        <form onSubmit={handleAddSchedule} className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-bold">Ngày Khởi Hành</label>
                                                <input type="date" required className="w-full p-2 border rounded"
                                                    value={newSchedule.NgayKhoiHanh} onChange={e => setNewSchedule({ ...newSchedule, NgayKhoiHanh: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold">Ngày Về</label>
                                                <input type="date" required className="w-full p-2 border rounded"
                                                    value={newSchedule.NgayVe} onChange={e => setNewSchedule({ ...newSchedule, NgayVe: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold">Giá Vé (VND)</label>
                                                <input type="number" required className="w-full p-2 border rounded"
                                                    value={newSchedule.GiaTourHienTai} onChange={e => setNewSchedule({ ...newSchedule, GiaTourHienTai: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold">Hướng Dẫn Viên</label>
                                                <select className="w-full p-2 border rounded bg-white"
                                                    value={newSchedule.MaHDV} onChange={e => setNewSchedule({ ...newSchedule, MaHDV: e.target.value })}>
                                                    <option value="">-- Chưa gán HDV --</option>
                                                    {danhSachHDV.map(hdv => (
                                                        <option key={hdv.MaHDV} value={hdv.MaHDV}>{hdv.HoTen}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                                                + Lưu Lịch Này
                                            </button>
                                        </form>
                                    </div>

                                    {/* CỘT PHẢI: DANH SÁCH LỊCH */}
                                    <div className="md:col-span-2">
                                        <h3 className="font-bold mb-3 text-lg">Danh Sách Các Ngày Khởi Hành</h3>
                                        <div className="overflow-x-auto border rounded">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="p-2 border">Ngày Đi</th>
                                                        <th className="p-2 border">Ngày Về</th>
                                                        <th className="p-2 border">Giá Vé</th>
                                                        <th className="p-2 border">Hướng Dẫn Viên</th>
                                                        <th className="p-2 border">Đã Đặt</th>
                                                        <th className="p-2 border">Xóa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schedules.map(sch => (
                                                        <tr key={sch.MaLich} className="border-t hover:bg-gray-50 text-center">
                                                            <td className="p-2">{new Date(sch.NgayKhoiHanh).toLocaleDateString('vi-VN')}</td>
                                                            <td className="p-2">{new Date(sch.NgayVe).toLocaleDateString('vi-VN')}</td>
                                                            <td className="p-2 font-medium text-red-600">
                                                                {new Intl.NumberFormat('vi-VN').format(sch.GiaTourHienTai)}
                                                            </td>
                                                            <td className="p-2 text-sm">
                                                                {sch.TenHDV ? (
                                                                    <span className="text-green-700 font-semibold">{sch.TenHDV}</span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">Chưa gán</span>
                                                                )}
                                                            </td>
                                                            <td className="p-2">{sch.SoChoDaDat} / {sch.SoChoToiDa}</td>
                                                            <td className="p-2">
                                                                {sch.TrangThai === 'Hủy' ? (
                                                                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-xs">ĐÃ HỦY</span>
                                                                ) : new Date(sch.NgayKhoiHanh) < new Date().setHours(0,0,0,0) ? (
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded text-[10px] uppercase">Đã kết thúc</span>
                                                                        <button onClick={() => handleDeleteSchedule(sch.MaLich)} className="text-xs text-red-400 hover:text-red-600 underline">Xóa lịch cũ</button>
                                                                    </div>
                                                                ) : sch.SoChoDaDat === 0 ? (
                                                                    <button onClick={() => handleDeleteSchedule(sch.MaLich)} className="text-red-500 hover:underline">Xóa</button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => handleCancelSchedule(sch)}
                                                                        className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-red-600 transition shadow-sm"
                                                                        title="Hủy cả đoàn và hoàn tiền"
                                                                    >
                                                                        HỦY & HOÀN TIỀN
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {schedules.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chưa có lịch nào.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* DANH SÁCH TOUR CHÍNH */}
                {
                    loading ? <p>Đang tải...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="border p-3 text-center w-16">ID</th>
                                        <th className="border p-3 w-32">Ảnh</th>
                                        <th className="border p-3">Tên Tour</th>
                                        <th className="border p-3 w-40">Quản Lý Lịch</th>
                                        <th className="border p-3 w-40">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tours.map(tour => (
                                        <tr key={tour.MaTour} className="hover:bg-gray-50 border-b">
                                            <td className="p-3 text-center">{tour.MaTour}</td>
                                            <td className="p-3"><img src={tour.AnhBia} alt="" className="w-20 h-16 object-cover rounded" /></td>
                                            <td className="p-3 font-medium text-blue-800">
                                                {tour.TenTour}<br />
                                                <span className="text-xs text-gray-500">{tour.ThoiGian} - {new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ</span>
                                                {tour.PhanTramGiamGia > 0 && (
                                                    <span className="ml-2 bg-red-100 text-red-600 px-1 py-0.5 rounded text-[10px] font-bold border border-red-200">-{tour.PhanTramGiamGia}%</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => openScheduleModal(tour)} className="bg-cyan-600 text-white px-3 py-1 rounded text-sm hover:bg-cyan-700 w-full shadow">
                                                    📅 Xem Lịch
                                                </button>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => handleEdit(tour)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Sửa</button>
                                                    <button onClick={() => handleDelete(tour.MaTour)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div >
        </div >
    );
}

export default QuanLyTour;
