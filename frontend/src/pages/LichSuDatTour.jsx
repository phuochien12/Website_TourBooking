import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // [MỚI] Thư viện hiển thị popup/modal đẹp

function LichSuDatTour() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===== MODAL HỦY TOUR (State) =====
    const [showModal, setShowModal] = useState(false);       // Hiện/Ẩn modal hủy tour
    const [selectedBooking, setSelectedBooking] = useState(null); // Đơn hàng đang được chọn để hủy
    const [lyDoHuy, setLyDoHuy] = useState('');              // Lý do hủy do khách nhập
    const [dangXuLy, setDangXuLy] = useState(false);         // Trạng thái đang gọi API

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.MaNguoiDung) {
            axios.get(`/api/bookings/user/${user.MaNguoiDung}`)
                .then(res => {
                    setBookings(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, []);

    // =====================================================
    // HÀM TÍNH PHẦN TRĂM HOÀN TIỀN DỰA TRÊN NGÀY KHỞI HÀNH
    // Quy tắc: Hủy càng sớm -> hoàn càng nhiều
    // =====================================================
    const tinhPhanTramHoanTien = (ngayKhoiHanh) => {
        const now = new Date();
        const ngayDi = new Date(ngayKhoiHanh);
        const soNgayConLai = Math.ceil((ngayDi - now) / (1000 * 60 * 60 * 24)); // Số ngày còn lại trước khi tour bắt đầu

        // Quy tắc hoàn tiền theo số ngày còn lại:
        if (soNgayConLai >= 15) return { phanTram: 100, moTa: 'Hoàn 100% (hủy trước 15 ngày)' };
        if (soNgayConLai >= 7) return { phanTram: 70, moTa: 'Hoàn 70% (hủy trước 7-14 ngày)' };
        if (soNgayConLai >= 3) return { phanTram: 50, moTa: 'Hoàn 50% (hủy trước 3-6 ngày)' };
        if (soNgayConLai >= 1) return { phanTram: 20, moTa: 'Hoàn 20% (hủy trước 1-2 ngày)' };
        return { phanTram: 0, moTa: 'Không hoàn tiền (hủy sát ngày khởi hành)' };
    };

    // =====================================================
    // MỞ MODAL HỦY TOUR - Hiện popup chứa thông tin chi tiết
    // =====================================================
    const moModalHuy = (booking) => {
        setSelectedBooking(booking);
        setLyDoHuy(''); // Reset lý do hủy
        setShowModal(true);
    };

    // =====================================================
    // XỬ LÝ XÁC NHẬN HỦY - Gọi API backend
    // =====================================================
    const xacNhanHuyDon = async () => {
        if (!selectedBooking) return;

        setDangXuLy(true);
        try {
            // [QUAN TRỌNG]: Gửi lý do hủy lên Backend để lưu vào CSDL
            await axios.put(`/api/bookings/huy-don/${selectedBooking.MaDon}`, {
                lyDoHuy: lyDoHuy || 'Không nêu lý do'
            });

            // Đóng Modal trước
            setShowModal(false);
            setSelectedBooking(null);

            // Cập nhật lại danh sách đơn trên giao diện (không cần reload trang)
            setBookings(bookings.map(item =>
                item.MaDon === selectedBooking.MaDon
                    ? { ...item, TrangThai: 'Hủy', GhiChu: `Lý do hủy: ${lyDoHuy || 'Không nêu lý do'}` }
                    : item
            ));

            // [MỚI] Hiện thông báo thành công bằng SweetAlert2 (đẹp hơn alert() mặc định)
            Swal.fire({
                icon: 'success',
                title: 'Hủy đơn thành công!',
                html: `
                    <p style="color: #6b7280; font-size: 15px;">
                        Yêu cầu hủy đã được ghi nhận.<br/>
                        Chúng tôi sẽ xử lý hoàn tiền trong vòng <b style="color: #dc2626;">24 giờ</b> làm việc.
                    </p>
                    <p style="color: #9ca3af; font-size: 13px; margin-top: 10px;">
                        📞 Hotline hỗ trợ: <b>0354858892</b>
                    </p>
                `,
                confirmButtonText: 'Đã hiểu',
                confirmButtonColor: '#2563eb'
            });

        } catch (err) {
            // Thông báo lỗi bằng SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Không thể hủy!',
                text: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setDangXuLy(false);
        }
    };

    if (!user) return <div className="text-center py-20">Vui lòng đăng nhập để xem lịch sử.</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-3xl font-bold mb-8 text-blue-800 border-l-4 border-blue-500 pl-4">Lịch Sử Đặt Tour Của Bạn</h1>

                {loading ? <p>Đang tải dữ liệu...</p> : bookings.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded shadow">
                        <p className="text-gray-500 mb-4">Bạn chưa đặt tour nào cả.</p>
                        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Đặt Tour Ngay</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map(item => (
                            <div key={item.MaDon} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition">
                                <img src={item.AnhBia} alt={item.TenTour} className="w-full md:w-48 h-48 md:h-auto object-cover" />
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.TenTour}</h3>
                                            <p className="text-gray-600 text-sm">📅 Khởi hành: <strong>{new Date(item.NgayKhoiHanh).toLocaleDateString('vi-VN')}</strong></p>
                                            <p className="text-gray-600 text-sm">👥 Số khách: {item.SoKhach}</p>
                                            <p className="text-gray-600 text-sm">🕒 Ngày đặt: {new Date(item.NgayDat).toLocaleDateString('vi-VN')}</p>
                                            {/* [MỚI] Hiển thị lý do hủy nếu đơn đã bị hủy */}
                                            {item.TrangThai === 'Hủy' && item.GhiChu && (
                                                <p className="text-red-500 text-sm mt-1 italic">💬 {item.GhiChu}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-600 font-bold text-xl mb-2">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.TongTien)}
                                            </p>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold 
                                            ${item.TrangThai === 'Đã thanh toán' || item.TrangThai === 'Đã xác nhận' ? 'bg-green-100 text-green-700' :
                                                        item.TrangThai === 'Hủy' ? 'bg-red-100 text-red-700' :
                                                            item.TrangThai === 'Chờ thanh toán' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'}`}>
                                                    {item.TrangThai}
                                                </span>

                                                {/* ===== NÚT HỦY ĐƠN (Cho phép hủy khi chưa thanh toán hoặc đang chờ xử lý) ===== */}
                                                {(item.TrangThai === 'Chờ xử lý' || item.TrangThai === 'Chờ thanh toán') && (
                                                    <button
                                                        onClick={() => moModalHuy(item)}
                                                        className="text-red-500 hover:text-red-700 text-sm underline font-medium"
                                                    >
                                                        Hủy đơn này
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================================================================ */}
            {/* MODAL HỦY TOUR - Popup tùy chỉnh (thay thế window.confirm)       */}
            {/* Hiện khi khách bấm "Hủy đơn này" - chứa đầy đủ thông tin:        */}
            {/* 1. Tên tour + số tiền đã thanh toán                               */}
            {/* 2. Chính sách hủy tour (lấy từ CSDL)                             */}
            {/* 3. Bảng tính % hoàn tiền theo thời gian                           */}
            {/* 4. Số tiền hoàn lại ước tính                                      */}
            {/* 5. Ô nhập lý do hủy                                              */}
            {/* 6. 2 nút: Xác nhận hủy + Giữ lại đơn hàng                       */}
            {/* ================================================================ */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        style={{ animation: 'fadeInUp 0.3s ease-out' }}
                    >
                        {/* ===== PHẦN HEADER - Tiêu đề cảnh báo ===== */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-5">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">⚠️</span>
                                <div>
                                    <h2 className="text-xl font-bold">Xác Nhận Hủy Tour</h2>
                                    <p className="text-red-100 text-sm">Vui lòng đọc kỹ chính sách trước khi xác nhận</p>
                                </div>
                            </div>
                        </div>

                        {/* ===== PHẦN NỘI DUNG CHÍNH ===== */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">

                            {/* --- Thông tin đơn hàng đang muốn hủy --- */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
                                <h3 className="font-bold text-gray-800 mb-2 text-base">{selectedBooking.TenTour}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p>📅 Ngày đi: <strong>{new Date(selectedBooking.NgayKhoiHanh).toLocaleDateString('vi-VN')}</strong></p>
                                    <p>👥 Số khách: <strong>{selectedBooking.SoKhach}</strong></p>
                                    <p>💰 Tổng tiền: <strong className="text-red-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBooking.TongTien)}
                                    </strong></p>
                                    <p>📋 Mã đơn: <strong>#{selectedBooking.MaDon}</strong></p>
                                </div>
                            </div>

                            {/* --- Chính sách hủy tour (lấy từ CSDL) --- */}
                            {/* [QUAN TRỌNG]: Hiện nội dung ChinhSachHuyTour từ bảng Tour trong CSDL */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                    <span>📜</span> Chính Sách Hủy Tour
                                </h4>
                                {selectedBooking.ChinhSachHuyTour ? (
                                    <p className="text-sm text-amber-900 leading-relaxed">{selectedBooking.ChinhSachHuyTour}</p>
                                ) : (
                                    <p className="text-sm text-amber-900 leading-relaxed">
                                        Áp dụng chính sách hoàn tiền tiêu chuẩn của Du Lịch Việt
                                    </p>
                                )}
                            </div>

                            {/* --- Bảng chi tiết mức hoàn tiền theo thời gian --- */}
                            <div className="mb-4">
                                <h4 className="font-bold text-gray-700 mb-2 text-sm">📊 Bảng Mức Hoàn Tiền:</h4>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-blue-50">
                                            <th className="border border-blue-200 p-2 text-left text-blue-800">Thời Điểm Hủy</th>
                                            <th className="border border-blue-200 p-2 text-center text-blue-800">% Hoàn Lại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border p-2">Trước 15 ngày khởi hành</td><td className="border p-2 text-center font-bold text-green-600">100%</td></tr>
                                        <tr className="bg-gray-50"><td className="border p-2">Trước 7-14 ngày</td><td className="border p-2 text-center font-bold text-blue-600">70%</td></tr>
                                        <tr><td className="border p-2">Trước 3-6 ngày</td><td className="border p-2 text-center font-bold text-yellow-600">50%</td></tr>
                                        <tr className="bg-gray-50"><td className="border p-2">Trước 1-2 ngày</td><td className="border p-2 text-center font-bold text-orange-600">20%</td></tr>
                                        <tr><td className="border p-2">Ngày khởi hành hoặc sau</td><td className="border p-2 text-center font-bold text-red-600">0%</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* --- SỐ TIỀN HOÀN LẠI ƯỚC TÍNH (tự động tính) --- */}
                            {/* [QUAN TRỌNG]: Tính toán dựa trên ngày khởi hành và ngày hiện tại */}
                            {(() => {
                                const { phanTram, moTa } = tinhPhanTramHoanTien(selectedBooking.NgayKhoiHanh);
                                const soTienHoan = selectedBooking.TongTien * phanTram / 100;
                                return (
                                    <div className={`rounded-lg p-4 mb-4 border-2 ${phanTram >= 70 ? 'bg-green-50 border-green-300' : phanTram >= 30 ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
                                        <p className="text-sm font-bold text-gray-700 mb-1">💵 Ước tính hoàn tiền cho bạn:</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {moTa}
                                        </p>
                                        <p className="text-2xl font-black mt-1" style={{ color: phanTram >= 70 ? '#16a34a' : phanTram >= 30 ? '#ca8a04' : '#dc2626' }}>
                                            ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTienHoan)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">* Số tiền thực tế sẽ được xác nhận bởi bộ phận chăm sóc khách hàng</p>
                                    </div>
                                );
                            })()}

                            {/* --- Ô nhập lý do hủy (để thu thập dữ liệu cải thiện dịch vụ) --- */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    📝 Lý do hủy tour <span className="text-gray-400 font-normal">(tùy chọn)</span>
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-2 focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                                    value={lyDoHuy}
                                    onChange={e => setLyDoHuy(e.target.value)}
                                >
                                    <option value="">-- Chọn lý do --</option>
                                    <option value="Thay đổi kế hoạch cá nhân">Thay đổi kế hoạch cá nhân</option>
                                    <option value="Lý do sức khỏe">Lý do sức khỏe</option>
                                    <option value="Tìm được tour khác phù hợp hơn">Tìm được tour khác phù hợp hơn</option>
                                    <option value="Tài chính không cho phép">Tài chính không cho phép</option>
                                    <option value="Thời tiết không thuận lợi">Thời tiết không thuận lợi</option>
                                    <option value="Lý do công việc">Lý do công việc</option>
                                    <option value="Khác">Khác</option>
                                </select>
                                {/* Nếu chọn "Khác", hiện thêm ô nhập tự do */}
                                {lyDoHuy === 'Khác' && (
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none"
                                        rows="2"
                                        placeholder="Nhập lý do cụ thể..."
                                        onChange={e => setLyDoHuy(`Khác: ${e.target.value}`)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ===== PHẦN FOOTER - 2 NÚT HÀNH ĐỘNG ===== */}
                        <div className="border-t bg-gray-50 p-4 flex gap-3">
                            {/* Nút giữ lại đơn (quay về, không hủy) */}
                            <button
                                onClick={() => { setShowModal(false); setSelectedBooking(null); }}
                                className="flex-1 py-3 px-4 rounded-lg border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 transition text-sm"
                            >
                                ← Giữ Lại Đơn Hàng
                            </button>
                            {/* Nút xác nhận hủy (màu đỏ nổi bật, cảnh báo) */}
                            <button
                                onClick={xacNhanHuyDon}
                                disabled={dangXuLy}
                                className="flex-1 py-3 px-4 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:bg-gray-400 text-sm shadow-lg"
                            >
                                {dangXuLy ? '⏳ Đang xử lý...' : '🗑️ Xác Nhận Hủy Tour'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CSS ANIMATION cho Modal (hiệu ứng trượt lên) ===== */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default LichSuDatTour;
