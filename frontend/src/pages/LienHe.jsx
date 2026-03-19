import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // [ĐỒNG BỘ] Popup đẹp

function LienHe() {
    const [formData, setFormData] = useState({
        HoTen: '',
        Email: '',
        SoDienThoai: '',
        ChuDe: '',
        NoiDung: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/lien-he', formData)
            .then(res => {
                // [ĐỒNG BỘ] Thông báo gửi liên hệ thành công
                Swal.fire({ icon: 'success', title: 'Gửi thành công!', text: 'Chúng tôi sẽ phản hồi bạn sớm nhất có thể!', confirmButtonColor: '#2563eb' });
                // Reset form
                setFormData({ HoTen: '', Email: '', SoDienThoai: '', ChuDe: '', NoiDung: '' });
            })
            .catch(err => Swal.fire({ icon: 'error', title: 'Gửi thất bại!', text: 'Lỗi: ' + err.message, confirmButtonColor: '#dc2626' }));
    };

    return (
        <div className="bg-[#faf9fa] min-h-screen py-16 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white">

                    {/* BÊN TRÁI: HÌNH ẢNH & THÔNG TIN (Đồng bộ Navy & Gold) */}
                    <div className="md:w-5/12 relative p-12 flex flex-col justify-start gap-16 text-white overflow-hidden">
                        {/* Background Image (Clear) */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80"
                                alt="Contact Background"
                                className="w-full h-full object-cover scale-105"
                            />
                            {/* Gradient Overlay for better readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/70 to-navy/90"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-4xl font-heading font-black mb-6 leading-tight tracking-tight">Gửi lời chào <br /> đến chúng tôi<span className="text-accent text-5xl">!</span></h2>
                            <div className="w-12 h-1 bg-accent mb-6 rounded-full"></div>
                            <p className="text-white/80 text-sm leading-relaxed max-w-xs font-medium">
                                Bạn có thắc mắc hay cần tư vấn về chuyến đi mơ ước của mình? Đừng ngần ngại liên hệ nhé!
                            </p>
                        </div>

                        <div className="relative z-10 space-y-9">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-xl border border-white/20 text-accent">📍</div>
                                <div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-accent/80 mb-1.5">Trụ sở chính</h4>
                                    <p className="text-[14px] font-bold text-white/95 leading-snug">273 Nguyễn Văn Linh, Long Tuyền, Bình Thủy, Cần Thơ</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-xl border border-white/20 text-accent">📞</div>
                                <div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-accent/80 mb-1.5">Hotline hỗ trợ</h4>
                                    <p className="text-2xl font-black text-white tracking-tighter">0354 858 892</p>
                                    <p className="text-[10px] text-accent/60 font-medium italic mt-0.5">Hỗ trợ khách hàng 24/7</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-xl border border-white/20 text-accent">📧</div>
                                <div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-accent/80 mb-1.5">Email văn phòng</h4>
                                    <p className="text-[14px] font-bold text-white/95">phuochien847@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Social links removed as requested */}
                    </div>

                    {/* BÊN PHẢI: FORM GỬI TIN NHẮN (Clean & Sharp) */}
                    <div className="md:w-7/12 p-12 lg:p-20 bg-white">
                        <div className="mb-14">
                            <h3 className="text-[32px] font-heading font-black text-navy mb-3 tracking-tight">Để lại lời nhắn</h3>
                            <p className="text-gray-400 text-sm font-medium">Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 24 giờ làm việc.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-navy/50 uppercase tracking-widest ml-1">Họ và tên</label>
                                    <input
                                        type="text" name="HoTen" required
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-[14px] font-bold text-navy focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.HoTen} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-navy/50 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email" name="Email" required
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-[14px] font-bold text-navy focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        placeholder="nva@example.com"
                                        value={formData.Email} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-navy/50 uppercase tracking-widest ml-1">Số điện thoại</label>
                                    <input
                                        type="text" name="SoDienThoai"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-[14px] font-bold text-navy focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        placeholder="0123.456.789"
                                        value={formData.SoDienThoai} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-navy/50 uppercase tracking-widest ml-1">Chủ đề</label>
                                    <input
                                        type="text" name="ChuDe" required
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-[14px] font-bold text-navy focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        placeholder="Bạn cần hỗ trợ gì?"
                                        value={formData.ChuDe} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-bold text-navy/50 uppercase tracking-widest ml-1">Nội dung câu hỏi</label>
                                <textarea
                                    name="NoiDung" rows="5" required
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl py-5 px-6 text-[14px] font-bold text-navy focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                                    placeholder="Viết lời nhắn của bạn tại đây..."
                                    value={formData.NoiDung} onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-navy text-white font-black py-7 rounded-2xl shadow-[0_20px_40px_-10px_rgba(13,148,136,0.3)] hover:shadow-navy/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-[13px] tracking-widest uppercase">
                                GỬI YÊU CẦU NGAY
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LienHe;
