import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function HoSo() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({
        HoTen: user?.HoTen || '',
        Email: user?.Email || '',
        SoDienThoai: user?.SoDienThoai || '',
        DiaChi: user?.DiaChi || '',
        AnhDaiDien: user?.AnhDaiDien || '',
        MatKhauMoi: '',
        XacNhanMatKhau: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // [Premium UI Check] - Đảm bảo giao diện hiện đại
    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 placeholder:text-white/20";
    const labelStyle = "block text-sm font-bold text-white/60 mb-2 ml-1 uppercase tracking-wider";

    // Xử lý tải ảnh đại diện lên Cloudinary
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra định dạng
        if (!file.type.startsWith('image/')) {
            return Swal.fire('Lỗi', 'Vui lòng chọn file hình ảnh!', 'error');
        }

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await axios.post('/api/upload-image', data);
            if (res.data.success) {
                setFormData({ ...formData, AnhDaiDien: res.data.url });
                Swal.fire({
                    icon: 'success',
                    title: 'Đã tải ảnh lên!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } catch (err) {
            Swal.fire('Lỗi', 'Không thể tải ảnh lên server!', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.MatKhauMoi && formData.MatKhauMoi !== formData.XacNhanMatKhau) {
            return Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Mật khẩu xác nhận không khớp!' });
        }

        setLoading(true);
        try {
            const res = await axios.put(`/api/admin/users/${user.MaNguoiDung}`, {
                HoTen: formData.HoTen,
                Email: formData.Email,
                SoDienThoai: formData.SoDienThoai,
                DiaChi: formData.DiaChi,
                AnhDaiDien: formData.AnhDaiDien,
                MatKhau: formData.MatKhauMoi || undefined
            });

            if (res.data.success) {
                // Cập nhật lại localStorage
                const newUser = { 
                    ...user, 
                    HoTen: formData.HoTen, 
                    Email: formData.Email, 
                    SoDienThoai: formData.SoDienThoai,
                    DiaChi: formData.DiaChi,
                    AnhDaiDien: formData.AnhDaiDien
                };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Thông tin cá nhân đã được cập nhật.',
                    timer: 2000,
                    showConfirmButton: false
                });
                // Reload trang sau 2s để cập nhật Header
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: err.response?.data?.message || 'Không thể cập nhật thông tin!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Side: Avatar Card */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 text-center sticky top-32">
                            <div className="relative inline-block mb-6 group">
                                <div className="w-32 h-32 rounded-full border-4 border-primary/30 p-1 relative overflow-hidden">
                                    {uploading ? (
                                        <div className="w-full h-full rounded-full bg-navy/50 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <>
                                            {formData.AnhDaiDien ? (
                                                <img 
                                                    src={formData.AnhDaiDien} 
                                                    alt="Avatar" 
                                                    className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                                                    {user?.HoTen?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </>
                                    )}
                                    
                                    {/* Overlay thay đổi ảnh */}
                                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">Đổi ảnh</span>
                                        <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                                    </label>
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-[#0f172a] rounded-full z-10"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-1">{user?.HoTen}</h2>
                            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6">
                                {user?.MaQuyen === 1 ? 'Quản trị viên' : 'Thành viên'}
                            </p>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3 text-white/70 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user?.Email}
                                </div>
                                <div className="flex items-center gap-3 text-white/70 text-sm text-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {user?.SoDienThoai || 'Chưa cập nhật SĐT'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Edit Form */}
                    <div className="flex-1">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
                            <h3 className="text-3xl font-black text-white mb-8">THÔNG TIN CÁ NHÂN</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelStyle}>Họ và Tên</label>
                                        <input
                                            type="text"
                                            className={inputStyle}
                                            value={formData.HoTen}
                                            onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Số điện thoại</label>
                                        <input
                                            type="text"
                                            className={inputStyle}
                                            value={formData.SoDienThoai}
                                            onChange={(e) => setFormData({ ...formData, SoDienThoai: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelStyle}>Địa chỉ hiện tại</label>
                                    <input
                                        type="text"
                                        className={inputStyle}
                                        placeholder="Nhập địa chỉ nhà, tên đường, quận/huyện..."
                                        value={formData.DiaChi}
                                        onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>Địa chỉ Email</label>
                                    <input
                                        type="email"
                                        className={inputStyle + " opacity-50 cursor-not-allowed"}
                                        value={formData.Email}
                                        readOnly
                                    />
                                    <p className="text-[10px] text-white/30 mt-2 ml-1">* Email được sử dụng làm tên đăng nhập và không thể thay đổi.</p>
                                </div>

                                <div className="pt-6 border-t border-white/10 mt-8">
                                    <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </span>
                                        Đổi mật khẩu (Bỏ trống nếu không muốn đổi)
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelStyle}>Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                className={inputStyle}
                                                placeholder="••••••••"
                                                value={formData.MatKhauMoi}
                                                onChange={(e) => setFormData({ ...formData, MatKhauMoi: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Xác nhận mật khẩu</label>
                                            <input
                                                type="password"
                                                className={inputStyle}
                                                placeholder="••••••••"
                                                value={formData.XacNhanMatKhau}
                                                onChange={(e) => setFormData({ ...formData, XacNhanMatKhau: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>{uploading ? 'ĐANG TẢI ẢNH...' : 'LƯU THAY ĐỔI'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HoSo;
