import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HiCurrencyDollar, HiGlobe, HiClipboardList, HiUsers, HiArrowRight } from 'react-icons/hi';

// Đăng ký các thành phần cho Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminDashboard() {
    const [stats, setStats] = useState({
        tongDoanhThu: 0,
        tongTour: 0,
        tongDon: 0,
        tongKhach: 0,
        chartDataDay: [],
        chartDataMonth: [],
        chartDataYear: []
    });
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('month'); // 'day', 'month', 'year'
    const [dateFilters, setDateFilters] = useState({
        startDate: '',
        endDate: ''
    });

    const fetchStats = (filters = dateFilters) => {
        setLoading(true);
        let url = '/api/admin/dashboard';
        if (filters.startDate && filters.endDate) {
            url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
        }

        axios.get(url)
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy thống kê:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchStats();
    };

    const clearFilters = () => {
        const cleared = { startDate: '', endDate: '' };
        setDateFilters(cleared);
        fetchStats(cleared);
    };

    // Lấy dữ liệu theo bộ lọc
    let currentData = [];
    if (timeFilter === 'day') currentData = stats.chartDataDay || [];
    if (timeFilter === 'month') currentData = stats.chartDataMonth || [];
    if (timeFilter === 'year') currentData = stats.chartDataYear || [];

    // Cấu hình dữ liệu biểu đồ
    const hasData = currentData && currentData.length > 0;
    const chartDataOptions = {
        labels: hasData ? currentData.map(item => item.ThoiGian) : ['T1', 'T2', 'T3', 'T4', 'T5'],
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: hasData ? currentData.map(item => item.DoanhThu) : [10000000, 20000000, 15000000, 30000000, 45000000],
                borderColor: '#10b981', // Màu xanh lục lá cây giống chứng khoán đi lên
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0, // 0 = Đường thẳng gấp khúc giống chứng khoán
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: '#10b981',
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const chartConfig = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false } // Ẩn title mặc định để dùng custom UI
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) return <div className="text-center py-20 bg-gray-50 min-h-screen">Đang tải dữ liệu thống kê...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen p-4 md:p-8 font-sans text-slate-200">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Bảng <span className="text-blue-400 font-bold">Điều Khiển</span>
                        </h1>
                    </div>
                    
                    {/* BỘ LỌC NGÀY THÁNG - ĐỒNG BỘ DARK THEME */}
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1">Từ ngày</label>
                            <input 
                                type="date" 
                                className="bg-slate-800 border-slate-600 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-white shadow-sm"
                                value={dateFilters.startDate}
                                onChange={(e) => setDateFilters({...dateFilters, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1">Đến ngày</label>
                            <input 
                                type="date" 
                                className="bg-slate-800 border-slate-600 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-white shadow-sm"
                                value={dateFilters.endDate}
                                onChange={(e) => setDateFilters({...dateFilters, endDate: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                            Lọc
                        </button>
                        <button type="button" onClick={clearFilters} className="bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all active:scale-95">
                            Xem tất cả
                        </button>
                    </form>
                </div>


                {/* 4 Khối Thống Kê Nhanh (Glassmorphism) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Block 1 */}
                    <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-slate-700/50 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300 group">
                        <div className="bg-blue-500/20 p-4 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                            <HiCurrencyDollar size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tổng Doanh Thu</p>
                            <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.tongDoanhThu || 0)}
                            </h3>
                        </div>
                    </div>

                    {/* Block 2 */}
                    <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-slate-700/50 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300 group">
                        <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                            <HiGlobe size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tour Hoạt Động</p>
                            <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{stats.tongTour}</h3>
                        </div>
                    </div>

                    {/* Block 3 */}
                    <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-slate-700/50 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300 group">
                        <div className="bg-amber-500/20 p-4 rounded-2xl text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner">
                            <HiClipboardList size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Số Đơn Hàng</p>
                            <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{stats.tongDon}</h3>
                        </div>
                    </div>

                    {/* Block 4 */}
                    <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-slate-700/50 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300 group">
                        <div className="bg-purple-500/20 p-4 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-inner">
                            <HiUsers size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Khách Hàng</p>
                            <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">{stats.tongKhach}</h3>
                        </div>
                    </div>
                </div>

                {/* Khu vực Biểu đồ & Top danh sách */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột trái (Biểu đồ chiếm 2/3) */}
                    <div className="lg:col-span-2 bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-6">
                            <h3 className="font-black text-white text-xl uppercase tracking-tighter italic">📈 Doanh Thu <span className="text-blue-400">Chi Tiết</span></h3>
                            <div className="flex bg-slate-900/50 rounded-2xl p-1 border border-slate-700/50">
                                <button
                                    onClick={() => setTimeFilter('day')}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${timeFilter === 'day' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Ngày
                                </button>
                                <button
                                    onClick={() => setTimeFilter('month')}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${timeFilter === 'month' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Tháng
                                </button>
                                <button
                                    onClick={() => setTimeFilter('year')}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${timeFilter === 'year' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Năm
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative min-h-[350px]">
                            <Line data={chartDataOptions} options={{
                                ...chartConfig,
                                plugins: { ...chartConfig.plugins, legend: { ...chartConfig.plugins.legend, labels: { color: '#94a3b8', font: { weight: 'bold' } } } },
                                scales: {
                                    y: { ...chartConfig.scales.y, grid: { color: 'rgba(71, 85, 105, 0.2)' }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
                                    x: { ...chartConfig.scales.x, ticks: { color: '#64748b', font: { weight: 'bold' } } }
                                }
                            }} />
                        </div>
                    </div>

                    {/* Cột phải (Hành Động Nhanh) */}
                    <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-slate-700/50">
                        <h3 className="font-black text-white text-xl uppercase tracking-tighter mb-6 border-b border-slate-700/50 pb-4 italic">⚡ Thao Tác <span className="text-blue-400">Nhanh</span></h3>
                        <div className="space-y-4">
                            <a href="/admin/don-hang" className="group flex justify-between items-center p-5 bg-slate-900/40 hover:bg-blue-600/10 rounded-2xl text-slate-300 font-bold transition-all border border-slate-700/30 hover:border-blue-500/50">
                                <span className="text-sm group-hover:text-blue-400 transition-colors">Duyệt & Quản lý đơn hàng</span>
                                <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <HiArrowRight />
                                </div>
                            </a>
                            <a href="/admin/quan-ly-tour" className="group flex justify-between items-center p-5 bg-slate-900/40 hover:bg-emerald-600/10 rounded-2xl text-slate-300 font-bold transition-all border border-slate-700/30 hover:border-emerald-500/50">
                                <span className="text-sm group-hover:text-emerald-400 transition-colors">Thiết lập & Đăng Tour mới</span>
                                <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <HiArrowRight />
                                </div>
                            </a>
                            <a href="/admin/khach-hang" className="group flex justify-between items-center p-5 bg-slate-900/40 hover:bg-purple-600/10 rounded-2xl text-slate-300 font-bold transition-all border border-slate-700/30 hover:border-purple-500/50">
                                <span className="text-sm group-hover:text-purple-400 transition-colors">Kiểm soát khách hàng</span>
                                <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <HiArrowRight />
                                </div>
                            </a>
                            
                            <div className="mt-8 pt-6 border-t border-slate-700/50">
                                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1">Trạng thái hệ thống</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm text-slate-400 font-bold italic">Bảo mật & Ổn định</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
