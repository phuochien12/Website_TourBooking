import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function LichKhoiHanhKhachHang() {
    const [lichKhoiHanh, setLichKhoiHanh] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/tours')
            .then(res => {
                setLichKhoiHanh(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi:", err);
                setLoading(false);
            });
    }, []);

    const hoChiMinhTours = lichKhoiHanh.filter(t => t.DiemKhoiHanh === 'TP. Hồ Chí Minh' || !t.DiemKhoiHanh);
    const canThoTours = lichKhoiHanh.filter(t => t.DiemKhoiHanh === 'Cần Thơ');
    const otherTours = lichKhoiHanh.filter(t => t.DiemKhoiHanh !== 'TP. Hồ Chí Minh' && t.DiemKhoiHanh !== 'Cần Thơ' && t.DiemKhoiHanh);

    const renderTable = (tours, groupName) => {
        if (tours.length === 0) return null;

        return (
            <div className="mb-16 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                    <h3 className="text-xl font-black uppercase text-navy tracking-tight">{groupName}</h3>
                </div>
                
                <div className="bg-white rounded-[24px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-navy text-white text-[11px] uppercase tracking-[2px] font-black">
                                    <th className="px-6 py-5 text-center w-20">#</th>
                                    <th className="px-6 py-5">Hành trình tham quan</th>
                                    <th className="px-6 py-5 text-center">Thời lượng</th>
                                    <th className="px-6 py-5 text-center">Tần suất</th>
                                    <th className="px-6 py-5 text-center">Dịch vụ</th>
                                    <th className="px-6 py-5 text-right pr-10">Giá từ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 uppercase font-bold text-[13px]">
                                {tours.map((tour, index) => (
                                    <tr key={tour.MaTour} className="group hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                                        <td className="px-6 py-5 text-center text-gray-400 group-hover:text-primary transition-colors">{index + 1}</td>
                                        <td className="px-6 py-5">
                                            <Link to={`/tour/${tour.MaTour}`} className="text-navy group-hover:text-primary transition-colors block">
                                                {tour.TenTour}
                                                <div className="text-[10px] text-gray-400 font-medium lowercase tracking-normal mt-1 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${tour.SoLich > 0 ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`}></span>
                                                    {tour.SoLich > 0 ? 'Đang mở bán trực tuyến' : 'Đang cập nhật lịch mới'}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 text-center text-gray-500">{tour.ThoiGian || 'Chưa cập nhật'}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] ${tour.SoLich > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {tour.SoLich > 0 ? 'Hằng ngày' : 'Sắp diễn ra'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center text-[11px] text-gray-400 font-black">★★★☆☆</td>
                                        <td className="px-6 py-5 text-right pr-10">
                                            <div className="flex flex-col items-end">
                                                <span className="text-red-600 text-lg font-black tracking-tighter">
                                                    {new Intl.NumberFormat('vi-VN').format(tour.GiaGoc)}đ
                                                </span>
                                                {tour.SoLich > 0 ? (
                                                    <Link to={`/dat-tour/${tour.MaTour}`} className="text-[10px] text-primary hover:underline mt-1 bg-primary/10 px-2 py-0.5 rounded">Đặt chỗ ngay</Link>
                                                ) : (
                                                    <Link to="/lien-he" className="text-[10px] text-gray-500 hover:underline mt-1 bg-gray-100 px-2 py-0.5 rounded italic">Liên hệ tư vấn</Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Header Banner Section */}
            <div className="bg-navy pt-16 pb-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
                </div>
                
                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-[12px] tracking-[4px] mb-4">
                                <span className="w-8 h-[1px] bg-primary"></span>
                                Cập nhật lịch trình
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                                Lịch khởi hành <br />
                                <span className="text-primary italic">hằng ngày</span>
                            </h1>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-white/40 font-bold uppercase text-[13px] tracking-widest leading-relaxed">
                                Cam kết 1 khách cũng đi <br />
                                Khởi hành liên tục 24/7
                            </p>
                            <div className="mt-4 flex gap-4 justify-end">
                                <div className="text-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    <div className="text-primary text-xl font-black">50+</div>
                                    <div className="text-white/40 text-[9px] font-bold uppercase">Tour hot</div>
                                </div>
                                <div className="text-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    <div className="text-primary text-xl font-black">100%</div>
                                    <div className="text-white/40 text-[9px] font-bold uppercase">Uy tín</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl -mt-16">
                <div className="bg-white rounded-[32px] shadow-2xl shadow-navy/5 p-8 md:p-12 border border-gray-100 mb-16 relative overflow-hidden">
                    <div className="max-w-3xl relative z-10">
                        <p className="text-lg text-navy/80 font-medium leading-relaxed mb-6">
                            Chào mừng bạn đến với hệ thống đặt tour tự động. Tại <b>Du Lịch Việt</b>, chúng tôi hiểu rằng thời gian của bạn là quý giá. Vì vậy, mọi hành trình đều được thiết kế để <b className="text-primary">khởi hành mỗi ngày</b>, mang lại sự linh hoạt tuyệt đối cho kế hoạch du lịch của bạn.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                <span className="text-2xl text-primary">✓</span>
                                <span className="text-[13px] font-bold text-navy uppercase tracking-tight">Giá tốt nhất thị trường</span>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                <span className="text-2xl text-primary">✓</span>
                                <span className="text-[13px] font-bold text-navy uppercase tracking-tight">Xác nhận đơn ngay lập tức</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] scale-150 pointer-events-none hidden lg:block uppercase font-black text-navy text-[100px] leading-none">
                        TRAVEL<br />VIETNAM
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-navy/40 font-black uppercase tracking-widest text-[12px]">Đang đồng bộ dữ liệu...</p>
                    </div>
                ) : (
                    <div>
                        {renderTable(hoChiMinhTours, "Tour khởi hành từ Sài Gòn")}
                        {renderTable(canThoTours, "Tour khởi hành từ Cần Thơ")}
                        {renderTable(otherTours, "Hành trình vùng miền khác")}
                    </div>
                )}
                
                {/* FAQ Section Style bottom */}
                <div className="bg-navy rounded-[40px] p-10 md:p-16 mb-20 text-center relative overflow-hidden shadow-2xl shadow-navy/20">
                    <div className="absolute inset-0 bg-primary/5"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">Bạn chưa tìm thấy lịch trình phù hợp?</h2>
                        <p className="text-white/60 mb-8 max-w-2xl mx-auto font-medium">Chúng tôi còn rất nhiều tour thiết kế riêng và chương trình đặc biệt dành cho khách đoàn hoặc yêu cầu cá nhân.</p>
                        <Link to="/lien-he" className="inline-flex items-center gap-3 bg-white text-navy px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-black/20">
                            Liên hệ tư vấn ngay
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            ` }} />
        </div>
    );
}

export default LichKhoiHanhKhachHang;
