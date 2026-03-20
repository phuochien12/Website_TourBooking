import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function DatTour() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [lichKhoiHanh, setLichKhoiHanh] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));

    // Form state
    const [hoTen, setHoTen] = useState(user ? user.HoTen : '');
    const [email, setEmail] = useState(user ? user.Email : '');
    const [soDienThoai, setSoDienThoai] = useState(user ? user.SoDienThoai || '' : '');
    const [tinhThanh, setTinhThanh] = useState('Thành phố Cần Thơ');
    const [phuongXa, setPhuongXa] = useState('Phường Bình Thủy');
    const [diaChi, setDiaChi] = useState(user?.DiaChi || '');
    const [soKhach, setSoKhach] = useState(1);
    const [maLichChon, setMaLichChon] = useState('');
    const [phuongThuc, setPhuongThuc] = useState('chuyen_khoan');
    const [maVanPhong, setMaVanPhong] = useState('can_tho');
    const [ghiChu, setGhiChu] = useState('');
    const tenChuKhoan = 'CONG TY DU LICH VIET-HUYNH PHUOC HIEN';

    const danhSachTaiKhoan = [
        { name: 'MB BANK (QUÂN ĐỘI)', stk: '0354858892', bin: '970422' },
        { name: 'TECHCOMBANK', stk: '1212049999', bin: '970407' }
    ];
    const [taiKhoanNhan, setTaiKhoanNhan] = useState(danhSachTaiKhoan[0]);

    // UI State
    const [step, setStep] = useState(1); // 1: Thông tin, 2: Thanh toán, 3: Hoàn tất
    const [dangXuLy, setDangXuLy] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null); // Lưu thông tin đơn sau khi đặt thành công

    useEffect(() => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để thực hiện đặt tour!',
                confirmButtonColor: '#00c3c7'
            }).then(() => {
                navigate('/dang-nhap', { state: { from: `/dat-tour/${id}` } });
            });
        }
    }, [user, navigate, id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resTour, resLich] = await Promise.all([
                    axios.get(`/api/tours/${id}`),
                    axios.get(`/api/tours/${id}/lich-khoi-hanh`)
                ]);
                setTour(resTour.data);
                if (resLich.data.length > 0) {
                    setLichKhoiHanh(resLich.data);
                    setMaLichChon(resLich.data[0].MaLich);
                }

                // FETCH THÊM THÔNG TIN USER MỚI NHẤT
                if (user) {
                    try {
                        const resUser = await axios.get(`/api/users/${user.MaNguoiDung}`);
                        if (resUser.data) {
                            const u = resUser.data;
                            setHoTen(u.HoTen || '');
                            setEmail(u.Email || '');
                            setSoDienThoai(u.SoDienThoai || '');
                            if (u.DiaChi) setDiaChi(u.DiaChi);
                            
                            // Lưu lại vào localStorage để đồng bộ các trang khác
                            localStorage.setItem('user', JSON.stringify({ ...user, ...u }));
                        }
                    } catch (uErr) {
                        console.log("Không thể fetch thông tin user mới nhất, dùng tạm cache.");
                    }
                }
            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const lichChon = lichKhoiHanh.find(l => l.MaLich === parseInt(maLichChon));
    const tongTien = lichChon ? lichChon.GiaTourHienTai * soKhach : (tour?.GiaGoc || 0) * soKhach;

    const handleToStep2 = (e) => {
        e.preventDefault();
        if (!maLichChon) return Swal.fire('Thông báo', 'Vui lòng chọn ngày khởi hành', 'warning');
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleHoanTat = async () => {
        setDangXuLy(true);
        try {
            let stringGhiChu = `Địa chỉ: ${diaChi}, ${phuongXa}, ${tinhThanh}${ghiChu ? ` | Ghi chú thêm: ${ghiChu}` : ''}`;
            if (phuongThuc === 'tien_mat') {
                const tenVP = maVanPhong === 'can_tho' ? 'Trụ sở chính Cần Thơ' : 'Chi nhánh TP. HCM';
                stringGhiChu += ` | Đăng ký nộp tại: ${tenVP}`;
            }

            const res = await axios.post('/api/dat-tour', {
                HoTen: hoTen,
                Email: email,
                SoDienThoai: soDienThoai,
                SoKhach: soKhach,
                MaLich: parseInt(maLichChon),
                TongTien: tongTien,
                PhuongThucThanhToan: phuongThuc,
                MaNguoiDung: user ? user.MaNguoiDung : null,
                GhiChu: stringGhiChu
            });

            if (res.data.success) {
                setOrderSuccess({
                    maDon: res.data.maDon,
                    ngayDat: new Date().toLocaleDateString('vi-VN'),
                    tongTien: tongTien,
                    phuongThuc: phuongThuc === 'chuyen_khoan' ? 'Chuyển khoản ngân hàng (Quét mã QR)' : 'Thanh toán trực tiếp'
                });
                setStep(3);
                window.scrollTo(0, 0);
            }
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setDangXuLy(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 bg-white">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-400 uppercase tracking-widest text-sm animate-pulse">Đang tải dữ liệu tour...</p>
        </div>
    );

    if (!tour) return (
        <div className="text-center py-40 bg-white">
            <div className="text-6xl mb-6">🏜️</div>
            <h2 className="text-2xl font-black text-navy mb-4 uppercase">Không tìm thấy tour</h2>
            <p className="text-gray-500 mb-8">Tour bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
            <Link to="/tours" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-teal-700 transition shadow-lg">Quay lại danh sách tour</Link>
        </div>
    );

    return (
        <div className="bg-[#f4f7f6] min-h-screen pb-20 font-sans">
            {/* Header: Thanh tiến trình 3 bước chuyên nghiệp */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[64px] z-40">
                <div className="container mx-auto px-4 max-w-5xl py-6">
                    <div className="flex items-center justify-between">
                        <div className={`flex flex-col items-center gap-2 group transition-all duration-300 ${step >= 1 ? 'text-primary' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${step >= 1 ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 bg-white'}`}>
                                {step > 1 ? '✓' : '1'}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">Thông tin</span>
                        </div>
                        <div className={`flex-1 h-[2px] mx-4 transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-gray-100'}`}></div>
                        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${step >= 2 ? 'text-primary' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${step >= 2 ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 bg-white'}`}>
                                {step > 2 ? '✓' : '2'}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">Thanh toán</span>
                        </div>
                        <div className={`flex-1 h-[2px] mx-4 transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-gray-100'}`}></div>
                        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${step >= 3 ? 'text-primary' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${step >= 3 ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 bg-white'}`}>
                                3
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">Hoàn tất</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-10">
                {step < 3 ? (
                    /* GIAO DIỆN CỘT: FORM + TÓM TẮT ĐƠN HÀNG */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
                        <div className="lg:col-span-7 space-y-8 animate-fadeInLeft">
                            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10">
                                {step === 1 ? (
                                    /* STEP 1: THÔNG TIN CHI TIẾT (DESIGN MỚI THEO MẪU) */
                                    <>
                                        <h2 className="text-2xl font-black text-navy mb-8 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                                                THÔNG TIN THANH TOÁN
                                            </div>
                                            {user && (
                                                <div className="hidden md:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                                                    <p className="text-[11px] font-bold text-primary italic">Bạn đã đăng nhập, hệ thống sẽ tự điền thông tin</p>
                                                    <span className="text-sm">✨</span>
                                                </div>
                                            )}
                                        </h2>
                                        
                                        {user && hoTen && soDienThoai && email && (
                                            <div className="mb-10 bg-gradient-to-r from-navy to-[#2c3e50] p-8 rounded-[32px] text-white shadow-xl shadow-navy/10 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-xs font-black uppercase tracking-[3px] text-primary mb-2 opacity-80">Thanh toán nhanh một chạm</p>
                                                    <h3 className="text-xl font-bold mb-4">Chào {hoTen}, bạn muốn dùng hồ sơ đã lưu?</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => handleToStep2(e)}
                                                            className="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-primary/20 hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                                                        >
                                                            <span>➔</span> SỬ DỤNG HỒ SƠ & THANH TOÁN NGAY
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                setHoTen(''); setSoDienThoai(''); setDiaChi('');
                                                                Swal.fire({ icon: 'info', title: 'Đã xóa!', text: 'Vui lòng nhập thông tin mới.', timer: 1000, showConfirmButton: false });
                                                            }}
                                                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/10 transition-all"
                                                        >
                                                            Nhập thông tin khác
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <form onSubmit={handleToStep2} className="space-y-6">
                                            {/* Họ và tên (Full Width) */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Họ và tên *</label>
                                                <input required type="text" value={hoTen} onChange={e => setHoTen(e.target.value)} placeholder="Nhập họ và tên..." className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium" />
                                            </div>

                                            {/* SĐT & Email (2 Columns) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại *</label>
                                                    <input required type="tel" value={soDienThoai} onChange={e => setSoDienThoai(e.target.value)} placeholder="+84..." className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all font-medium" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Địa chỉ email *</label>
                                                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all font-medium" />
                                                </div>
                                            </div>

                                            {/* Tỉnh thành & Phường xã (2 Columns) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Tỉnh/Thành phố *</label>
                                                    <select value={tinhThanh} onChange={e => setTinhThanh(e.target.value)} className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all font-medium">
                                                        <option value="Thành phố Cần Thơ">Thành phố Cần Thơ</option>
                                                        <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
                                                        <option value="Tỉnh Kiên Giang">Tỉnh Kiên Giang</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Phường/Xã *</label>
                                                    <select value={phuongXa} onChange={e => setPhuongXa(e.target.value)} className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all font-medium">
                                                        <option value="Phường Bình Thủy">Phường Bình Thủy</option>
                                                        <option value="Phường An Khánh">Phường An Khánh</option>
                                                        <option value="Phường Xuân Khánh">Phường Xuân Khánh</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Địa chỉ (Full Width) */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Địa chỉ *</label>
                                                <input required type="text" value={diaChi} onChange={e => setDiaChi(e.target.value)} placeholder="Nhập số nhà, tên đường..." className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all font-medium" />
                                            </div>



                                            {/* Số lượng khách */}
                                            <div className="space-y-2 pt-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Số lượng khách đặt tour *</label>
                                                <div className="flex items-center w-32 bg-white border-2 border-gray-100 rounded-xl p-1 shadow-sm">
                                                    <button type="button" onClick={() => setSoKhach(Math.max(1, soKhach - 1))} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold hover:text-primary hover:bg-gray-50 rounded-lg transition-all">-</button>
                                                    <input required type="number" min="1" value={soKhach} onChange={e => setSoKhach(parseInt(e.target.value) || 1)} className="w-10 bg-transparent text-center font-bold text-navy outline-none" />
                                                    <button type="button" onClick={() => setSoKhach(soKhach + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold hover:text-primary hover:bg-gray-50 rounded-lg transition-all">+</button>
                                                </div>
                                            </div>

                                            {/* Ngày khởi hành (SỬA LỖI KHÔNG HIỆN) */}
                                            <div className="pt-4 p-6 bg-navy/5 rounded-[32px] border border-navy/5">
                                                <label className="text-[11px] font-black text-navy uppercase tracking-widest ml-1 mb-4 block">Chọn ngày khởi hành trống *</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {lichKhoiHanh.length > 0 ? lichKhoiHanh.map(l => (
                                                        <div
                                                            key={l.MaLich}
                                                            onClick={() => setMaLichChon(l.MaLich)}
                                                            className={`p-5 border-2 rounded-[24px] cursor-pointer transition-all relative overflow-hidden group ${maLichChon === l.MaLich ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-white bg-white hover:border-primary/30'}`}
                                                        >
                                                            {maLichChon === l.MaLich && <div className="absolute top-0 right-0 bg-primary text-white w-8 h-8 flex items-center justify-center rounded-bl-2xl text-[10px]">✓</div>}
                                                            <div className={`text-[10px] font-black mb-1 uppercase tracking-tighter ${maLichChon === l.MaLich ? 'text-primary' : 'text-gray-400'}`}>Ngày đi</div>
                                                            <div className="font-black text-navy text-lg">{new Date(l.NgayKhoiHanh).toLocaleDateString('vi-VN')}</div>
                                                            <div className="mt-3 flex justify-between items-center">
                                                                <span className="text-[11px] text-gray-400 italic font-medium">Còn {l.SoChoToiDa - l.SoChoDaDat} chỗ</span>
                                                                <span className="text-red-500 font-black text-sm">{new Intl.NumberFormat('vi-VN').format(l.GiaTourHienTai)}đ</span>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="col-span-1 md:col-span-2 py-10 text-center">
                                                            <span className="text-4xl mb-4 block">📅</span>
                                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Hiện tại chưa có lịch khởi hành mới <br /> cho tour này. Vui lòng quay lại sau.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ghi chú chuyến đi */}
                                            <div className="space-y-4 pt-4">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Ghi chú!!! (tuỳ chọn)</label>
                                                <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Nhập yêu cầu đặc biệt hoặc ghi chú thêm cho chuyến đi (ví dụ: điểm đón, dị ứng thực phẩm...)" className="w-full p-4 bg-white border-2 border-gray-100 rounded-lg focus:border-primary outline-none transition-all h-32 resize-none font-medium placeholder:text-gray-400" />
                                            </div>

                                            <div className="pt-6">
                                                <button type="submit" disabled={lichKhoiHanh.length === 0} className={`w-full text-white py-5 rounded-[24px] font-black uppercase tracking-[3px] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${lichKhoiHanh.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-teal-700 shadow-primary/20'}`}>
                                                    Tiếp tục thanh toán
                                                    <span>→</span>
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    /* STEP 2: PHƯƠNG THỨC THANH TOÁN (NÂNG CẤP CHỌN NGÂN HÀNG & LOOKUP) */
                                    <>
                                        <div className="flex justify-between items-center mb-8">
                                            <h2 className="text-2xl font-black text-navy flex items-center gap-4">
                                                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                                                THANH TOÁN
                                            </h2>
                                            <button onClick={() => setStep(1)} className="text-primary font-bold text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-4">← Sửa thông tin</button>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Chuyển khoản (VietQR) */}
                                            <div
                                                onClick={() => setPhuongThuc('chuyen_khoan')}
                                                className={`p-1 border-2 rounded-[32px] cursor-pointer transition-all duration-300 overflow-hidden ${phuongThuc === 'chuyen_khoan' ? 'border-primary ring-8 ring-primary/5' : 'border-gray-50'}`}
                                            >
                                                <div className={`p-6 rounded-[28px] ${phuongThuc === 'chuyen_khoan' ? 'bg-primary/5' : 'bg-gray-50'}`}>
                                                    <div className="flex items-start gap-5">
                                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${phuongThuc === 'chuyen_khoan' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                                            {phuongThuc === 'chuyen_khoan' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-navy text-lg uppercase tracking-tight">Chuyển khoản Ngân hàng (VietQR)</span>
                                                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">KHUYÊN DÙNG</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 font-medium mb-6">Quét mã QR để tự động điền thông tin hoặc chuyển khoản theo chi tiết bên dưới.</p>

                                                            {phuongThuc === 'chuyen_khoan' && (
                                                                <div className="bg-white p-7 rounded-[32px] space-y-7 shadow-sm border-2 border-primary/10 animate-fadeIn">
                                                                    {/* Bank Tabs Selector */}
                                                                    <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                                                                        {danhSachTaiKhoan.map((tk, index) => (
                                                                            <button
                                                                                key={index}
                                                                                type="button"
                                                                                onClick={() => setTaiKhoanNhan(tk)}
                                                                                className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black transition-all duration-300 ${taiKhoanNhan.stk === tk.stk ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-500'}`}
                                                                            >
                                                                                <span className="uppercase">{tk.name.split(' ')[0]}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
                                                                        {/* Info Side */}
                                                                        <div className="flex flex-col justify-center space-y-5">
                                                                            <div className="group transition-all">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Số tài khoản thụ hưởng</p>
                                                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-all flex justify-between items-center relative overflow-hidden cursor-pointer"
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(taiKhoanNhan.stk);
                                                                                        const Toast = Swal.mixin({
                                                                                            toast: true,
                                                                                            position: 'top-end',
                                                                                            showConfirmButton: false,
                                                                                            timer: 2000,
                                                                                            timerProgressBar: true
                                                                                        });
                                                                                        Toast.fire({ icon: 'success', title: 'Đã sao chép số tài khoản!' });
                                                                                    }}
                                                                                >
                                                                                    <span className="font-black text-primary text-2xl tracking-wider leading-none">{taiKhoanNhan.stk}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="absolute right-1 text-xs font-black bg-navy/20 text-navy/40 px-6 py-2.5 rounded-xl transform translate-x-[96%] whitespace-nowrap select-none border border-navy/10"
                                                                                    >
                                                                                        SAO CHÉP
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="group transition-all">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Chủ tài khoản & Ngân hàng</p>
                                                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:border-primary/30 transition-all">
                                                                                    <p className="font-black text-navy uppercase tracking-tight text-base leading-tight mb-1">{tenChuKhoan}</p>
                                                                                    <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wide">{taiKhoanNhan.name}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* QR Side */}
                                                                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-teal-500/5 rounded-[40px] border-2 border-dashed border-primary/20 relative group overflow-hidden">
                                                                            <div className="absolute top-0 right-0 p-4">
                                                                                <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-white">
                                                                                    <p className="text-[9px] font-black text-primary uppercase italic">VietQR</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="bg-white p-3 rounded-3xl shadow-2xl shadow-primary/10 border border-gray-50 mb-5 h-52 w-52 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 relative">
                                                                                <img
                                                                                    src={`https://img.vietqr.io/image/${taiKhoanNhan.bin}-${taiKhoanNhan.stk}-compact2.png?amount=${tongTien}&addInfo=${encodeURIComponent(`TOUR ${hoTen.toUpperCase()}`)}&accountName=${encodeURIComponent(tenChuKhoan)}`}
                                                                                    alt="VietQR"
                                                                                    className="max-h-full max-w-full object-contain"
                                                                                />
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Số tiền thanh toán</p>
                                                                                <p className="text-2xl font-black text-red-600 tracking-tighter">
                                                                                    {new Intl.NumberFormat('vi-VN').format(tongTien)}
                                                                                    <span className="text-sm ml-1.5">VNĐ</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm shadow-sm ring-4 ring-primary/5">💡</div>
                                                                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed max-w-[80%] text-center">
                                                                            Sau khi chuyển khoản thành công, quý khách vui lòng bấm nút <span className="text-navy font-black underline decoration-primary decoration-2 underline-offset-4">"HOÀN TẤT ĐẶT TOUR"</span> phía dưới để nhận hóa đơn và xác nhận từ hệ thống.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tiền mặt tại văn phòng (NÂNG CẤP CHỌN CƠ SỞ) */}
                                            <div
                                                onClick={() => setPhuongThuc('tien_mat')}
                                                className={`p-1 border-2 rounded-[32px] cursor-pointer transition-all duration-300 ${phuongThuc === 'tien_mat' ? 'border-primary ring-8 ring-primary/5' : 'border-gray-50'}`}
                                            >
                                                <div className={`p-6 rounded-[28px] ${phuongThuc === 'tien_mat' ? 'bg-primary/5' : 'bg-gray-50'}`}>
                                                    <div className="flex items-start gap-5">
                                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${phuongThuc === 'tien_mat' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                                            {phuongThuc === 'tien_mat' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="font-bold text-navy text-lg uppercase tracking-tight block mb-1">Thanh toán tại văn phòng</span>
                                                            <p className="text-sm text-gray-500 font-medium mb-4">Quý khách có thể đến trực tiếp các cơ sở của chúng tôi để thanh toán và nhận vé.</p>

                                                            {phuongThuc === 'tien_mat' && (
                                                                <div className="space-y-4 animate-fadeIn">
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Chọn cơ sở thanh toán gần nhất</label>
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); setMaVanPhong('can_tho'); }}
                                                                                className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all ${maVanPhong === 'can_tho' ? 'border-primary bg-white text-primary shadow-sm' : 'border-gray-200 text-gray-400'}`}
                                                                            >
                                                                                Cần Thơ (Trụ sở)
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); setMaVanPhong('hcm'); }}
                                                                                className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all ${maVanPhong === 'hcm' ? 'border-primary bg-white text-primary shadow-sm' : 'border-gray-200 text-gray-400'}`}
                                                                            >
                                                                                TP. HCM (Chi nhánh)
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white p-4 rounded-2xl text-[13px] text-navy font-bold border border-gray-100 flex items-center justify-center text-center">
                                                                        {maVanPhong === 'can_tho' ? (
                                                                            <span>Đ/C: 273 Nguyễn Văn Linh, Quận Bình Thủy, TP. Cần Thơ</span>
                                                                        ) : (
                                                                            <span>Đ/C: 123 Lê Lợi, Quận 1, Tp. Hồ Chí Minh</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleHoanTat}
                                                disabled={dangXuLy}
                                                className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[3px] transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-3 ${dangXuLy ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'}`}
                                            >
                                                {dangXuLy ? 'Đang xử lý...' : 'Xác nhận đặt tour ngay ✓'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY) */}
                        <div className="lg:col-span-5 relative">
                            <div className="bg-white rounded-[40px] shadow-2xl shadow-navy/5 border border-gray-50 overflow-hidden sticky top-32 animate-fadeInRight">
                                <div className="relative h-48 group">
                                    <img src={tour.AnhBia} alt={tour.TenTour} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent p-8 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-primary px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest">Hot Tour</span>
                                        </div>
                                        <h3 className="text-white font-black text-lg line-clamp-2 leading-tight uppercase tracking-tight">{tour.TenTour}</h3>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Lịch trình</span>
                                            <span className="text-sm font-black text-navy">{tour.ThoiGian || 'Trong ngày'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Ngày đi</span>
                                            <span className="text-sm font-black text-navy">{lichChon ? new Date(lichChon.NgayKhoiHanh).toLocaleDateString('vi-VN') : '---'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Số khách</span>
                                            <span className="text-sm font-black text-navy">{soKhach} người</span>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-[32px] border border-red-100/50 shadow-sm shadow-red-100/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[2px]">Thành tiền</span>
                                            <div className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md font-black shadow-sm shadow-red-600/20 tracking-tighter">TOTAL</div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-black text-red-600 tracking-tighter">
                                                {new Intl.NumberFormat('vi-VN').format(tongTien)} <span className="text-lg">VNĐ</span>
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-red-400 font-bold mt-2 uppercase italic tracking-widest">Đã bao gồm phí bảo hiểm & thuế VAT</p>
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div>
                                        <p className="text-[11px] font-medium text-gray-500 leading-tight">Yêu cầu của bạn sẽ được xác nhận tự động qua Email chỉ sau 5 phút.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* STEP 3: GIAO DIỆN HOÀN TẤT (TRANG CẢM ƠN CÓ MÃ QR NHƯ MẪU) */
                    <div className="max-w-4xl mx-auto animate-fadeInUp">
                        <div className="bg-white rounded-[48px] shadow-2xl shadow-navy/10 overflow-hidden border border-gray-50">
                            {/* Header thành công */}
                            <div className="bg-gradient-to-br from-primary to-teal-700 p-12 text-center text-white">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/40 ring-8 ring-white/5 animate-bounce">
                                    <span className="text-4xl text-white">✓</span>
                                </div>
                                <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">Đặt Tour Thành Công!</h2>
                                <p className="text-white/80 font-medium">Cảm ơn {hoTen}, phiếu đặt tour của bạn đã được tiếp nhận và xử lý.</p>
                            </div>

                            <div className="p-8 md:p-14">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                                    {/* Bên trái: Thông tin đặt tour */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-[3px] mb-6 flex items-center gap-3">
                                                <span className="w-8 h-[2px] bg-primary"></span>
                                                Chi tiết đặt tour
                                            </h3>
                                            <div className="space-y-5">
                                                <div className="flex justify-between items-center group">
                                                    <span className="text-gray-400 font-bold text-[12px] uppercase">Mã phiếu đặt:</span>
                                                    <span className="font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg text-lg tracking-widest">#{orderSuccess.maDon}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 font-bold text-[12px] uppercase">Ngày đặt:</span>
                                                    <span className="font-black text-navy">{orderSuccess.ngayDat}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 font-bold text-[12px] uppercase">Phương thức:</span>
                                                    <span className="text-xs font-black text-navy text-right uppercase leading-tight max-w-[150px]">{orderSuccess.phuongThuc}</span>
                                                </div>
                                                <div className="pt-5 border-t border-gray-100 flex justify-between items-end">
                                                    <span className="font-black text-navy text-sm uppercase">Tổng cộng:</span>
                                                    <span className="font-black text-primary text-3xl tracking-tighter">{new Intl.NumberFormat('vi-VN').format(orderSuccess.tongTien)} VNĐ</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#f8fafc] p-6 rounded-[32px] border border-gray-100 italic">
                                            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                                                💌 Hệ thống đã gửi một email xác nhận kèm vé điện tử vào địa chỉ <b>{email}</b>. Quý khách vui lòng kiểm tra hộp thư đến (hoặc thư rác/spam).
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <Link to="/lich-su-dat-tour" className="w-full bg-navy text-white text-center py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-navy/90 transition shadow-xl shadow-navy/20">Quản lý chuyến đi</Link>
                                            <button onClick={() => navigate('/')} className="w-full bg-white text-gray-400 py-4 rounded-[24px] font-black uppercase tracking-widest hover:text-primary transition">Quay lại trang chủ</button>
                                        </div>
                                    </div>

                                    {/* Bên phải: QR MoMo/VietQR (Nếu là chuyển khoản) */}
                                    <div className="bg-white rounded-[40px] border-2 border-primary/10 p-8 flex flex-col items-center justify-center shadow-2xl shadow-primary/5 relative">
                                        <div className="absolute top-0 right-10 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-b-xl uppercase tracking-widest shadow-lg">Tự động 24/7</div>

                                        <h4 className="text-[13px] font-black text-navy uppercase tracking-[2px] mb-8 text-center leading-relaxed">
                                            Quét mã QR để <br /> <span className="text-primary text-xl">thanh toán nhanh</span>
                                        </h4>

                                        {phuongThuc === 'chuyen_khoan' ? (
                                            <>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
                                                    <div className="bg-white p-3 rounded-[32px] shadow-sm relative border border-gray-100">
                                                        <img
                                                            src={`https://img.vietqr.io/image/MB-0354858892-compact2.png?amount=${orderSuccess.tongTien}&addInfo=DULICHVIET ${orderSuccess.maDon} ${hoTen}&accountName=CONG TY DU LICH VIET`}
                                                            alt="VietQR"
                                                            className="w-56 h-56 md:w-64 md:h-64 object-contain shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-8 space-y-2 text-center">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="text-sm">📱</span>
                                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Mở App ngân hàng quét ngay</p>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed font-medium">Nhập đúng nội dung: <b className="text-navy uppercase">DULICHVIET {orderSuccess.maDon}</b></p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-20 px-6">
                                                <div className="text-6xl mb-6">🏢</div>
                                                <p className="text-sm font-bold text-navy uppercase leading-relaxed">Vui lòng đến địa chỉ văn phòng <br /> để hoàn tất thanh toán trước khi khởi hành.</p>
                                                <p className="text-[11px] text-gray-400 mt-4 italic">Mang theo mã đơn: <b>#{orderSuccess.maDon}</b></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS ANIMATIONS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeInLeft { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fadeInRight { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            ` }} />
        </div>
    );
}

export default DatTour;
