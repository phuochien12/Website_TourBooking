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
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-[#ec1276] pl-4">Bảng Điều Khiển (Dashboard)</h1>
                    
                    {/* BỘ LỌC NGÀY THÁNG - ĐỒNG BỘ QUẢN LÝ ĐƠN HÀNG */}
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 italic">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đơn đặt từ ngày</label>
                            <input 
                                type="date" 
                                className="border-gray-100 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-navy"
                                value={dateFilters.startDate}
                                onChange={(e) => setDateFilters({...dateFilters, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đến ngày</label>
                            <input 
                                type="date" 
                                className="border-gray-100 border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-navy"
                                value={dateFilters.endDate}
                                onChange={(e) => setDateFilters({...dateFilters, endDate: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="bg-navy text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-sm active:scale-95">
                            Lọc
                        </button>
                        <button type="button" onClick={clearFilters} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95">
                            Xem tất cả
                        </button>
                    </form>
                </div>


                {/* 4 Khối Thống Kê Nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Block 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                            <HiCurrencyDollar size={28} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Tổng Doanh Thu</p>
                            <h3 className="text-2xl font-black text-navy">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.tongDoanhThu || 0)}
                            </h3>
                        </div>
                    </div>

                    {/* Block 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="bg-green-50 p-4 rounded-xl text-green-600">
                            <HiGlobe size={28} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Tour Hoạt Động</p>
                            <h3 className="text-2xl font-black text-navy">{stats.tongTour}</h3>
                        </div>
                    </div>

                    {/* Block 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="bg-orange-50 p-4 rounded-xl text-orange-600">
                            <HiClipboardList size={28} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Số Đơn Hàng</p>
                            <h3 className="text-2xl font-black text-navy">{stats.tongDon}</h3>
                        </div>
                    </div>

                    {/* Block 4 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="bg-purple-50 p-4 rounded-xl text-purple-600">
                            <HiUsers size={28} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Khách Hàng</p>
                            <h3 className="text-2xl font-black text-navy">{stats.tongKhach}</h3>
                        </div>
                    </div>
                </div>

                {/* Khu vực Biểu đồ & Top danh sách */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột trái (Biểu đồ chiếm 2/3) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Biểu Đồ Doanh Thu Chuyên Sâu</h3>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setTimeFilter('day')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeFilter === 'day' ? 'bg-white shadow text-[#10b981]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Theo Ngày
                                </button>
                                <button
                                    onClick={() => setTimeFilter('month')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeFilter === 'month' ? 'bg-white shadow text-[#10b981]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Theo Tháng
                                </button>
                                <button
                                    onClick={() => setTimeFilter('year')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeFilter === 'year' ? 'bg-white shadow text-[#10b981]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Theo Năm
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative min-h-[300px]">
                            <Line data={chartDataOptions} options={chartConfig} />
                        </div>
                    </div>

                    {/* Cột phải (Danh sách action nhanh - 1/3) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 text-lg mb-4 border-b pb-2">Hành Động Nhanh</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="/admin/don-hang" className="group flex justify-between items-center p-4 bg-gray-50 hover:bg-primary/5 rounded-2xl text-navy font-bold transition-all border border-transparent hover:border-primary/20">
                                    <span>Quản lý đơn đặt tour & Duyệt đơn</span>
                                    <HiArrowRight className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-primary" />
                                </a>
                            </li>
                            <li>
                                <a href="/admin/quan-ly-tour" className="group flex justify-between items-center p-4 bg-gray-50 hover:bg-primary/5 rounded-2xl text-navy font-bold transition-all border border-transparent hover:border-primary/20">
                                    <span>Thêm Tour mới / Phân công</span>
                                    <HiArrowRight className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-primary" />
                                </a>
                            </li>
                            <li>
                                <a href="/admin/khach-hang" className="group flex justify-between items-center p-4 bg-gray-50 hover:bg-primary/5 rounded-2xl text-navy font-bold transition-all border border-transparent hover:border-primary/20">
                                    <span>Quản lý danh sách khách hàng</span>
                                    <HiArrowRight className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-primary" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
