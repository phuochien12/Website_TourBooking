const { sql, connectDB } = require('./db.js');

const newTours = [
    { TenTour: 'TOUR CẦN THƠ - CHÂU ĐỐC - MIẾU BÀ CHÚA XỨ - RỪNG TRÀ SƯ 1 NGÀY', GiaGoc: 1250000, PhanTramGiam: 17, ThoiGian: '1 Ngày', DiemKhoiHanh: 'CẦN THƠ' },
    { TenTour: 'TOUR KHỞI HÀNH TỪ CẦN THƠ - CHÂU ĐỐC - CÀ MAU - BẠC LIÊU -...', GiaGoc: 3400000, PhanTramGiam: 7, ThoiGian: '3 Ngày 2 Đêm', DiemKhoiHanh: 'CẦN THƠ' },
    { TenTour: 'TOUR MIỀN TÂY 2N1Đ: KHÁM PHÁ RỪNG TRÀM HẬU GIANG | TRẢI...', GiaGoc: 1999000, PhanTramGiam: 7, ThoiGian: '2 Ngày 1 Đêm', DiemKhoiHanh: 'TP HCM' },
    { TenTour: 'HÀNH TRÌNH VỀ MIỀN ĐẤT MŨI: SÀI GÒN - CẦN THƠ - SÓC TRĂNG - C...', GiaGoc: 2300000, PhanTramGiam: 10, ThoiGian: '2 Ngày 2 Đêm', DiemKhoiHanh: 'SGN' },
    { TenTour: 'TOUR MIỀN TÂY THAM QUAN 04 TỈNH: CẦN THƠ - CÀ MAU - BẠC...', GiaGoc: 1750000, PhanTramGiam: 8, ThoiGian: '2 Ngày 1 Đêm', DiemKhoiHanh: 'CẦN THƠ' },
    { TenTour: 'TOUR CÀ MAU 01: SÀI GÒN - ĐẤT MŨI - BẠC LIÊU - MẸ NAM HẢI - ĐI...', GiaGoc: 1690000, PhanTramGiam: 11, ThoiGian: '2 Ngày 2 Đêm', DiemKhoiHanh: 'SGN' },
    { TenTour: 'TOUR VIP CẦN THƠ 3N2Đ KHÁM PHÁ MIỀN TÂY – MIỀN ĐẤT HẠNH...', GiaGoc: 2950000, PhanTramGiam: 8, ThoiGian: '3 Ngày 2 Đêm', DiemKhoiHanh: 'SÀI GÒN' },
    { TenTour: 'TOUR MIỀN TÂY 77: SGN - LÀNG HOA SA ĐÉC - CHÙA LÁ SEN - CẦN...', GiaGoc: 1950000, PhanTramGiam: 13, ThoiGian: '2 Ngày 1 Đêm', DiemKhoiHanh: 'SGN' },
    { TenTour: 'TOUR THAM QUAN LÀNG NỔI TÂN LẬP - NHÀ CỔ PHƯỚC LỘC THỌ -...', GiaGoc: 900000, PhanTramGiam: 14, ThoiGian: '1 Ngày', DiemKhoiHanh: 'SÀI GÒN' },
    { TenTour: 'TOUR MIỀN TÂY VIP 18 : SGN - MỸ THO - BẾN TRE - CẦN THƠ - CÀ M...', GiaGoc: 3950000, PhanTramGiam: 6, ThoiGian: '4 Ngày 3 Đêm', DiemKhoiHanh: 'SGN' },
    { TenTour: 'TOUR VIP 2N1Đ KHÁM PHÁ CHỢ NỔI CÁI RĂNG - TRẢI NGHIỆM TÂY ĐÔ...', GiaGoc: 1550000, PhanTramGiam: 11, ThoiGian: '2 Ngày 1 Đêm', DiemKhoiHanh: 'SGN' },
    { TenTour: 'TOUR MIỀN TÂY 1 NGÀY TÁT MƯƠNG BẮT CÁ', GiaGoc: 800000, PhanTramGiam: 16, ThoiGian: '1 Ngày', DiemKhoiHanh: 'SGN' }
];

async function seedTours() {
    try {
        console.log(`⏳ Kết nối tới DB...`);
        const pool = await connectDB();

        try {
            await pool.request().query("SELECT TOP 1 PhanTramGiam FROM Tour");
        } catch (err) {
            console.log("Thêm cột PhanTramGiam...");
            await pool.request().query("ALTER TABLE Tour ADD PhanTramGiam FLOAT");
        }

        for (const tour of newTours) {
            await pool.request()
                .input('TenTour', sql.NVarChar, tour.TenTour)
                .input('MoTa', sql.NVarChar, 'Đây là tour tự động sinh ra để phục vụ việc test giao diện MIỀN TÂY.')
                .input('GiaGoc', sql.Float, tour.GiaGoc)
                .input('PhanTramGiam', sql.Float, tour.PhanTramGiam)
                .input('ThoiGian', sql.NVarChar, tour.ThoiGian)
                .input('DiemKhoiHanh', sql.NVarChar, tour.DiemKhoiHanh)
                // Default image URLs using unsplash for some variety
                .input('AnhBia', sql.NVarChar, 'https://images.unsplash.com/photo-1528127269322-53982823b881?auto=format&fit=crop&q=80&w=600')
                .query(`
                    INSERT INTO Tour (TenTour, MoTa, GiaGoc, PhanTramGiam, ThoiGian, DiemKhoiHanh, AnhBia, MaDiemDi, MaDiemDen, MaLoai, SoNgay, SoDem, NoiBat, TrangThai)
                    VALUES (@TenTour, @MoTa, @GiaGoc, @PhanTramGiam, @ThoiGian, @DiemKhoiHanh, @AnhBia, 1, 1, 1, 1, 1, 1, 1)
                `);
            console.log(`✅ Đã thêm: ${tour.TenTour}`);
        }

        console.log("Hoàn tất!");
        process.exit(0);
    } catch (err) {
        console.error("Lỗi:", err);
        process.exit(1);
    }
}

seedTours();
